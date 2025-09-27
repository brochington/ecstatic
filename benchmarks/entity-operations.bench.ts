import { bench, describe } from 'vitest';
import { World, Entity } from '../src/index';

// Define component types for benchmarking
class Position {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Velocity {
  vx: number;
  vy: number;

  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

class Health {
  value: number;
  max: number;

  constructor(value = 100, max = 100) {
    this.value = value;
    this.max = max;
  }
}

type BenchComponents = Position | Velocity | Health;

describe('Entity Operations', () => {
  bench('create entity', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity();
    entity.destroy();
  });

  bench('create entity with components', () => {
    const world = new World<BenchComponents>();
    const entity = world
      .createEntity()
      .add(new Position(10, 20))
      .add(new Velocity(1, 2))
      .add(new Health(50, 100));
    entity.destroy();
  });

  bench('add component to entity', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity();
    entity.add(new Position(10, 20));
    entity.destroy();
  });

  bench('remove component from entity', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity().add(new Position(10, 20));
    entity.remove(Position);
    entity.destroy();
  });

  bench('get component from entity', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity().add(new Position(10, 20));
    const position = entity.get(Position);
    entity.destroy();
  });

  bench('entity has component check', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity().add(new Position(10, 20));
    const hasPosition = entity.has(Position);
    entity.destroy();
  });

  bench('bulk entity creation (1000 entities)', () => {
    const world = new World<BenchComponents>();
    const entities: Entity<BenchComponents>[] = [];

    for (let i = 0; i < 1000; i++) {
      entities.push(world.createEntity());
    }

    // Cleanup
    entities.forEach(entity => entity.destroy());
  });

  bench('bulk component addition (1000 components)', () => {
    const world = new World<BenchComponents>();
    const entities: Entity<BenchComponents>[] = [];

    // Create entities
    for (let i = 0; i < 1000; i++) {
      entities.push(world.createEntity());
    }

    // Add components
    entities.forEach(entity => {
      entity.add(new Position(Math.random() * 100, Math.random() * 100));
    });

    // Cleanup
    entities.forEach(entity => entity.destroy());
  });
});
