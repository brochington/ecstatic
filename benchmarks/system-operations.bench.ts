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
  // --- SETUP (Hoisted) ---

  // 1. Empty System
  const emptySysWorld = new World<BenchComponents>();
  emptySysWorld.addSystem([Position], () => {}); // No-op system

  // 2. 100 Entities System
  const smallWorld = new World<BenchComponents>();
  for (let i = 0; i < 100; i++) {
    smallWorld.createEntity().add(new Position(i, i));
  }
  smallWorld.addSystem([Position], args => {
    const { entity } = args;
    const position = entity.get(Position);
    position.x += 1; // Simple mutation
  });

  // 3. 1000 Entities System
  const mediumWorld = new World<BenchComponents>();
  for (let i = 0; i < 1000; i++) {
    mediumWorld.createEntity().add(new Position(i, i));
  }
  mediumWorld.addSystem([Position], args => {
    const pos = args.entity.get(Position); // Direct access is usually faster than array filtering
    pos.x += 1;
  });

  // 4. Multiple Systems World (100 entities)
  const multiSysWorld = new World<BenchComponents>();
  for (let i = 0; i < 100; i++) {
    const entity = multiSysWorld
      .createEntity()
      .add(new Position(i, i))
      .add(new Velocity(1, 1));
    if (i % 2 === 0) entity.add(new Health(100, 100));
    if (i % 3 === 0) entity.add(new Renderable(true));
  }

  // Movement
  multiSysWorld.addSystem([Position, Velocity], args => {
    const { entity, dt } = args;
    const position = entity.get(Position);
    const velocity = entity.get(Velocity);
    position.x += velocity.vx * (dt / 1000);
  });

  // Health
  multiSysWorld.addSystem([Health], args => {
    const health = args.entity.get(Health);
    if (health.value < health.max) health.value++;
  });

  // Render
  multiSysWorld.addSystem([Position, Renderable], args => {
    const pos = args.entity.get(Position);
    // Reading only
  });

  // 5. Complex Query World (500 entities)
  const complexWorld = new World<BenchComponents>();
  for (let i = 0; i < 500; i++) {
    const entity = complexWorld
      .createEntity()
      .add(new Position(i, i))
      .add(new Velocity(1, 1));
    if (i % 2 === 0) entity.add(new Health(100, 100));
  }

  complexWorld.addSystem([Position, Velocity, Health], args => {
    const { entity } = args;
    const position = entity.get(Position);
    const velocity = entity.get(Velocity);
    const health = entity.get(Health);
    // Math heavy(ish)
    position.x += velocity.vx * (health.value / health.max);
  });

  // --- BENCHMARKS ---

  bench('add system (registration overhead)', () => {
    const w = new World<BenchComponents>();
    w.addSystem([Position], () => {});
  });

  bench('run system with no entities', () => {
    emptySysWorld.systems.run();
  });

  bench('run system with 100 entities (Hot Path)', () => {
    smallWorld.systems.run();
  });

  bench('run system with 1000 entities (Hot Path)', () => {
    mediumWorld.systems.run();
  });

  bench('run multiple systems (100 entities) (Hot Path)', () => {
    multiSysWorld.systems.run();
  });

  bench('system with complex component queries (Hot Path)', () => {
    complexWorld.systems.run();
  });
});
