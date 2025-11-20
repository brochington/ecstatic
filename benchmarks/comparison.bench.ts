import { bench, describe } from 'vitest';
import { World, Entity } from '../src/index';

// --- MOCK SETUP FOR LEGACY COMPARISON ---

// 1. Define Components
class Position {
  x = 0;
  y = 0;
}
class Velocity {
  x = 1;
  y = 1;
}

type BenchComponents = Position | Velocity;

// 2. Define a Legacy Runner function that mimics the OLD Systems.run behavior
// - Creates a new arguments object for every entity
// - Iterates the entire entity list to check for lifecycle changes
function legacyRun(world: World<BenchComponents>, systemCallback: Function) {
  // A. Legacy Lifecycle Check: Iterate ALL entities to find state changes (O(N))
  const entitiesToCreate: Entity<BenchComponents>[] = [];
  const entitiesToDestroy: Entity<BenchComponents>[] = [];

  for (const entity of world.entities.values()) {
    if (entity.state === 'creating') {
      entitiesToCreate.push(entity);
    } else if (entity.state === 'destroying') {
      entitiesToDestroy.push(entity);
    }
  }

  // B. Legacy System Iteration: Allocate new object for every entity
  // We manually grab the entities matching [Position, Velocity] to simulate the system query
  const entities = world.locateAll([Position, Velocity]);
  const size = entities.length;

  for (let i = 0; i < size; i++) {
    const entity = entities[i];
    if (entity.state === 'destroyed') continue;

    const components = world.componentCollections.get(entity.id);

    // The crucial part: Creating a NEW object every iteration
    const args = {
      entity,
      components,
      world,
      index: i,
      size,
      isFirst: i === 0,
      isLast: i === size - 1,
    };

    systemCallback(args);
  }

  // C. Legacy Lifecycle Processing
  for (const entity of entitiesToCreate) {
    entity.finishCreation();
  }
  for (const entity of entitiesToDestroy) {
    entity.destroyImmediately();
  }
}

// --- BENCHMARKS ---

describe('System Performance Comparison', () => {
  const ENTITY_COUNT = 10_000;

  bench(
    'Legacy Logic (Allocates Args + Full Entity Scan)',
    () => {
      const world = new World<BenchComponents>();
      // Setup
      for (let i = 0; i < ENTITY_COUNT; i++) {
        const e = world.createEntity();
        e.add(new Position());
        e.add(new Velocity());
        // Force state to created so we test the "running" steady state
        e.finishCreation();
      }

      // The actual benchmark op
      legacyRun(world, (args: any) => {
        const pos = args.entity.get(Position);
        pos.x++;
      });
    },
    {
      iterations: 100, // Run fewer iterations as setup is expensive inside the bench
      setup: () => {
        // Note: vitest bench setup runs once, but we need fresh worlds usually.
        // For this specific test, we move creation inside to ensure isolation
        // or just test the run loop if we could extract setup.
        // Since we can't easily extract setup per-run in vitest bench without including it in time,
        // we will create a persistent world outside and only measure the run().
      },
    }
  );

  // Better approach for Vitest: Setup outside, measure only the run()

  const legacyWorld = new World<BenchComponents>();
  for (let i = 0; i < ENTITY_COUNT; i++) {
    legacyWorld
      .createEntity()
      .add(new Position())
      .add(new Velocity())
      .finishCreation();
  }

  const optimizedWorld = new World<BenchComponents>();
  for (let i = 0; i < ENTITY_COUNT; i++) {
    optimizedWorld
      .createEntity()
      .add(new Position())
      .add(new Velocity())
      .finishCreation();
  }
  optimizedWorld.addSystem([Position, Velocity], args => {
    const pos = args.entity.get(Position);
    pos.x++;
  });

  bench('Legacy: Run Loop (10k entities)', () => {
    legacyRun(legacyWorld, (args: any) => {
      const pos = args.entity.get(Position);
      pos.x++;
    });
  });

  bench('Optimized: Run Loop (10k entities)', () => {
    optimizedWorld.systems.run();
  });
});

describe('Argument Allocation Overhead', () => {
  // Compare specifically the impact of passing the arg object
  const world = new World<BenchComponents>();
  const entities = [];
  for (let i = 0; i < 5000; i++) {
    const e = world.createEntity();
    e.add(new Position());
    entities.push(e);
    e.finishCreation();
  }

  // Reusable object for optimization simulation
  const sharedArgs = { entity: null, index: 0 };

  bench('Allocation: New Object per Entity', () => {
    for (let i = 0; i < entities.length; i++) {
      const args = {
        entity: entities[i],
        index: i,
        extra1: 1,
        extra2: 2,
        extra3: 3,
      };
      // Simulates accessing property
      if (args.entity) {
      }
    }
  });

  bench('Allocation: Reused Object', () => {
    for (let i = 0; i < entities.length; i++) {
      sharedArgs.entity = entities[i] as any;
      sharedArgs.index = i;
      // Simulates accessing property
      if (sharedArgs.entity) {
      }
    }
  });
});

describe('Lifecycle Check Overhead', () => {
  // Compare iterating 10k entities to find state vs checking a Set size
  const world = new World<BenchComponents>();
  for (let i = 0; i < 10_000; i++) {
    world.createEntity().finishCreation();
  }

  bench('Lifecycle: Scan All Entities (Legacy)', () => {
    const toCreate = [];
    const toDestroy = [];
    for (const entity of world.entities.values()) {
      if (entity.state === 'creating') toCreate.push(entity);
      if (entity.state === 'destroying') toDestroy.push(entity);
    }
  });

  bench('Lifecycle: Set Check (Optimized)', () => {
    // This accesses the internal sets directly to simulate the new check
    if (world.entitiesToCreate.size > 0) {
      // iterate set
    }
    if (world.entitiesToDestroy.size > 0) {
      // iterate set
    }
  });
});
