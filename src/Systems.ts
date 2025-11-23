import Entity, { EntityId } from './Entity';
import World, { ClassConstructor } from './World';
import ComponentCollection from './ComponentCollection';

/**
 * Arguments that are passed into a System function on each iteration.
 */
export interface SystemFuncArgs<CT> {
  /**
   * The current entity being iterated.
   */
  entity: Entity<CT>;
  /**
   * The components that belong to the entity
   */
  components: ComponentCollection<CT>;
  /**
   * The World instance.
   */
  world: World<CT>;
  /**
   * The index of the entity in the current system execution.
   */
  index: number;
  /**
   * The total number of entities being processed by this system.
   */
  size: number;
  /**
   * Is the first entity to be iterated on this run of a system.
   */
  isFirst: boolean;
  /**
   * Is the last entity to be iterated on this run of a system.
   */
  isLast: boolean;
  /**
   * Delta time in milliseconds passed since the last frame.
   */
  dt: number;
  /**
   * Total time in milliseconds since the simulation started.
   */
  time: number;
}

/**
 * Function that is called when a system is run.
 */
// eslint-disable-next-line no-unused-vars
export type SystemFunc<CT> = (sytemFuncArgs: SystemFuncArgs<CT>) => void;

const DEFAULT_PHASE = '__DEFAULT__';

interface SystemDef<CT> {
  func: SystemFunc<CT>;
  name: string;
  key: string;
  entities: Set<EntityId>; // Cached direct reference to the entity set
}

export default class Systems<CT> {
  world: World<CT>;
  compNamesBySystemName: Map<string, string[]>;

  private phases: Map<string, SystemDef<CT>[]> = new Map();
  private phaseOrder: string[] = [
    'Input',
    'Logic',
    'Events',
    'Render',
    'Cleanup',
  ];

  constructor(world: World<CT>) {
    this.world = world;
    this.compNamesBySystemName = new Map();
    this.phases.set(DEFAULT_PHASE, []);
  }

  setPhaseOrder(order: string[]): void {
    this.phaseOrder = order;
  }

  add(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    canonicalKey: string,
    options: { phase?: string; name?: string } = {}
  ): this {
    const cNames = cTypes.map(ct => ct.name);
    const { phase = DEFAULT_PHASE, name: optionName } = options;
    const name = optionName || systemFunc.name || canonicalKey;

    if (!this.phases.has(phase)) {
      this.phases.set(phase, []);
    }

    // Cache the reference to the entities Set for this query.
    // World.addSystem guarantees this query exists before calling Systems.add.
    const query = this.world.systemQueries.get(canonicalKey);
    if (!query) {
      throw new Error(`System Query not found for key: ${canonicalKey}`);
    }

    this.phases.get(phase)?.push({
      func: systemFunc,
      name,
      key: canonicalKey,
      entities: query.entities, // Direct reference optimization
    });

    this.compNamesBySystemName.set(name, cNames);

    // Move validation here (Setup time) instead of run() (Hot path)
    this.validatePhases();

    return this;
  }

  private validatePhases(): void {
    const defaultPhaseSystems = this.phases.get(DEFAULT_PHASE) || [];
    const hasDefaultPhaseSystems = defaultPhaseSystems.length > 0;
    const hasNamedPhaseSystems = Array.from(this.phases.keys()).some(
      key => key !== DEFAULT_PHASE && (this.phases.get(key)?.length ?? 0) > 0
    );

    if (hasDefaultPhaseSystems && hasNamedPhaseSystems) {
      throw new Error(
        'Ambiguous system execution order: Some systems are registered with a phase, while others are not. Please assign a phase to all systems if you intend to use execution phases.'
      );
    }
  }

