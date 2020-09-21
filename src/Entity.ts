import { v4 as uuidv4 } from 'uuid';
import World from './World';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import { CompTypes } from 'interfaces';

export type EntityId = string;

type Class<T> = { new (...args: any[]): T };

export default class Entity<CT extends Class<any>> {
  private _id: string;
  private _world: World<CT>;

  constructor(world: World<CT>) {
    this._id = uuidv4();
    this._world = world;

    /*
    Registering with the World.
    */
    this._world.registerEntity(this);
  }

  /**
   * Add a component to an Entity, doh.
   */
  add(component: InstanceType<CT>): this {
    this._world.set(this._id, component);

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
  has(cType: CT): boolean {
    const cc = this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();

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
  get(cType: CT): CT {
    const cc = this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();

    const component = cc.get(cType);

    return component;
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection
   */
  getAll(): ComponentCollection<CT> {
    return this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();
  }

  /**
   * Remove a component from an entity.
   * @param cType A component class, eg MyComponent
   */
  remove(cType: CT): this {
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

    return this
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

  destroy(): void {
    this._world.destroyEntity(this._id);
  }

  get id(): string {
    return this._id;
  }

  get world(): World<CT> {
    return this._world;
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection.
   * Does the same thing as entityInstance.getAll().
   */
  get components(): ComponentCollection<CT> {
    return this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();
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
}

export function createEntity<CT extends Class<any>>(
  world: World<CT>,
): Entity<CT> {
  const entity = new Entity<CT>(world);

  return entity;
}


