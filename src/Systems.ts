import Entity, { EntityId } from "./Entity";
import World, { ClassConstructor } from "./World";
import ComponentCollection from "./ComponentCollection";

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
export type SystemFunc<CT> = (sytemFuncArgs: SystemFuncArgs<CT>) => void;

export default class Systems<CT> {
  world: World<CT>;

  systemFuncBySystemName: Map<string, SystemFunc<CT>>; // double check to make sure that maps are ordered.

  compNamesBySystemName: Map<string, string[]>;

  constructor(world: World<CT>) {
    this.world = world;
    this.systemFuncBySystemName = new Map();
    this.compNamesBySystemName = new Map();
  }

  add(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    funcName?: string
  ): this {
    const cNames = cTypes.map((ct) => ct.name);

    let name = systemFunc.name;
    if (systemFunc.name === "") {
      // Super brute force, and might lead to errors in the future, but for now
      // using the stringified system function if the function doesn't already have a name.
      // This is useful for anonymous functions used as a system function.
      // Might be good to figure out how to get a hash of the function string.
      name = systemFunc.toString().slice(0, 30);
    }

    if (funcName) {
      name = funcName;
    }

    this.systemFuncBySystemName.set(name, systemFunc);
    this.compNamesBySystemName.set(name, cNames);
    this.world.entitiesByCTypes.set(cNames, new Set<EntityId>());

    return this;
  }

  run(): void {
    const size = this.world.entitiesByCTypes.size;
    
    const entitiesInCreatingState = [];
    const entitiesInDestroyingState = [];

    for (const entity of this.world.entities.values()) {
      if (entity.state === "creating") {
        entitiesInCreatingState.push(entity);
      }

      if (entity.state === "destroying") {
        entitiesInDestroyingState.push(entity);
      }
    }

    for (const [
      funcName,
      systemFunc,
    ] of this.systemFuncBySystemName.entries()) {
      let index = 0;
      const cNames = this.compNamesBySystemName.get(funcName) || [];
      const cTypeArrs = this.world.entitiesByCTypes.get(cNames) || new Set();

      for (const eid of cTypeArrs) {
        const args: SystemFuncArgs<CT> = {
          entity: this.world.entities.get(eid) || new Entity<CT>(this.world),
          components:
            this.world.componentCollections.get(eid) ||
            new ComponentCollection<CT>(),
          world: this.world,
          index,
          size,
          isFirst: index === 0,
          isLast: index + 1 === size,
        };

        systemFunc(args);

        index += 1;
      }

    }

    for (const entity of entitiesInCreatingState) {
      entity.finishCreation();
    }

    for (const entity of entitiesInDestroyingState) {
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
