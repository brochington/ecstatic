import { bench, describe } from 'vitest';
import { World } from '../src/index';

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

class Renderable {
  visible: boolean;

  constructor(visible = true) {
    this.visible = visible;
  }
}

type BenchComponents = Position | Velocity | Health | Renderable;

describe('System Operations', () => {
  bench('add system', () => {
    const world = new World<BenchComponents>();
    world.addSystem([Position], args => {
      // Simple system that does nothing
    });
  });

  bench('run system with no entities', () => {
    const world = new World<BenchComponents>();
    world.addSystem([Position], args => {
      // Simple system that does nothing
    });
    world.systems.run();
  });

  bench('run system with 100 entities', () => {
    const world = new World<BenchComponents>();

    // Create 100 entities with Position component
    for (let i = 0; i < 100; i++) {
      world.createEntity().add(new Position(i, i));
    }

    world.addSystem([Position], args => {
      args.components.forEach(component => {
        component.x += 1;
        component.y += 1;
      });
    });

    world.systems.run();

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('run system with 1000 entities', () => {
    const world = new World<BenchComponents>();

    // Create 1000 entities with Position component
    for (let i = 0; i < 1000; i++) {
      world.createEntity().add(new Position(i, i));
    }

    world.addSystem([Position], args => {
      args.components.forEach(component => {
        component.x += 1;
        component.y += 1;
      });
    });

    world.systems.run();

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('run multiple systems (100 entities)', () => {
    const world = new World<BenchComponents>();

    // Create 100 entities with different component combinations
    for (let i = 0; i < 100; i++) {
      const entity = world
        .createEntity()
        .add(new Position(i, i))
        .add(new Velocity(1, 1));

      if (i % 2 === 0) {
        entity.add(new Health(100, 100));
      }
      if (i % 3 === 0) {
        entity.add(new Renderable(true));
      }
    }

    // Movement system
    world.addSystem([Position, Velocity], args => {
      args.components.forEach((component, entity) => {
        const position = entity.get(Position);
        const velocity = entity.get(Velocity);
        if (position && velocity) {
          position.x += velocity.vx;
          position.y += velocity.vy;
        }
      });
    });

    // Health system
    world.addSystem([Health], args => {
      args.components.forEach(component => {
        component.value = Math.min(component.value + 1, component.max);
      });
    });

    // Render system
    world.addSystem([Position, Renderable], args => {
      args.components.forEach((component, entity) => {
        // Simulate rendering
        const position = entity.get(Position);
        if (position) {
          // Do nothing - just component access
        }
      });
    });

    world.systems.run();

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('system with complex component queries', () => {
    const world = new World<BenchComponents>();

    // Create entities with different component combinations
    for (let i = 0; i < 500; i++) {
      const entity = world
        .createEntity()
        .add(new Position(i, i))
        .add(new Velocity(1, 1));

      if (i % 2 === 0) {
        entity.add(new Health(100, 100));
      }
    }

    // System that requires specific component combinations
    world.addSystem([Position, Velocity, Health], args => {
      args.components.forEach((component, entity) => {
        const position = entity.get(Position);
        const velocity = entity.get(Velocity);
        const health = entity.get(Health);

        if (position && velocity && health) {
          position.x += velocity.vx * (health.value / health.max);
          position.y += velocity.vy * (health.value / health.max);
        }
      });
    });

    world.systems.run();

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });
});
