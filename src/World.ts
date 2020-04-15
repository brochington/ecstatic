import Entity, { EntityId } from './Entity';
import { Component } from './Component';
import ComponentCollection from './ComponentCollection';

type FindPredicate<CT> = (entity: Entity<CT>) => boolean;

type GrabPredicate<C> = (component: C) => boolean;

interface SingleComponentResp<CT, C> {
  entity: Entity<CT>;
  component: C;
}

export default class World<CT> {
  componentCollections: Map<EntityId, ComponentCollection<CT>> = new Map();

  entities: Map<EntityId, Entity<CT>> = new Map();

  entitiesByCTypes: Map<CT[], Set<EntityId>> = new Map();

  /** "finds" a single entity based on a predicate */
  find = (predicate: FindPredicate<CT>): Entity<CT> | null => {
    for (const entity of this.entities.values()) {
      if (predicate(entity)) {
        return entity;
      }
    }

    return null;
  }

  /** "finds" all entities based on a predicate, kinda like filter. */
  findAll = (predicate: FindPredicate<CT>): Entity<CT>[] => {
    const results: Entity<CT>[] = [];

    for (const entity of this.entities.values()) {
      if (predicate(entity)) {
        results.push(entity);
      }
    }

    return results;
  }

  /** "locates" a single entity based on its Components. */
  locate = (cTypes: CT | CT[]): Entity<CT> | null => {
    for (const entity of this.entities.values()) {
      if (entity.components.has(cTypes)) {
        return entity;
      }
    }

    return null;
  }

  /** Locates all entities that contain the components named */
  locateAll = (cTypes: CT | CT[]): Entity<CT>[] => {
    const results: Entity<CT>[] = [];

    for (const entity of this.entities.values()) {
      if (entity.components.has(cTypes)) {
        results.push(entity);
      }
    }

    return results;
  }

  /* Grab single component based on component type and predicate. */
  grabBy = <C>(cType: CT, predicate: GrabPredicate<C>): SingleComponentResp<CT, C> | null => {
    const entities = this.locateAll(cType);

    for (const entity of entities) {

      const cc = this.componentCollections.get(entity.id);

      const component = cc.get(cType) as unknown as C;


      if (predicate(component)) {
        return {
          component,
          entity,
        }
      }
    }

    return null;
  }

  /** Grab all the components primarily, and the entities if needed  */
  grabAll = <C>(cType: CT): SingleComponentResp<CT, C>[] => {
    return this
      .locateAll(cType)
      .map(entity => ({
        entity,
        component: entity.components.get(cType) as unknown as C,
      }));
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
