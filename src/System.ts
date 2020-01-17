import World from './World';
import { EntityId } from './Entity';
import ComponentCollection from './ComponentCollection';

export type System = () => void;

export type SystemFunc<CT> = (
  entityId: EntityId,
  cc: ComponentCollection<CT>,
  world: World<CT>,
) => void;

export function createSystem<CT>(world: World<CT>, cTypes: CT[], func: SystemFunc<CT>): System {
  world.registerSystem(cTypes);

  return (): void => {
    // I think I can use the ref of cTypes as key for entitieByCType
    world.entitiesByCType.get(cTypes).forEach(eid => {
      func(eid, world.entities.get(eid), world);
    })
    // for (const [entityId, componentCollection] of world.entities) {
    //   if (cTypes.every(componentCollection.has)) {
    //     func(entityId, componentCollection, world);
    //   }
    // }
  }
}