import { v4 as uuidv4 } from "uuid";
import World, { ClassConstructor } from "./World";
import ComponentCollection from "./ComponentCollection";
import { Tag } from "./Tag";
import DevEntity from "./DevEntity";

import SimpleFSM from "./SimpleFSM";

export type EntityId = string;

type EntityState =
  | "creating"
  | "created"
  | "destroying"
  | "destroyed"
  | "error";

export interface EntityCompEventArgs<CT> {
  world: World<CT>;
  component: CT;
}

export default class Entity<CT> {
  private _id: string;
  private _world: World<CT>;

  private _error: Error | null;

  private _state: SimpleFSM<EntityState, EntityState>;

  constructor(world: World<CT>) {
    this._id = uuidv4();
    this._world = world;

    this._error = null;

    const fsmTransition = (
      ns: EntityState
    ): EntityState => {
      if (ns === "error" || this._error) return "error";
      return ns;
    };

    this._state = new SimpleFSM<EntityState, EntityState>("creating", {
      creating: fsmTransition,
      created: fsmTransition,
      destroying: fsmTransition,
      destroyed: () => "destroyed",
      error: () => "error",
    });

    /*
    Registering with the World.
    */
    this._world.registerEntity(this);

    if (this._world.systems.compNamesBySystemName.size === 0) {
      this._state.next('created');
    }
  }

  get state(): EntityState {
    return this._state.current;
  }

  checkState(possibleState: EntityState): boolean {
    return this._state.is(possibleState);
  }

  /* LifeCycle methods, meant to be overridden */

  onCreate(world: World<CT>): void {
    // abstract
  }

  onDestroy(world: World<CT>): void {
    // abstract
  }

  onComponentAdd(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  onTrackedComponentUpdate(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  onComponentRemove(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  /**
   * Add a component to an Entity, doh.
   */
  add(component: CT): this {
    this._world.add(this._id, component);

    return this;
  }

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): this {
    const entitySet = this._world.entitiesByTags.has(tag)
      ? this._world.entitiesByTags.get(tag)
      : new Set<EntityId>();

    if (entitySet) {
      entitySet.add(this._id);
      this._world.entitiesByTags.set(tag, entitySet);
    }

    return this;
  }

  /**
   * Determines if an entity has a component related to it.
   */
  has(cType: ClassConstructor<CT>): boolean {
    const cc =
      this._world.componentCollections.get(this._id) ||
      new ComponentCollection<CT>();

    return cc.has(cType);
  }

  /**
   * Check to see if an entity tagged with a given tag.
   */
  hasTag(tag: Tag): boolean {
    if (this._world.entitiesByTags.has(tag)) {
      const entitySet = this._world.entitiesByTags.get(tag);
      if (entitySet) {
        return entitySet.has(this._id);
      }
    }

    return false;
  }

  /**
   * Get a component that belongs to an entity.
   */
  get<T extends CT>(cl: ClassConstructor<T>): InstanceType<typeof cl> {
    const cc =
      this._world.componentCollections.get(this._id) ||
      new ComponentCollection<CT>();

    const component = cc.get<T>(cl);

    return component;
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection
   */
  getAll(): ComponentCollection<CT> {
    return (
      this._world.componentCollections.get(this._id) ||
      new ComponentCollection<CT>()
    );
  }

  /**
   * Remove a component from an entity.
   * @param cType A component class, eg MyComponent
   */
  remove(cType: ClassConstructor<CT>): this {
    this._world.remove(this._id, cType);

    return this;
  }

  /**
   * Remove a tag from an entity
   */
  removeTag(tag: Tag): this {
    if (this._world.entitiesByTags.has(tag)) {
      const entitySet = this._world.entitiesByTags.get(tag);

      if (entitySet) {
        entitySet.delete(this._id);

        if (entitySet.size === 0) {
          this._world.entitiesByTags.delete(tag);
        }
      }
    }
    return this;
  }

  /** Clears all components from an Entity */
  clear(): this {
    this._world.clearEntityComponents(this._id);

    return this;
  }

  /**
   * Remove all tags on an entity
   */
  clearTags(): this {
    for (const [tag, entitySet] of this._world.entitiesByTags.entries()) {
      entitySet.delete(this._id);

      if (entitySet.size === 0) {
        this._world.entitiesByTags.delete(tag);
      }
    }

    return this;
  }

  finishCreation(): void {
    this._state.next('created');
  }

  destroy(): void {
    // If no systems are added, the destroy immediately.
    if (this._world.systems.compNamesBySystemName.size === 0) {
      this.destroyImmediately();
      return;
    }

    if (!this._state.is("created")) {
      throw new Error(
        "Ecstatic: Unable to destroy if it isn't created, or already destroyed"
      );
    }

    // Mark as "destroying" so that systems can act on it before actually being destroyed.
    this._state.next('destroying');
  }

  get id(): string {
    return this._id;
  }

  get world(): World<CT> {
    return this._world;
  }

  destroyImmediately(): void {
    // Right now calling before the actual destorying of the entity.
    // Might want to change this to post destruction in the future, who knows.
    this.onDestroy(this._world);

    // Actually destroy entity.
    this._world.destroyEntity(this._id); // should return an error??

    this._state.next('destroyed');
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection.
   * Does the same thing as entityInstance.getAll().
   */
  get components(): ComponentCollection<CT> {
    return (
      this._world.componentCollections.get(this._id) ||
      new ComponentCollection<CT>()
    );
  }

  /**
   * Retrieves all the tags that have been added to this entity.
   */
  get tags(): Set<Tag> {
    const tags = new Set<Tag>();
    for (const [tag, entitySet] of this._world.entitiesByTags.entries()) {
      if (entitySet.has(this._id)) {
        tags.add(tag);
      }
    }

    return tags;
  }

  /**
   * Convert Entity to a DevEntity. Very helpful in for debugging.
   */
  toDevEntity(): DevEntity<CT> {
    return new DevEntity<CT>(this, this._world);
  }
}
