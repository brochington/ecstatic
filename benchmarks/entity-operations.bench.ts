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
  // --- SETUP ---
  const staticWorld = new World<BenchComponents>();
  const staticEntity = staticWorld.createEntity().add(new Position(10, 20));

  // --- BENCHMARKS ---

  bench('create entity (lifecycle)', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity();
    // We don't destroy here to avoid measuring destruction cost,
    // but in real app we would. Memory might climb during bench but
    // garbage collector handles it for short runs.
  });

  bench('create entity and destroy (full lifecycle)', () => {
    const world = new World<BenchComponents>();
    const entity = world.createEntity();
    entity.destroy();
  });

  bench('create entity with components', () => {
    const world = new World<BenchComponents>();
    world
      .createEntity()
      .add(new Position(10, 20))
      .add(new Velocity(1, 2))
      .add(new Health(50, 100));
  });

  bench('add component to entity (new allocation)', () => {
    // We have to create a new entity every time to add a component fresh
    const world = new World<BenchComponents>();
    const entity = world.createEntity();
    entity.add(new Position(10, 20));
  });

  bench('get component from entity (Hot Path)', () => {
    // This is the most critical metric for systems
    staticEntity.get(Position);
  });

  bench('entity has component check (Hot Path)', () => {
    staticEntity.has(Position);
  });

  bench('entity has component check (Miss) (Hot Path)', () => {
    staticEntity.has(Velocity);
  });
});
