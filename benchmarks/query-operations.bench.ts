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
  // --- SETUP (Hoisted) ---
  const world = new World<BenchComponents>();

  // 1. Simple Single Entity
  const singleEntity = world.createEntity().add(new Position(10, 20, 'single'));
  world.addSystem([Position], () => {}); // Register query

  // 2. 1000 Entities (Sparse)
  const sparseWorld = new World<BenchComponents>();
  for (let i = 0; i < 1000; i++) {
    const entity = sparseWorld.createEntity();
    if (i % 10 === 0) {
      entity.add(new Position(i, i));
    }
  }
  sparseWorld.addSystem([Position], () => {});

  // 3. Grab setup
  const grabWorld = new World<BenchComponents>();
  grabWorld.createEntity().add(new Position(10, 20, 'target'));
  grabWorld.createEntity().add(new Position(30, 40, 'other'));
  grabWorld.addSystem([Position], () => {});

  // 4. GrabAll setup
  const grabAllWorld = new World<BenchComponents>();
  for (let i = 0; i < 100; i++) {
    grabAllWorld.createEntity().add(new Position(i, i));
  }
  grabAllWorld.addSystem([Position], () => {});

  // 5. Find/FindAll Setup (Mixed entities)
  const findWorld = new World<BenchComponents>();
  for (let i = 0; i < 1000; i++) {
    const entity = findWorld
      .createEntity()
      .add(new Position(i, i, `entity-${i}`));
    if (i % 2 === 0) {
      entity.add(new Health(100, 100));
    }
  }

  // 6. Complex Game World Setup
  const gameWorld = new World<BenchComponents>();
  for (let i = 0; i < 500; i++) {
    const entity = gameWorld.createEntity().add(new Position(i * 10, i * 10));

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

  // --- BENCHMARKS ---

  bench('locate single entity by component', () => {
    world.locate(Position);
  });

  bench('locate entity by component (1000 entities, sparse)', () => {
    sparseWorld.locate(Position);
  });

  bench('grab entity and component', () => {
    grabWorld.grab(Position);
  });

  bench('grab entity by predicate', () => {
    grabWorld.grabBy(Position, pos => pos.id === 'target');
  });

  bench('grabAll entities with component (100 entities)', () => {
    grabAllWorld.grabAll(Position);
  });

  bench('find entity by predicate (1000 entities)', () => {
    findWorld.find(entity => {
      const pos = entity.get(Position);
      return pos?.id === 'entity-500';
    });
  });

  bench('findAll entities by predicate (1000 entities)', () => {
    findWorld.findAll(entity => {
      return entity.has(Position) && entity.has(Health);
    });
  });

  bench('get component by entity ID', () => {
    // We use the single world entity
    world.get(singleEntity.id, Position);
  });

  bench('getComponent (world-level component access)', () => {
    world.getComponent(Position);
  });

  bench('complex query simulation (game-like scenario)', () => {
    // Simulate AI system querying for enemies
    gameWorld.findAll(
      entity => entity.has(Enemy) && entity.has(Position) && entity.has(Health)
    );

    // Simulate physics system
    gameWorld.findAll(entity => entity.has(Position) && entity.has(Velocity));

    // Simulate player targeting system
    gameWorld.grabAll(Player);
  });
});
