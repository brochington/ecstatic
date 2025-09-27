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
  width: number;
  height: number;

  constructor(image = 'sprite.png', width = 32, height = 32) {
    this.image = image;
    this.width = width;
    this.height = height;
  }
}

class AI {
  state: string;
  target: string | null;

  constructor(state = 'idle', target: string | null = null) {
    this.state = state;
    this.target = target;
  }
}

class PhysicsBody {
  mass: number;
  friction: number;
  restitution: number;

  constructor(mass = 1, friction = 0.3, restitution = 0.8) {
    this.mass = mass;
    this.friction = friction;
    this.restitution = restitution;
  }
}

type StressComponents =
  | Position
  | Velocity
  | Health
  | Sprite
  | AI
  | PhysicsBody;

describe('Stress Tests', () => {
  bench('large world simulation (10000 entities)', () => {
    const world = new World<StressComponents>();

    // Create 10000 entities with varying component combinations
    for (let i = 0; i < 10000; i++) {
      const entity = world
        .createEntity()
        .add(new Position(Math.random() * 1000, Math.random() * 1000))
        .add(new Velocity(Math.random() * 10 - 5, Math.random() * 10 - 5));

      // Add components based on entity index for varied archetypes
      if (i % 2 === 0) {
        entity.add(new Health(100, 100));
      }
      if (i % 3 === 0) {
        entity.add(new Sprite('enemy.png', 32, 32));
      }
      if (i % 5 === 0) {
        entity.add(new AI('patrol'));
      }
      if (i % 7 === 0) {
        entity.add(new PhysicsBody(1.0, 0.3, 0.8));
      }
    }

    // Run systems
    world.systems.run();

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('entity lifecycle stress (create/destroy cycle)', () => {
    const world = new World<StressComponents>();

    // Simulate entity lifecycle: create, use, destroy, repeat
    for (let cycle = 0; cycle < 100; cycle++) {
      const entities = [];

      // Create batch of entities
      for (let i = 0; i < 100; i++) {
        const entity = world
          .createEntity()
          .add(new Position(i * 10, cycle * 10))
          .add(new Velocity(1, 1))
          .add(new Health(100, 100));
        entities.push(entity);
      }

      // Simulate one frame of processing
      world.systems.run();

      // Destroy all entities
      entities.forEach(entity => entity.destroy());
    }
  });

  bench('component hot-swapping (1000 entities)', () => {
    const world = new World<StressComponents>();

    // Create entities
    const entities = [];
    for (let i = 0; i < 1000; i++) {
      const entity = world.createEntity().add(new Position(i, i));
      entities.push(entity);
    }

    // Simulate hot-swapping components (common in gameplay)
    entities.forEach((entity, i) => {
      if (i % 2 === 0) {
        entity.add(new Velocity(1, 1));
        entity.remove(Position);
      } else {
        entity.remove(Position);
        entity.add(new Health(100, 100));
      }
    });

    // Cleanup
    entities.forEach(entity => entity.destroy());
  });

  bench('complex system interactions', () => {
    const world = new World<StressComponents>();

    // Create a complex scene
    for (let i = 0; i < 2000; i++) {
      const entity = world
        .createEntity()
        .add(new Position(Math.random() * 800, Math.random() * 600))
        .add(new Velocity(Math.random() * 4 - 2, Math.random() * 4 - 2))
        .add(new Health(Math.random() * 100 + 50, 100));

      if (i % 4 === 0) {
        entity.add(new AI('seek'));
      }
    }

    // Physics system
    world.addSystem([Position, Velocity], args => {
      let { entity } = args;

      const position = entity.get(Position);
      const velocity = entity.get(Velocity);

      if (position && velocity) {
        position.x += velocity.vx;
        position.y += velocity.vy;

        // Bounce off boundaries
        if (position.x < 0 || position.x > 800) velocity.vx *= -1;
        if (position.y < 0 || position.y > 600) velocity.vy *= -1;
      }
    });

    // AI system
    world.addSystem([AI, Position, Velocity], args => {
      let { entity } = args;

      const ai = entity.get(AI);
      const position = entity.get(Position);
      const velocity = entity.get(Velocity);

      if (ai && position && velocity && ai.state === 'seek') {
        // Simple seek behavior toward center
        const centerX = 400;
        const centerY = 300;
        const dx = centerX - position.x;
        const dy = centerY - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
          velocity.vx = (dx / distance) * 2;
          velocity.vy = (dy / distance) * 2;
        }
      }
    });

    // Health system
    world.addSystem([Health], args => {
      Array.from(args.components)
        .filter(component => component instanceof Health)
        .forEach(component => {
          // Regenerate health slowly
          component.value = Math.min(component.value + 0.1, component.max);
        });
    });

    // Run multiple frames
    for (let frame = 0; frame < 10; frame++) {
      world.systems.run();
    }

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('memory pressure test (entity pool simulation)', () => {
    const world = new World<StressComponents>();

    // Simulate a game with entity pooling - create, destroy, recreate
    for (let wave = 0; wave < 50; wave++) {
      // Create wave of entities
      const entities = [];
      for (let i = 0; i < 200; i++) {
        const entity = world
          .createEntity()
          .add(new Position(Math.random() * 1000, Math.random() * 1000))
          .add(new Velocity(Math.random() * 10, Math.random() * 10))
          .add(new Health(100, 100))
          .add(new Sprite('bullet.png', 8, 8));
        entities.push(entity);
      }

      // Process for a few frames
      for (let frame = 0; frame < 5; frame++) {
        world.systems.run();
      }

      // Destroy all entities in wave
      entities.forEach(entity => entity.destroy());
    }
  });
});