  /**
   * Runs all systems.
   * @param args Optional time arguments.
   */
  run(args?: { dt?: number; time?: number }): void {
    const dt = args?.dt ?? 16.666;
    // eslint-disable-next-line no-undef
    const time = args?.time ?? performance.now();

    // Reuse arg object to reduce GC pressure
    const systemArgs = {
      entity: null as unknown as Entity<CT>,
      components: null as unknown as ComponentCollection<CT>,
      world: this.world,
      index: 0,
      size: 0,
      isFirst: false,
      isLast: false,
      dt,
      time,
    };

    // Determine active phases
    const runOrder: string[] = [];

    // Check if we are using default or named phases
    const defaultPhase = this.phases.get(DEFAULT_PHASE);
    if (defaultPhase && defaultPhase.length > 0) {
      runOrder.push(DEFAULT_PHASE);
    } else {
      // Use configured order
      for (const p of this.phaseOrder) {
        runOrder.push(p);
      }
      // Add any custom phases not in order
      for (const p of this.phases.keys()) {
        if (p !== DEFAULT_PHASE && !this.phaseOrder.includes(p)) {
          runOrder.push(p);
        }
      }
    }

    for (const phase of runOrder) {
      const systemsInPhase = this.phases.get(phase);

      // Run systems in this phase if any exist
      if (systemsInPhase && systemsInPhase.length > 0) {
        for (const system of systemsInPhase) {
          const entityIdSet = system.entities;
          const size = entityIdSet.size;

          if (size === 0) continue;

          let index = 0;
          systemArgs.size = size;

          for (const eid of entityIdSet) {
            const entity = this.world.entities[eid];

            // Fast check for holes, destroyed entities, or entities not yet created
            // ALLOW entities in 'creating' and 'destroying' states to process for one frame
            if (
              !entity ||
              (entity.state !== 'created' &&
                entity.state !== 'creating' &&
                entity.state !== 'destroying')
            )
              continue;

            const components = this.world.componentCollections[eid];

            // Safety check (should theoretically never happen if logic is sound)
            if (!components) continue;

            systemArgs.entity = entity;
            systemArgs.components = components;
            systemArgs.index = index;
            systemArgs.isFirst = index === 0;
            systemArgs.isLast = index + 1 === size;

            system.func(systemArgs);

            index++;
          }
        }
      }

      // Always process events for this phase, even if no systems ran
      // This is important for phases that only have event listeners (e.g. 'Events' phase)
      this.world.events.processQueueForPhase(phase);
    }

    // Entity Lifecycle (Create)
    if (this.world.entitiesToCreate.size > 0) {
      for (const entity of this.world.entitiesToCreate) {
        entity.finishCreation();
      }
      this.world.entitiesToCreate.clear();
    }

    // Entity Lifecycle (Destroy)
    if (this.world.entitiesToDestroy.size > 0) {
      for (const entity of this.world.entitiesToDestroy) {
        entity.destroyImmediately();
      }
      this.world.entitiesToDestroy.clear();
    }

    this.world.events.clearQueue();
  }
}

// import Entity, { EntityId } from './Entity';
// import World, { ClassConstructor } from './World';
// import ComponentCollection from './ComponentCollection';

// /**
//  * Arguments that are passed into a System function on each iteration.
//  */
// export interface SystemFuncArgs<CT> {
//   /**
//    * The current entity being iterated.
//    */
//   entity: Entity<CT>;
//   /**
//    * The components that belong to the entity
//    */
//   components: ComponentCollection<CT>;
//   /**
//    * The World instance.
//    */
//   world: World<CT>;
//   /**
//    * The index of the entity in the current system execution.
//    */
//   index: number;
//   /**
//    * The total number of entities being processed by this system.
//    */
//   size: number;
//   /**
//    * Is the first entity to be iterated on this run of a system.
//    */
//   isFirst: boolean;
//   /**
//    * Is the last entity to be iterated on this run of a system.
//    */
//   isLast: boolean;
//   /**
//    * Delta time in milliseconds passed since the last frame.
//    */
//   dt: number;
//   /**
//    * Total time in milliseconds since the simulation started.
//    */
//   time: number;
// }

// /**
//  * Function that is called when a system is run.
//  */
// // eslint-disable-next-line no-unused-vars
// export type SystemFunc<CT> = (sytemFuncArgs: SystemFuncArgs<CT>) => void;

// const DEFAULT_PHASE = '__DEFAULT__';

// interface SystemDef<CT> {
//   func: SystemFunc<CT>;
//   name: string;
//   key: string;
//   entities: Set<EntityId>; // Cached direct reference to the entity set
// }

// export default class Systems<CT> {
//   world: World<CT>;
//   compNamesBySystemName: Map<string, string[]>;

//   private phases: Map<string, SystemDef<CT>[]> = new Map();
//   private phaseOrder: string[] = [
//     'Input',
//     'Logic',
//     'Events',
//     'Render',
//     'Cleanup',
//   ];

//   constructor(world: World<CT>) {
//     this.world = world;
//     this.compNamesBySystemName = new Map();
//     this.phases.set(DEFAULT_PHASE, []);
//   }

//   setPhaseOrder(order: string[]): void {
//     this.phaseOrder = order;
//   }

//   add(
//     cTypes: ClassConstructor<CT>[],
//     systemFunc: SystemFunc<CT>,
//     canonicalKey: string,
//     options: { phase?: string; name?: string } = {}
//   ): this {
//     const cNames = cTypes.map(ct => ct.name);
//     const { phase = DEFAULT_PHASE, name: optionName } = options;
//     const name = optionName || systemFunc.name || canonicalKey;

