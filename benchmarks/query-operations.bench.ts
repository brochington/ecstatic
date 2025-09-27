import { bench, describe } from 'vitest';
import { World } from '../src/index';

// Define component types for benchmarking
class Position {
  x: number;
  y: number;
  id: string;

  constructor(x = 0, y = 0, id = '') {
    this.x = x;
    this.y = y;
    this.id = id;
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

class Enemy {
  type: string;

  constructor(type = 'basic') {
    this.type = type;
  }
}

class Player {
  name: string;

  constructor(name = 'Player') {
    this.name = name;
  }
}

type BenchComponents = Position | Velocity | Health | Enemy | Player;

describe('Query Operations', () => {
  bench('locate single entity by component', () => {
    const world = new World<BenchComponents>();

    world.createEntity().add(new Position(10, 20));
    world.createEntity().add(new Position(30, 40));

    world.addSystem([Position], () => {});

    const entity = world.locate(Position);
  });

  bench('locate entity by component (1000 entities)', () => {
    const world = new World<BenchComponents>();

    // Create 1000 entities, only some with the target component
    for (let i = 0; i < 1000; i++) {
      const entity = world.createEntity();
      if (i % 10 === 0) {
        // Every 10th entity has Position
        entity.add(new Position(i, i));
      }
    }

    world.addSystem([Position], () => {});

    const entity = world.locate(Position);

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('grab entity and component', () => {
    const world = new World<BenchComponents>();

    world.createEntity().add(new Position(10, 20, 'target'));
    world.createEntity().add(new Position(30, 40, 'other'));

    world.addSystem([Position], () => {});

    const result = world.grab(Position);
  });

  bench('grab entity by predicate', () => {
    const world = new World<BenchComponents>();

    world.createEntity().add(new Position(10, 20, 'target'));
    world.createEntity().add(new Position(30, 40, 'other'));
    world.createEntity().add(new Position(50, 60, 'target2'));

    world.addSystem([Position], () => {});

    const result = world.grabBy(Position, pos => pos.id === 'target');
  });

  bench('grabAll entities with component', () => {
    const world = new World<BenchComponents>();

    for (let i = 0; i < 100; i++) {
      world.createEntity().add(new Position(i, i));
    }

    world.addSystem([Position], () => {});

    const results = world.grabAll(Position);

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('find entity by predicate', () => {
    const world = new World<BenchComponents>();

    for (let i = 0; i < 1000; i++) {
      world.createEntity().add(new Position(i, i, `entity-${i}`));
    }

    const entity = world.find(entity => {
      const pos = entity.get(Position);
      return pos?.id === 'entity-500';
    });

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('findAll entities by predicate', () => {
    const world = new World<BenchComponents>();

    for (let i = 0; i < 1000; i++) {
      const entity = world
        .createEntity()
        .add(new Position(i, i, `entity-${i}`));
      if (i % 2 === 0) {
        entity.add(new Health(100, 100));
      }
    }

    const entities = world.findAll(entity => {
      return entity.has(Position) && entity.has(Health);
    });

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('get component by entity ID', () => {
    const world = new World<BenchComponents>();

    const entity = world.createEntity().add(new Position(10, 20, 'target'));

    const component = world.get(entity.id, Position);

    entity.destroy();
  });

  bench('getComponent (world-level component access)', () => {
    const world = new World<BenchComponents>();

    world.createEntity().add(new Position(10, 20, 'target'));

    const component = world.getComponent(Position);

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });

  bench('complex query simulation (game-like scenario)', () => {
    const world = new World<BenchComponents>();

    // Create a mix of entities
    for (let i = 0; i < 500; i++) {
      const entity = world.createEntity().add(new Position(i * 10, i * 10));

      if (i % 3 === 0) {
        entity.add(new Enemy('basic'));
        entity.add(new Health(100, 100));
      } else if (i % 5 === 0) {
        entity.add(new Player(`Player${i}`));
        entity.add(new Health(100, 100));
      }

      if (i % 2 === 0) {
        entity.add(new Velocity(1, 1));
      }
    }

    // Simulate AI system querying for enemies
    const enemies = world.findAll(
      entity => entity.has(Enemy) && entity.has(Position) && entity.has(Health)
    );

    // Simulate physics system
    const movingEntities = world.findAll(
      entity => entity.has(Position) && entity.has(Velocity)
    );

    // Simulate player targeting system
    const players = world.grabAll(Player);

    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });
});
