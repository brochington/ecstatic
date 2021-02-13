import World from './World';
import DevEntity from './DevEntity';

interface DevSystemComps {
  system: string;
  components: string;
}


class DevTools<CT> {
  world: World<CT>;

  constructor(world: World<CT>) {
    this.world = world;
  }
  /**
   * display the all systems of the world, and the components required by each system.
   * Super helpful to use with console.table()
   * @example
   * ```
   * console.table(world.dev.systemComponents);
   * ```
   */
  get systemComponents(): DevSystemComps[] {
    const compsBySystems = [];

    for (const [system, compNames] of this.world.systems.compNamesBySystemName) {
      compsBySystems.push({ system, components: compNames.join(", ") });
    }

    return compsBySystems;
  }

  /**
   * Create an array of DevEntites. Can be very helpful for things like inspecting component state,
   * and which systems will be called on an entity.
   * @example
   * ```
   * console.table(world.dev.entities);
   *
   * // Pro tip! try displaying a table of entities with console.table and DevEntity.toTableRow().
   * console.table(world.dev.entities.map(devEntity => devEntity.toTableRow()));
   * ```
   */

  get entities(): DevEntity<CT>[] {
    return [...this.world.entities.values()].map((e) => e.toDevEntity());
  }
}

export default DevTools;