//     if (!this.phases.has(phase)) {
//       this.phases.set(phase, []);
//     }

//     // Cache the reference to the entities Set for this query.
//     // World.addSystem guarantees this query exists before calling Systems.add.
//     const query = this.world.systemQueries.get(canonicalKey);
//     if (!query) {
//       throw new Error(`System Query not found for key: ${canonicalKey}`);
//     }

//     this.phases.get(phase)?.push({
//       func: systemFunc,
//       name,
//       key: canonicalKey,
//       entities: query.entities, // Direct reference optimization
//     });

//     this.compNamesBySystemName.set(name, cNames);

//     // Move validation here (Setup time) instead of run() (Hot path)
//     this.validatePhases();

//     return this;
//   }

//   private validatePhases(): void {
//     const defaultPhaseSystems = this.phases.get(DEFAULT_PHASE) || [];
//     const hasDefaultPhaseSystems = defaultPhaseSystems.length > 0;
//     const hasNamedPhaseSystems = Array.from(this.phases.keys()).some(
//       key => key !== DEFAULT_PHASE && (this.phases.get(key)?.length ?? 0) > 0
//     );

//     if (hasDefaultPhaseSystems && hasNamedPhaseSystems) {
//       throw new Error(
//         'Ambiguous system execution order: Some systems are registered with a phase, while others are not. Please assign a phase to all systems if you intend to use execution phases.'
//       );
//     }
//   }

//   /**
//    * Runs all systems.
//    * @param args Optional time arguments.
//    */
//   run(args?: { dt?: number; time?: number }): void {
//     const dt = args?.dt ?? 16.666;
//     // eslint-disable-next-line no-undef
//     const time = args?.time ?? performance.now();

//     const systemArgs = {
//       entity: null as unknown as Entity<CT>,
//       components: null as unknown as ComponentCollection<CT>,
//       world: this.world,
//       index: 0,
//       size: 0,
//       isFirst: false,
//       isLast: false,
//       dt,
//       time,
//     };

//     if (this.world.entitiesToCreate.size > 0) {
//       for (const entity of this.world.entitiesToCreate) {
//         entity.finishCreation();
//       }
//       this.world.entitiesToCreate.clear();
//     }

//     // Determine active phases
//     const runOrder: string[] = [];

//     // Check if we are using default or named phases
//     const defaultPhase = this.phases.get(DEFAULT_PHASE);
//     if (defaultPhase && defaultPhase.length > 0) {
//       runOrder.push(DEFAULT_PHASE);
//     } else {
//       for (const p of this.phaseOrder) {
//         runOrder.push(p);
//       }
//       // Add any custom phases not in order
//       for (const p of this.phases.keys()) {
//         if (p !== DEFAULT_PHASE && !this.phaseOrder.includes(p)) {
//           runOrder.push(p);
//         }
//       }
//     }

//     for (const phase of runOrder) {
//       const systemsInPhase = this.phases.get(phase);

//       // Run systems in this phase if any exist
//       if (systemsInPhase && systemsInPhase.length > 0) {
//         for (const system of systemsInPhase) {
//           const entityIdSet = system.entities;
//           const size = entityIdSet.size;

//           if (size === 0) continue;

//           let index = 0;
//           systemArgs.size = size;

//           for (const eid of entityIdSet) {
//             const entity = this.world.entities[eid];

//             // Fast check for holes, destroyed entities, or entities not yet created
//             if (
//               !entity ||
//               (entity.state !== 'created' && entity.state !== 'destroying')
//             )
//               continue;

//             const components = this.world.componentCollections[eid];

//             // Safety check (should theoretically never happen if logic is sound)
//             if (!components) continue;

//             systemArgs.entity = entity;
//             systemArgs.components = components;
//             systemArgs.index = index;
//             systemArgs.isFirst = index === 0;
//             systemArgs.isLast = index + 1 === size;

//             system.func(systemArgs);

//             index++;
//           }
//         }
//       }

//       // Always process events for this phase, even if no systems ran
//       // This is important for phases that only have event listeners (e.g. 'Events' phase)
//       this.world.events.processQueueForPhase(phase);
//     }

//     // Entity Lifecycle (Destroy)
//     // if (this.world.entitiesToCreate.size > 0) {
//     //   for (const entity of this.world.entitiesToCreate) {
//     //     entity.finishCreation();
//     //   }
//     //   this.world.entitiesToCreate.clear();
//     // }

//     if (this.world.entitiesToDestroy.size > 0) {
//       for (const entity of this.world.entitiesToDestroy) {
//         entity.destroyImmediately();
//       }
//       this.world.entitiesToDestroy.clear();
//     }
//   }
// }
