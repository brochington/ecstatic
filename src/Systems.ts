import Entity from './Entity';
import World from './World';
import ComponentCollection from './ComponentCollection';
import { Query } from './Query';

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
  query: Query<CT>; // Store the Query object directly
}

export default class Systems<CT> {
  world: World<CT>;

  // Map to track which components are used by which system (for DevTools)
  // Note: With complex queries, this is harder to track perfectly,
  // but we can use the Query key or a normalized name.
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
    query: Query<CT>,
    systemFunc: SystemFunc<CT>,
    options: { phase?: string; name?: string } = {}
  ): this {
    const { phase = DEFAULT_PHASE, name: optionName } = options;
    const name = optionName || systemFunc.name || query.key;

    if (!this.phases.has(phase)) {
      this.phases.set(phase, []);
    }

    this.phases.get(phase)?.push({
      func: systemFunc,
      name,
      query,
    });

    // For DevTools: Extract actual component names from the query's relevantComponents
    const compNames = Array.from(query.relevantComponents);
    this.compNamesBySystemName.set(name, compNames);

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

    const defaultPhase = this.phases.get(DEFAULT_PHASE);
    if (defaultPhase && defaultPhase.length > 0) {
      runOrder.push(DEFAULT_PHASE);
    } else {
      for (const p of this.phaseOrder) {
        runOrder.push(p);
      }
      for (const p of this.phases.keys()) {
        if (p !== DEFAULT_PHASE && !this.phaseOrder.includes(p)) {
          runOrder.push(p);
        }
      }
    }

    for (const phase of runOrder) {
      const systemsInPhase = this.phases.get(phase);

      if (systemsInPhase && systemsInPhase.length > 0) {
        for (const system of systemsInPhase) {
          // Use the entities set from the Query object
          const entityIdSet = system.query.entities;
          const size = entityIdSet.size;

          if (size === 0) continue;

          let index = 0;
          systemArgs.size = size;

          for (const eid of entityIdSet) {
            const entity = this.world.entities[eid];

            if (
              !entity ||
              (entity.state !== 'created' &&
                entity.state !== 'creating' &&
                entity.state !== 'destroying')
            )
              continue;

            const components = this.world.componentCollections[eid];
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

      this.world.events.processQueueForPhase(phase);
    }

    // Lifecycle processing
    if (this.world.entitiesToCreate.size > 0) {
      for (const entity of this.world.entitiesToCreate) {
        entity.finishCreation();
      }
      this.world.entitiesToCreate.clear();
    }

    if (this.world.entitiesToDestroy.size > 0) {
      for (const entity of this.world.entitiesToDestroy) {
        entity.destroyImmediately();
      }
      this.world.entitiesToDestroy.clear();
    }

    this.world.events.clearQueue();
  }
}
