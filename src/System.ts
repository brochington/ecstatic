import World from './World';
import Entity from './Entity';
import ComponentCollection from './ComponentCollection';

export type System = () => void;

export interface SystemFuncArgs<CT> {
  entity: Entity<CT>;
  components: ComponentCollection<CT>;
  world: World<CT>;
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
    for (const eid of world.entitiesByCTypes.get(cTypes)) {
      const args: SystemFuncArgs<CT> = {
        entity: world.entities.get(eid),
        components: world.componentCollections.get(eid),
        world,
      }

      systemFunc(args);
    }
  }
}
