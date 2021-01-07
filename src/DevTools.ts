import World, { Class } from './World';
import DevEntity from './DevEntity';

class DevTools<CT extends Class<any>> {
  world: World<CT>;

  constructor(world: World<CT>) {
    this.world = world;
  }

  // log a table of systems, and the components for them.
  logSystemCompTable(): void {
    const things = [];

    for (const [systemName, compNames] of this.world.compNamesBySystemName) {
      things.push({ systemName, components: compNames.join(',') });
    }

    console.table(things);
  }

  // Would be nice to list all the systems that will apply to an entity.

  get entities(): DevEntity<CT>[] {
    return [...this.world.entities.values()].map(e => e.toDevEntity());
  }
}

export default DevTools;
