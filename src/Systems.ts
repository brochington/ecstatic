import Entity, { EntityId } from './Entity';
import World, { ClassConstructor } from './World';
import ComponentCollection from './ComponentCollection';

/**
 * Arguments that are passed into a System function on each iteration.
 * This is how you acces things like the entity that particular entity to act on,
 * as well as some other helpful params like if the entity is the first or last entity
 * in the group of entities that being iterated over.
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
   * Use this to access other entities.
   */
  world: World<CT>;
  index: number;
  size: number;
  /**
   * Is the first entity to be iterated on this run of a system.
   * Helpful for setting up state that is the same for all entities only once.
   */
  isFirst: boolean;
  /**
   * Is the last entity to be iterated on this run of a system.
   * Can be helpful to tear down anything that should be dealt with after all the entites have ran.
   */
  isLast: boolean;
}

/**
 * Function that is called when a system is run.
 */
// eslint-disable-next-line no-unused-vars
export type SystemFunc<CT> = (sytemFuncArgs: SystemFuncArgs<CT>) => void;

export default class Systems<CT> {
  world: World<CT>;

  systemFuncBySystemName: Map<string, { func: SystemFunc<CT>; key: string }>;

  compNamesBySystemName: Map<string, string[]>;

  constructor(world: World<CT>) {
    this.world = world;
    this.systemFuncBySystemName = new Map();
    this.compNamesBySystemName = new Map();
  }

  add(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    canonicalKey: string, // Accept the pre-computed key
    funcName?: string
  ): this {
    const cNames = cTypes.map(ct => ct.name);

    let name = funcName || systemFunc.name;
    if (name === '' || !name) {
      // Use a more robust way to get a unique name if needed,
      // for now we'll use the canonical key if no name is available.
      name = canonicalKey;
    }

    this.systemFuncBySystemName.set(name, {
      func: systemFunc,
      key: canonicalKey,
    });
    this.compNamesBySystemName.set(name, cNames);

    // Use the canonicalKey passed from the World
    if (!this.world.entitiesByCTypes.has(canonicalKey)) {
      this.world.entitiesByCTypes.set(canonicalKey, new Set<EntityId>());
    }

    return this;
  }

  run(): void {
    // 1. EFFICIENTLY GATHER ENTITIES NEEDING LIFECYCLE CHANGES
    // Instead of multiple loops, we find all entities to be created or
    // destroyed in a single pass over the world's entities.
    const entitiesToCreate: Entity<CT>[] = [];
    const entitiesToDestroy: Entity<CT>[] = [];

    for (const entity of this.world.entities.values()) {
      if (entity.state === 'creating') {
        entitiesToCreate.push(entity);
      } else if (entity.state === 'destroying') {
        entitiesToDestroy.push(entity);
      }
    }

    // 2. RUN ALL SYSTEMS
    // We iterate over the system map, which now contains the function and the correct key.
    for (const {
      func,
      key: canonicalKey,
    } of this.systemFuncBySystemName.values()) {
      // Use the canonicalKey to get the precise set of entities for this system.
      const entityIdSet =
        this.world.entitiesByCTypes.get(canonicalKey) || new Set();
      const size = entityIdSet.size;

      // A small optimization: if no entities match this system, skip it.
      if (size === 0) {
        continue;
      }

      let index = 0;
      for (const eid of entityIdSet) {
        // Retrieve the entity and its components for this iteration.
        const entity = this.world.entities.get(eid);

        // Defensive check: if entity was removed mid-loop, skip.
        if (!entity) continue;

        const components =
          this.world.componentCollections.get(eid) ||
          new ComponentCollection<CT>();

        // Construct the arguments object for the system function.
        const args: SystemFuncArgs<CT> = {
          entity,
          components,
          world: this.world,
          index,
          size, // Pass the correct size of the current entity set.
          isFirst: index === 0,
          isLast: index + 1 === size,
        };

        // Execute the system's logic.
        func(args);

        index++;
      }
    }

    // 3. FINALIZE LIFECYCLE CHANGES
    // This happens *after* all systems have had a chance to run.

    // Finalize the creation of all new entities.
    for (const entity of entitiesToCreate) {
      entity.finishCreation();
    }

    // Finalize the destruction of all marked entities.
    for (const entity of entitiesToDestroy) {
      entity.destroyImmediately();
    }
  }

  /*
    TODO: Nice to have options here:
      - systems.activeSystems = new Set(); // if not in set, system doesn't run.
      - systems.deactivateSystem('systemName') // remove system from activeSystems
      - systems.activateSystem('systemName) // adds system back to activeSystems
      - systems.pause() // pauses running of systems. basically return immediately on run().
      - systems.resume() // resume running of systems.
  */
}
