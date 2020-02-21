import World from './World';
import Entity from './Entity';
import ComponentCollection from './ComponentCollection';

export type System = () => void;

export interface SystemFuncArgs<CT> {
  entity: Entity<CT>;
  components: ComponentCollection<CT>;
  world: World<CT>;
  index: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
}

export type SystemFunc<CT> = (
  sytemFuncArgs: SystemFuncArgs<CT>,
) => void;

export function createSystem<CT>(
  world: World<CT>,
  cTypes: CT[],
  systemFunc: SystemFunc<CT>
): System {
  world.registerSystem(cTypes);

  return (): void => {
    let index = 0;
    const size = world.entitiesByCTypes.size;

    // Used for matching the array of ComponentTypes which is the key
    // of where the ComponentCollection is, with the array of ComponentTypes
    // that are passes.
    // Might be nice in the future to go back to a ref check on cTypes, but
    // for now this doesn't seem to be that much of a perf hit.
    // for (const ct of world.entitiesByCTypes.keys()) {
    //   if (cTypes.length === ct.length && cTypes.every(c => ct.includes(c))) {
    //     for (const eid of world.entitiesByCTypes.get(cTypes)) {
    //       const args: SystemFuncArgs<CT> = {
    //         entity: world.entities.get(eid),
    //         components: world.componentCollections.get(eid),
    //         world,
    //         index,
    //         size,
    //         isFirst: index === 0,
    //         isLast: index + 1 === size,
    //       }
    
    //       systemFunc(args);
    
    //       index += 1;
    //     }
    //   }
    // }
    for (const eid of world.entitiesByCTypes.get(cTypes)) {
      const args: SystemFuncArgs<CT> = {
        entity: world.entities.get(eid),
        components: world.componentCollections.get(eid),
        world,
        index,
        size,
        isFirst: index === 0,
        isLast: index + 1 === size,
      }

      systemFunc(args);

      index += 1;
    }
  }
}
