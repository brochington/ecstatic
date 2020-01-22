import uuidv4 from 'uuid/v4';
import World from './World';
import { Component } from './Component';

export type EntityId = string;

class Entity<CT> {
  id: string;
  world: World<CT>;

  constructor(world: World<CT>) {
    this.id = uuidv4();
    this.world = world;

    /*
    Registering with the World.
    */
    this.world.registerEntity(this.id);
  }

  add(component: Component<CT>): void {
    this.world.set(this.id, component)
  }
}

export function createEntity<CT>(
  world: World<CT>,
): Entity<CT> {
  const entity = new Entity<CT>(world);

  return entity;
}
