import { v4 as uuidv4 } from 'uuid';
import World from './World';
import { Component } from './Component';
import ComponentCollection from './ComponentCollection';

export type EntityId = string;

export default class Entity<CT> {
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
  add(component: Component<CT>): Entity<CT> {
    this._world.set(this._id, component);

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
   * Get a component that belongs to an entity.
   */
  get<C>(cType: CT): C {
    const cc = this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();

    const component = cc.get<C>(cType);

    return component;
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection
   */
  getAll(): ComponentCollection<CT> {
    return this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();
  }

  /**
   * Get all components that have been added to an entity, via a ComponentCollection.
   * Does the same thing as entityInstance.getAll().
   */
  get components(): ComponentCollection<CT> {
    return this._world.componentCollections.get(this._id) || new ComponentCollection<CT>();
  }

  remove(cType: CT): Entity<CT> {
    this._world.remove(this._id, cType);

    return this;
  }

  /** Clears all components from an Entity */
  clear(): Entity<CT> {
    this._world.clearEntityComponents(this._id);

    return this
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
}

export function createEntity<CT>(
  world: World<CT>,
): Entity<CT> {
  const entity = new Entity<CT>(world);

  return entity;
}


