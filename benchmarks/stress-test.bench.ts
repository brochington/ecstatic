import { bench, describe } from 'vitest';
import { World } from '../src/index';

// Define component types for stress testing
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

class Sprite {
  image: string;
  constructor(image = 'sprite.png') {
    this.image = image;
  }
}

class AI {
  state: string;
  constructor(state = 'idle') {
    this.state = state;
  }
}

type StressComponents = Position | Velocity | Health | Sprite | AI;

describe('Stress Tests', () => {
  // Setup Large World (10k)
  const largeWorld = new World<StressComponents>();
  for (let i = 0; i < 10000; i++) {
    const entity = largeWorld
      .createEntity()
      .add(new Position(Math.random() * 1000, Math.random() * 1000))
      .add(new Velocity(Math.random() - 0.5, Math.random() - 0.5));

    if (i % 2 === 0) entity.add(new Health());
    if (i % 3 === 0) entity.add(new Sprite());
    if (i % 5 === 0) entity.add(new AI());
  }

  largeWorld.addSystem([Position, Velocity], args => {
    const pos = args.entity.get(Position);
    const vel = args.entity.get(Velocity);
    pos.x += vel.vx;
    pos.y += vel.vy;
  });

  // --- BENCHMARKS ---

  bench('large world simulation (10000 entities) (Hot Path)', () => {
    // This measures pure system execution speed on a large dataset
    largeWorld.systems.run();
  });

  bench('entity lifecycle stress (create/destroy 100 per tick)', () => {
    // This specifically tests the cost of creating/destroying entities
    // while the world is running
    const world = new World<StressComponents>();

    for (let i = 0; i < 100; i++) {
      world.createEntity().add(new Position());
    }
    world.systems.run(); // Process creation

    // Destroy all
    for (const entity of world.entities.values()) {
      entity.destroy();
    }
    world.systems.run(); // Process destruction
  });
});
