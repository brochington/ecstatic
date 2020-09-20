import Entity, { EntityId } from "./Entity";
import ComponentCollection from "./ComponentCollection";
import { Tag } from "./Tag";
import { CompTypes } from "interfaces";

type FindPredicate<CT extends CompTypes<CT>> = (entity: Entity<CT>) => boolean;

type Class<T> = { new (...args: any[]): T };

export default class World<CT extends CompTypes<CT>> {
  componentCollections: Map<EntityId, ComponentCollection<CT>> = new Map();

  entities: Map<EntityId, Entity<CT>> = new Map();

  entitiesByCTypes: Map<(keyof CT)[], Set<EntityId>> = new Map();

  entitiesByTags: Map<Tag, Set<EntityId>> = new Map();

  /**
   * "finds" a single entity based on a predicate
   */
  find = (predicate: FindPredicate<CT>): Entity<CT> | null => {
    for (const entity of this.entities.values()) {
      if (predicate(entity)) {
        return entity;
      }
    }

    return null;
  };

  /**
   * "finds" all entities based on a predicate, kinda like filter.
   */
  findAll = (predicate: FindPredicate<CT>): Entity<CT>[] => {
    const results: Entity<CT>[] = [];

    for (const entity of this.entities.values()) {
      if (predicate(entity)) {
        results.push(entity);
      }
    }

    return results;
  };

  /**
   * "locates" a single entity based on its Components.
   */
  locate = (cl: CT[keyof CT] | CT[keyof CT][]): Entity<CT> | null => {
    for (const entity of this.entities.values()) {
      // console.log("entity?", entity.components, cl.name);
      if (entity.components.has(cl)) {
        return entity;
      }
    }

    return null;
  };

  /**
   * Locates all entities that contain the components named
   */
  locateAll = (cl: CT[keyof CT] | CT[keyof CT][]): Entity<CT>[] => {
    const results: Entity<CT>[] = [];

    for (const entity of this.entities.values()) {
      if (entity.components.has(cl)) {
        results.push(entity);
      }
    }

    return results;
  };

  /**
   * Grabs the first entity, and its related component, that matches the component type.
   * @example
   * ```
   * const { entity, component } = world.grab(MyComponent);
   * ```
   */
  grab = <T>(
    cl: Class<T>
  ): { entity: Entity<CT>; component: InstanceType<typeof cl> } | null => {
    const entity = this.locate((cl as unknown) as CT[keyof CT]);

    if (entity) {
      const cc =
        this.componentCollections.get(entity.id) ||
        new ComponentCollection<CT>();

      const component = cc.get<T>(cl);

      return {
        entity,
        component,
      };
    }

    return null;
  };

  /**
   * Grab single component based on component type and predicate.
   *
   * @example
   * ```typescript
   * const { entity, component } = world.grabBy(Components.FirstComponent, (comp) => comp.id == 'awesome')
   * ```
   */
  grabBy = <T>(
    cl: Class<T>,
    predicate: (comp: InstanceType<typeof cl>) => boolean
  ): { entity: Entity<CT>; component: InstanceType<typeof cl> } | null => {
    const entities = this.locateAll((cl as unknown) as CT[keyof CT]);

    for (const entity of entities) {
      const cc =
        this.componentCollections.get(entity.id) ||
        new ComponentCollection<CT>();

      const component = cc.get<T>(cl);

      if (predicate(component)) {
        return {
          component,
          entity,
        };
      }
    }

    return null;
  };

  /**
   * Grab all the components primarily, and the entities if needed
   */
  grabAll = <T>(
    cl: Class<T>
  ): { entity: Entity<CT>; component: InstanceType<typeof cl> }[] => {
    const entities = this.locateAll((cl as unknown) as CT[keyof CT]);

    return entities.map((entity) => {
      return {
        entity,
        component: entity.components.get<T>(cl),
      }
    });
  };

  /**
   * Given an entity id and componentType, returns component
   */
  get = <T>(eid: EntityId, cl: Class<T>): InstanceType<typeof cl> => {
    const cc =
      this.componentCollections.get(eid) || new ComponentCollection<CT>();

    return cc.get<T>(cl);
  };

  /**
   * Get an entity that has been tagged with the given tag, or return null;
   */
  getTagged = (tag: Tag): Entity<CT> | null => {
    const tagEntityIds = this.entitiesByTags.get(tag);

    if (tagEntityIds) {
      const entityId = tagEntityIds.values().next().value;

      const entity = this.entities.get(entityId);

      if (entity) {
        return entity;
      }
    }

    return null;
  };

  getAllTagged = (tag: Tag): Entity<CT>[] => {
    let entities: Entity<CT>[] = []; // eslint-disable-line

    const tagEntityIds = this.entitiesByTags.get(tag);

    if (tagEntityIds) {
      for (const entityId of tagEntityIds) {
        const entity = this.entities.get(entityId);
        if (entity) {
          entities.push(entity);
        }
      }
    }

    return entities;
  };

  /**
   * Set a component on the given entity
   */
  set = (eid: EntityId, component: InstanceType<CT[keyof CT]>): World<CT> => {
    const cc =
      this.componentCollections.get(eid) || new ComponentCollection<CT>();

    cc.add(component);

    this.componentCollections.set(eid, cc);

    for (const [ctArr, entitySet] of this.entitiesByCTypes) {
      if ((ctArr as string[]).every(cc.hasByName)) {
        entitySet.add(eid);
      }
    }

    return this;
  };

  /**
   * Remove a component from the given entity.
   * NOTE: This will change what systems will be called on the entity.
   */
  remove = (eid: EntityId, cType: CT[keyof CT]): void => {
    const cc =
      this.componentCollections.get(eid) || new ComponentCollection<CT>();

    // remove entity from current entitiesByCTypes
    for (const [ctArr, entitySet] of this.entitiesByCTypes) {
      if ((ctArr as string[]).every(cc.hasByName)) {
        entitySet.delete(eid);
      }
    }

    cc.remove(cType);

    // Move entityId to new CTypes if needed.
    for (const [ctArr, entitySet] of this.entitiesByCTypes) {
      if ((ctArr as string[]).every(cc.hasByName)) {
        entitySet.add(eid);
      }
    }
  };

  /**
   * Internal method used in setting up a new system.
   */
  registerSystem(cNames: (keyof CT)[]): World<CT> {
    this.entitiesByCTypes.set(cNames, new Set<EntityId>());

    return this;
  }

  registerEntity(entity: Entity<CT>): World<CT> {
    const cc = new ComponentCollection<CT>();

    this.componentCollections.set(entity.id, cc);
    this.entities.set(entity.id, entity);

    return this;
  }

  /**
   * Remove all components that belong to an entity.
   */
  clearEntityComponents(eid: EntityId): World<CT> {
    this.componentCollections.set(eid, new ComponentCollection<CT>());

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(eid)) {
        entitySet.delete(eid);
      }
    }

    return this;
  }

  /**
   * Destroys an entity.
   * Same as entity.destroy().
   */
  destroyEntity(eid: EntityId): World<CT> {
    this.componentCollections.delete(eid);
    this.entities.delete(eid);

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(eid)) {
        entitySet.delete(eid);
      }
    }

    // remove any tag associations with destroyed entities.
    for (const [tag, entitySet] of this.entitiesByTags) {
      if (entitySet.has(eid)) {
        entitySet.delete(eid);
      }

      if (entitySet.size === 0) {
        this.entitiesByTags.delete(tag);
      }
    }

    return this;
  }
}
