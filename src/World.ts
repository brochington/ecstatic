import Entity, { EntityId } from './Entity';
import { Component } from './Component';
import ComponentCollection from './ComponentCollection';

export default class World<CT> {
  componentCollections: Map<EntityId, ComponentCollection<CT>> = new Map();

  entities: Map<EntityId, Entity<CT>> = new Map();

  entitiesByCTypes: Map<CT[], Set<EntityId>> = new Map();


  simulate = (func: Function): void => {
    func(this.componentCollections);
  }

  set = (eid: EntityId, component: Component<CT>): void => {
    const cc = this.componentCollections.get(eid) || new ComponentCollection<CT>();

    cc.add(component);

    this.componentCollections.set(eid, cc);

    for (const [ctArr, entitySet] of this.entitiesByCTypes) {
      if (ctArr.every(cc.has)) {
        entitySet.add(eid);
      }
    }
  }

  registerSystem(cTypes: CT[]): void {
    this.entitiesByCTypes.set(cTypes, new Set<EntityId>());
  }

  registerEntity(entity: Entity<CT>): void {
    const cc = new ComponentCollection<CT>();

    this.componentCollections.set(entity.id, cc);
    this.entities.set(entity.id, entity);
  }

  clearEntityComponents(eid: EntityId): void {
    this.componentCollections.set(eid, new ComponentCollection<CT>());

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(eid)) {
        entitySet.delete(eid);
      }
    }
  }

  destroyEntity(eid: EntityId): void {
    this.componentCollections.delete(eid);
    this.entities.delete(eid);

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(eid)) {
        entitySet.delete(eid);
      }
    }
  }
}
