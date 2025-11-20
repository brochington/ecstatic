import Entity from './Entity';
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

export default class Systems<CT> {
  world: World<CT>;
  compNamesBySystemName: Map<string, string[]>;

  private phases: Map<
    string,
    { func: SystemFunc<CT>; name: string; key: string }[]
  > = new Map();
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

    this.phases.get(phase)?.push({ func: systemFunc, name, key: canonicalKey });
    this.compNamesBySystemName.set(name, cNames);

    return this;
  }

  /**
   * Runs all systems.
   * @param args Optional time arguments.
   * @param args.dt Delta time in milliseconds since last frame. Defaults to 16.66ms (60fps) if not provided.
   * @param args.time Total time in milliseconds. Defaults to performance.now().
   */
  run(args?: { dt?: number; time?: number }): void {
    const dt = args?.dt ?? 16.666;
    // eslint-disable-next-line no-undef
    const time = args?.time ?? performance.now();

    // Validation check: Ensure there's no ambiguity between phased and non-phased systems.
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

    // Optimization: Reuse arg object to reduce GC pressure
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

    const runOrder = hasNamedPhaseSystems ? this.phaseOrder : [DEFAULT_PHASE];

    // Add any custom phases defined by the user that are not in the default order.
    for (const phaseName of this.phases.keys()) {
      if (phaseName !== DEFAULT_PHASE && !runOrder.includes(phaseName)) {
        runOrder.push(phaseName);
      }
    }

    for (const phase of runOrder) {
      const systemsInPhase = this.phases.get(phase) || [];

      for (const { func, key: canonicalKey } of systemsInPhase) {
        const entityIdSet =
          this.world.entitiesByQuery.get(canonicalKey) || new Set();
        const size = entityIdSet.size;

        if (size === 0) {
          continue;
        }

        let index = 0;
        systemArgs.size = size;

        for (const eid of entityIdSet) {
          const entity = this.world.entities.get(eid);

          // Do not run systems on entities that have been destroyed.
          if (!entity || entity.state === 'destroyed') continue;

          const components =
            this.world.componentCollections.get(eid) ||
            new ComponentCollection<CT>();

          systemArgs.entity = entity;
          systemArgs.components = components;
          systemArgs.index = index;
          systemArgs.isFirst = index === 0;
          systemArgs.isLast = index + 1 === size;

          func(systemArgs);

          index++;
        }
      }

      // After systems, process events for the current phase.
      this.world.events.processQueueForPhase(phase);
    }

    // Efficiently process Entity Lifecycle state changes
    // This avoids iterating the entire entity list every frame.
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
  }
}
