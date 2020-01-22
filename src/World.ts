import { EntityId } from './Entity';
import { Component } from './Component';
import ComponentCollection from './ComponentCollection';

export default class World<CT> {
  entities: Map<EntityId, ComponentCollection<CT>> = new Map();
  entitiesByCType: Map<CT[], Set<EntityId>> = new Map();

  simulate = (func: Function): void => {
    func(this.entities);
  }

  set = (eid: EntityId, component: Component<CT>): void => {
    const cc = this.entities.get(eid) || new ComponentCollection<CT>();

    cc.add(component);

    this.entities.set(eid, cc);

    for (const [ctArr, entitySet] of this.entitiesByCType) {
      if (ctArr.every(cc.has)) {
        entitySet.add(eid);
      }
    }
  }

  registerSystem(cTypes: CT[]): void {
    this.entitiesByCType.set(cTypes, new Set<EntityId>());
  }

  registerEntity(eid: EntityId): void {
    const cc = new ComponentCollection<CT>();
    this.entities.set(eid, cc);
  }
}
