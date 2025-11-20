import World from './World';
import DevEntity from './DevEntity';
import Entity from './Entity';

interface DevSystemComps {
  system: string;
  components: string;
}

class DevTools<CT> {
  world: World<CT>;

  constructor(world: World<CT>) {
    this.world = world;
  }

  get systemComponents(): DevSystemComps[] {
    const compsBySystems = [];

    for (const [system, compNames] of this.world.systems
      .compNamesBySystemName) {
      compsBySystems.push({ system, components: compNames.join(', ') });
    }

    return compsBySystems;
  }

  get entities(): DevEntity<CT>[] {
    // Filter out undefined holes in the array
    return this.world.entities
      .filter(e => e !== undefined)
      .map(e => (e as Entity<CT>).toDevEntity());
  }
}

export default DevTools;
