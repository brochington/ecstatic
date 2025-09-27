import Entity, { EntityId } from './Entity';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import { SystemFunc } from './Systems';
import DevTools from './DevTools';
import Systems from './Systems';
import { TrackedCompSymbolKeys } from './TrackedComponent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
export type ClassConstructor<T> = { new (...args: any[]): T };

export default class World<CT> {
  componentCollections: Map<EntityId, ComponentCollection<CT>> = new Map();

  entities: Map<EntityId, Entity<CT>> = new Map();

  entitiesByCTypes: Map<string, Set<EntityId>> = new Map();

  entitiesByTags: Map<Tag, Set<EntityId>> = new Map();

  systems: Systems<CT>;

  dev: DevTools<CT>;

  private componentToSystemQueries: Map<string, string[]> = new Map();

  constructor() {
    this.dev = new DevTools(this);
    this.systems = new Systems(this);
  }

  /**
   * "finds" a single entity based on a predicate
   */
  // eslint-disable-next-line no-unused-vars
  find = (predicate: (entity: Entity<CT>) => boolean): Entity<CT> | null => {
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
  // eslint-disable-next-line no-unused-vars
  findAll = (predicate: (entity: Entity<CT>) => boolean): Entity<CT>[] => {
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
  locate = (
    cl: ClassConstructor<CT> | ClassConstructor<CT>[]
  ): Entity<CT> | null => {
    for (const entity of this.entities.values()) {
      if (entity.components.has(cl)) {
        return entity;
      }
    }

    return null;
  };

  /**
   * Locates all entities that contain the components named
   */
  locateAll = (
    cl: ClassConstructor<CT> | ClassConstructor<CT>[]
  ): Entity<CT>[] => {
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
  grab = <T extends CT>(
    cl: ClassConstructor<T>
  ): { entity: Entity<CT>; component: T } | null => {
    const entity = this.locate(cl);

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
   * const { entity, component } = world.grabBy(FirstComponent, (comp) => comp.id == 'awesome')
   * ```
   */
  grabBy = <T extends CT>(
    cl: ClassConstructor<T>,
    // eslint-disable-next-line no-unused-vars
    predicate: (comp: T) => boolean
  ): { entity: Entity<CT>; component: T } | null => {
    const entities = this.locateAll(cl);
    // const entities = this.locateAll((cl as unknown) as CT);

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
  grabAll = <T extends CT>(
    cl: ClassConstructor<T>
  ): { entity: Entity<CT>; component: T }[] => {
    const entities = this.locateAll(cl);

    return entities.map(entity => {
      return {
        entity,
        component: entity.components.get<T>(cl),
      };
    });
  };

  // TODO: Add grabAllBy method

  /**
   * Given an entity id and componentType, returns component
   */
  get = <T extends CT>(eid: EntityId, cl: ClassConstructor<T>): T => {
    const cc =
      this.componentCollections.get(eid) || new ComponentCollection<CT>();

    return cc.get<T>(cl);
  };

  /**
   * Find and get the first instance of a component, without any associated entities.
   * Helpful is you know that only one instance of a component exists across all entities.
   * @param cl Component Class Contructor
   * @param defaultValue A default component instance if no components are found.
   */
  getComponent = <T extends CT>(
    cl: ClassConstructor<T>,
    defaultValue?: T
  ): T | null => {
    const result = this.grab(cl);

    if (!result) {
      return defaultValue ? defaultValue : null;
    }

    return result.component;
  };

  /**
   * Get an entity that has been tagged with the given tag, or return null;
   */
  getTagged = (tag: Tag): Entity<CT> | null => {
    const tagEntityIds = this.entitiesByTags.get(tag);

    if (tagEntityIds) {
      const entityId = tagEntityIds.values().next().value;

      if (entityId) {
        const entity = this.entities.get(entityId);

        if (entity) {
          return entity;
        }
      }
    }

    return null;
  };

  /**
   * Get all entities that have been tagged with the given tag.
   * @param tag A string or number.
   */
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
   * Add a component on the given entity
   */
  add = <T extends CT>(eid: EntityId, component: T): this => {
    const cc =
      this.componentCollections.get(eid) || new ComponentCollection<CT>();

    const entity = this.entities.get(eid);

    if (!entity) {
      throw new Error(`world.add: Unable to locate entity with id ${eid}`);
    }

    cc.add(component);

    this.componentCollections.set(eid, cc);

    for (const [ctArr, entitySet] of this.entitiesByCTypes) {
      if (ctArr.split(',').every(cc.hasByName)) {
        entitySet.add(eid);
      }
    }

    // @ts-ignore
    if (component[TrackedCompSymbolKeys.isTracked]) {
      // @ts-ignore
      component[TrackedCompSymbolKeys.setWorld](this);
      // @ts-ignore
      component[TrackedCompSymbolKeys.entityIDs].add(eid);
      // @ts-ignore
      component[TrackedCompSymbolKeys.onAdd](this, entity);
    }

    entity.onComponentAdd({ world: this, component });

    return this;
  };

  /**
   * Remove a component from the given entity.
   * NOTE: This will change what systems will be called on the entity.
   */
  remove = (eid: EntityId, cType: ClassConstructor<CT>): this => {
    const cc = this.componentCollections.get(eid);
    if (!cc) {
      return this;
    }

    const componentName = cType.name;
    if (!cc.hasByName(componentName)) {
      return this;
    }

    const component = cc.get(cType);

    // Handle TrackedComponent logic first
    // @ts-ignore
    if (component[TrackedCompSymbolKeys.isTracked]) {
      const entity = this.entities.get(eid);
      if (!entity) {
        throw new Error(
          `world.remove: Unable to locate entity for TrackedComponent. eid: ${eid}, cType: ${cType.name}`
        );
      }
      // @ts-ignore
      component[TrackedCompSymbolKeys.entityIDs].delete(eid);
      // @ts-ignore
      component[TrackedCompSymbolKeys.onRemove](this, entity);
    }

    const affectedQueryKeys =
      this.componentToSystemQueries.get(componentName) || [];

    for (const queryKey of affectedQueryKeys) {
      const entitySet = this.entitiesByCTypes.get(queryKey);
      if (entitySet) {
        entitySet.delete(eid);
      }
    }

    cc.remove(cType);

    for (const [canonicalKey, entitySet] of this.entitiesByCTypes.entries()) {
      if (canonicalKey.split(',').every(name => cc.hasByName(name))) {
        entitySet.add(eid);
      }
    }

    const entity = this.entities.get(eid);
    if (entity) {
      entity.onComponentRemove({ world: this, component });
    }

    return this;
  };

  /**
   * Method for adding systems.
   */
  addSystem(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    funcName?: string
  ): this {
    const cNames = cTypes.map(ct => ct.name).sort(); // Sort for consistency
    const canonicalKey = cNames.join(','); // Create a stable string key

    // Populate an inverted index for quick lookup of systems by component type.
    for (const componentName of cNames) {
      const existingQueries =
        this.componentToSystemQueries.get(componentName) || [];
      if (!existingQueries.includes(canonicalKey)) {
        existingQueries.push(canonicalKey);
      }
      this.componentToSystemQueries.set(componentName, existingQueries);
    }

    // Pass the canonical key to the Systems manager
    this.systems.add(cTypes, systemFunc, canonicalKey, funcName);

    return this;
  }

  /**
   * Setup an entity to exist in the given world. This is mostly an internal method, but exposed just in case.
   */
  registerEntity(entity: Entity<CT>): World<CT> {
    const cc = new ComponentCollection<CT>();

    this.componentCollections.set(entity.id, cc);
    this.entities.set(entity.id, entity);

    entity.onCreate(this);

    return this;
  }

  /**
   * Remove all components that belong to an entity.
   */
  clearEntityComponents(entityId: EntityId): this {
    this.componentCollections.set(entityId, new ComponentCollection<CT>());

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(entityId)) {
        entitySet.delete(entityId);
      }
    }

    return this;
  }

  /**
   * Create an entity that is in the world.
   * Basically just new Entity(world), but saves an import of Entity.
   */
  createEntity(): Entity<CT> {
    const entity = new Entity(this);

    return entity;

    // Register entity here....
  }

  /**
   * Destroys an entity.
   * Same as entity.destroy().
   */
  destroyEntity(entityId: EntityId): World<CT> {
    this.componentCollections.delete(entityId);
    const entity = this.entities.get(entityId);

    if (!entity) {
      throw new Error(
        `world.destroyEntity: No entity found. entity id: ${entityId}`
      );
    }

    this.entities.delete(entityId);

    for (const entitySet of this.entitiesByCTypes.values()) {
      if (entitySet.has(entityId)) {
        entitySet.delete(entityId);
      }
    }

    // remove any tag associations with destroyed entities.
    for (const [tag, entitySet] of this.entitiesByTags) {
      if (entitySet.has(entityId)) {
        entitySet.delete(entityId);
      }

      if (entitySet.size === 0) {
        this.entitiesByTags.delete(tag);
      }
    }

    return this;
  }

  /*
  TODO: world.destroy() and world.destroyImmediately() methods.
  */
}
