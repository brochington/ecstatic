import World, { ClassConstructor } from './World';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import DevEntity from './DevEntity';
import SimpleFSM from './SimpleFSM';

export type EntityId = number;

export type EntityState =
  | 'creating'
  | 'created'
  | 'destroying'
  | 'destroyed'
  | 'error';

export interface EntityCompEventArgs<CT> {
  world: World<CT>;
  component: CT;
}

export interface ComponentLifecycleEventArgs<CT> {
  world: World<CT>;
  entity: Entity<CT>;
  component: CT;
}

export default class Entity<CT> {
  #id: EntityId;
  #world: World<CT>;
  #error: Error | null;
  #state: SimpleFSM<EntityState, EntityState>;

  get id(): EntityId {
    return this.#id;
  }

  get world(): World<CT> {
    return this.#world;
  }

  get state(): EntityState {
    return this.#state.current;
  }

  constructor(world: World<CT>, id: EntityId) {
    this.#id = id;
    this.#world = world;

    this.#error = null;

    const fsmTransition = (ns: EntityState): EntityState => {
      if (ns === 'error' || this.#error) return 'error';
      return ns;
    };

    this.#state = new SimpleFSM<EntityState, EntityState>('creating', {
      creating: fsmTransition,
      created: fsmTransition,
      destroying: fsmTransition,
      destroyed: () => 'destroyed',
      error: () => 'error',
    });

    /*
    Registering with the World.
    */
    this.#world.registerEntity(this);

    if (this.#world.systems.compNamesBySystemName.size === 0) {
      this.#state.next('created');
    }
  }

  /* LifeCycle methods, meant to be overridden */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onCreate(world: World<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onDestroy(world: World<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onComponentAdd(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onTrackedComponentUpdate(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onComponentRemove(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  /**
   * Add a component to an Entity, doh.
   */
  add<T extends CT>(component: T): this {
    if (!component) {
      throw new Error(`Entity.add: Component is null or undefined`);
    }
    this.#world.add(this.#id, component);

    return this;
  }

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): this {
    const entitySet = this.#world.entitiesByTags.has(tag)
      ? this.#world.entitiesByTags.get(tag)
      : new Set<EntityId>();

    if (entitySet) {
      entitySet.add(this.#id);
      this.#world.entitiesByTags.set(tag, entitySet);
    }

    return this;
  }

  /**
   * Determines if an entity has a component related to it.
   */
  has<T extends CT>(cType: ClassConstructor<T>): boolean {
    const cc =
      this.#world.componentCollections.get(this.#id) ||
      new ComponentCollection<CT>();

    return cc.has(cType);
  }

  /**
   * Determines if an entiy has one or more components related to it.
   */
  hasSome<T extends CT>(cTypes: ClassConstructor<T>[]): boolean {
    const cc =
      this.#world.componentCollections.get(this.#id) ||
      new ComponentCollection<CT>();

    return cc.has(cTypes);
  }

  /**
   * Check to see if an entity tagged with a given tag.
   */
  hasTag(tag: Tag): boolean {
    if (this.#world.entitiesByTags.has(tag)) {
      const entitySet = this.#world.entitiesByTags.get(tag);
      if (entitySet) {
        return entitySet.has(this.#id);
      }
    }

    return false;
  }

  /**
   * Get a component that belongs to an entity.
   */
  get<T extends CT>(cl: ClassConstructor<T>): T {
    const cc =
      this.#world.componentCollections.get(this.#id) ||
      new ComponentCollection<CT>();

    const component = cc.get<T>(cl);

    return component;
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection
   */
  getAll(): ComponentCollection<CT> {
    return (
      this.#world.componentCollections.get(this.#id) ||
      new ComponentCollection<CT>()
    );
  }

  /**
   * Remove a component from an entity.
   * @param cType A component class, eg MyComponent
   */
  remove(cType: ClassConstructor<CT>): this {
    this.#world.remove(this.#id, cType);

    return this;
  }

  /**
   * Remove a tag from an entity
   */
  removeTag(tag: Tag): this {
    if (this.#world.entitiesByTags.has(tag)) {
      const entitySet = this.#world.entitiesByTags.get(tag);

      if (entitySet) {
        entitySet.delete(this.#id);

        if (entitySet.size === 0) {
          this.#world.entitiesByTags.delete(tag);
        }
      }
    }
    return this;
  }

  /** Clears all components from an Entity */
  clear(): this {
    this.#world.clearEntityComponents(this.#id);

    return this;
  }

  /**
   * Remove all tags on an entity
   */
  clearTags(): this {
    for (const [tag, entitySet] of this.#world.entitiesByTags.entries()) {
      entitySet.delete(this.#id);

      if (entitySet.size === 0) {
        this.#world.entitiesByTags.delete(tag);
      }
    }

    return this;
  }

  /**
   * Sets the state of the entity to 'created'. that's it.
   */
  finishCreation(): void {
    this.#state.next('created');
  }

  /**
   * Destroy an entity. Actual destruction is deferred until after the next pass of systems.
   * This gives the systems a chance to do any cleanup that might be needed.
   */
  destroy(): void {
    // If no systems are added, the destroy immediately.
    if (this.#world.systems.compNamesBySystemName.size === 0) {
      this.destroyImmediately();
      return;
    }

    // Mark as "destroying" so that systems can act on it before actually being destroyed.
    this.#state.next('destroying');
  }

  destroyImmediately(): void {
    // Right now calling before the actual destorying of the entity.
    // Might want to change this to post destruction in the future, who knows.
    this.onDestroy(this.#world);

    // Actually destroy entity.
    this.#world.destroyEntity(this.#id); // should return an error??

    this.#state.next('destroyed');
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection.
   * Does the same thing as entityInstance.getAll().
   */
  get components(): ComponentCollection<CT> {
    return (
      this.#world.componentCollections.get(this.#id) ||
      new ComponentCollection<CT>()
    );
  }

  /**
   * Retrieves all the tags that have been added to this entity.
   */
  get tags(): Set<Tag> {
    const tags = new Set<Tag>();
    for (const [tag, entitySet] of this.#world.entitiesByTags.entries()) {
      if (entitySet.has(this.#id)) {
        tags.add(tag);
      }
    }

    return tags;
  }

  /**
   * Convert Entity to a DevEntity. Very helpful in for debugging.
   */
  toDevEntity(): DevEntity<CT> {
    return new DevEntity<CT>(this, this.#world);
  }
}
