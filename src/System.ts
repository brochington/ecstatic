import World from './World';
import { EntityId } from './Entity';
import ComponentCollection from './ComponentCollection';

export type System = () => void;

export type SystemFunc<CT> = (
  entityId: EntityId,
  cc: ComponentCollection<CT>,
  world: World<CT>,
) => void;

export function createSystem<CT>(
  world: World<CT>,
  cTypes: CT[],
  systemFunc: SystemFunc<CT>
): System {
  world.registerSystem(cTypes);

  return (): void => {
    world.entitiesByCType.get(cTypes).forEach(eid => {
      systemFunc(eid, world.entities.get(eid), world);
    });
  }
}
