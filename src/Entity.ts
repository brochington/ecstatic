import uuidv4 from 'uuid/v4';
import World from './World';
import { Component } from './Component';

export type EntityId = string;

export default class Entity<CT> {
  id: string;
  world: World<CT>;

  constructor(world: World<CT>) {
    this.id = uuidv4();
    this.world = world;

    /*
    Registering with the World.
    */
    this.world.registerEntity(this);
  }

  add(component: Component<CT>): Entity<CT> {
    this.world.set(this.id, component);

    return this;
  }

  /** Clears all components from an Entity */
  clear(): Entity<CT> {
    this.world.clearEntityComponents(this.id);

    return this
  }

  destroy(): void {
    this.world.destroyEntity(this.id);
  }

  // TODO: figure out some much better error handling throughout this library.
  get(cType: CT): Component<CT> {
    const cc = this.world.entities.get(this.id);

    if (!cc) {
      console.error('unable to find component collection for specified entity: ', this.id);
    }

    const component = cc.get(cType)

    if (!component) {
      console.error(`Unable to find component of type ${cType} in entity ${this.id}`);
    }


    return component;
  }
}

export function createEntity<CT>(
  world: World<CT>,
): Entity<CT> {
  const entity = new Entity<CT>(world);

  return entity;
}


