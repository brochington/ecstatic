import Entity, { EntityId } from './Entity';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import { SystemFunc } from './Systems';
import DevTools from './DevTools';
import Systems from './Systems';
import { TrackedCompSymbolKeys } from './TrackedComponent';
import { EventListenerFunc, EventManager } from './EventManager';
import { ComponentRegistry } from './ComponentRegistry';
import { Query, QueryDef } from './Query';

export type SerializableClassConstructor<T> = ClassConstructor<T> & {
  // eslint-disable-next-line no-unused-vars
  fromJSON?: (data: unknown) => T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
export type ClassConstructor<T> = { new (...args: any[]): T };

export interface ComponentLifecycle<CT> {
  // eslint-disable-next-line no-unused-vars
  onAdd?: (args: {
    world: World<CT>;
    entity: Entity<CT>;
    component: CT;
  }) => void;
  // eslint-disable-next-line no-unused-vars
  onRemove?: (args: {
    world: World<CT>;
    entity: Entity<CT>;
    component: CT;
  }) => void;
  toJSON?: () => unknown;
}

export interface PrefabDefinition<CT> {
  tags?: Tag[];
  components: CT[];
}

export interface TypeMapping {
  components: Record<string, SerializableClassConstructor<unknown>>;
  resources: Record<string, SerializableClassConstructor<unknown>>;
}

interface SerializedWorld {
  resources: { name: string; data: unknown }[];
  entities: {
    id: EntityId;
    tags: Tag[];
    components: { name: string; data: unknown }[];
  }[];
}

export default class World<CT> {
  // Optimized storage: Arrays instead of Maps
  componentCollections: ComponentCollection<CT>[] = [];
  entities: Entity<CT>[] = [];

  // The active queries indexed by their unique key
  queries: Map<string, Query<CT>> = new Map();

  entitiesByTags: Map<Tag, Set<EntityId>> = new Map();

  entitiesToCreate: Set<Entity<CT>> = new Set();
  entitiesToDestroy: Set<Entity<CT>> = new Set();

  systems: Systems<CT>;
  dev: DevTools<CT>;
  events: EventManager<CT>;

  private nextEntityId = 0;

  // Indexing for fast updates: ComponentName -> Set<QueryKey>
  private componentToQueries: Map<string, Set<string>> = new Map();

  // Queries that must be checked on EVERY component change (min/max/only/different)
  private universalQueries: Set<string> = new Set();

  private resources: Map<ClassConstructor<unknown>, unknown> = new Map();
  private prefabs: Map<string, PrefabDefinition<CT>> = new Map();

  constructor() {
    this.dev = new DevTools(this);
    this.systems = new Systems(this);
    this.events = new EventManager(this);
  }

  /**
   * Creates or retrieves a Query based on the definition.
   * The Query is cached and automatically maintained by the World.
   */
  query(def: QueryDef<CT>): Query<CT> {
    const tempQuery = new Query(this, def);
    const key = tempQuery.key;

    if (this.queries.has(key)) {
      return this.queries.get(key) as Query<CT>;
    }

    // It's a new query, register it
    this.queries.set(key, tempQuery);

    // 1. Populate initial entities
    for (const entity of this.entities) {
      if (entity && entity.state !== 'destroyed' && tempQuery.match(entity)) {
        tempQuery.entities.add(entity.id);
      }
    }

    // 2. Index the query
    if (tempQuery.isUniversal) {
      this.universalQueries.add(key);
    } else {
      // If not universal, we only need to check it when specific components change
      for (const compName of tempQuery.relevantComponents) {
        if (!this.componentToQueries.has(compName)) {
          this.componentToQueries.set(compName, new Set());
        }
        this.componentToQueries.get(compName)?.add(key);
      }
    }

    return tempQuery;
  }

  addSystemListener<E>(
    EventType: ClassConstructor<E>,
    listenerFunc: EventListenerFunc<E, CT>,
    options: { phase?: string } = {}
  ): this {
    const { phase = 'Events' } = options;
    this.events.addListener(EventType, listenerFunc, phase);
    return this;
  }

  setResource<T>(resource: T): this {
    // @ts-ignore
    this.resources.set(resource.constructor as ClassConstructor<T>, resource);
    return this;
  }

  getResource<T>(ResourceType: ClassConstructor<T>): T | undefined {
    return this.resources.get(ResourceType) as T;
  }

  hasResource<T>(ResourceType: ClassConstructor<T>): boolean {
    return this.resources.has(ResourceType);
  }

  removeResource<T>(ResourceType: ClassConstructor<T>): boolean {
    return this.resources.delete(ResourceType);
  }

  registerPrefab(name: string, definition: PrefabDefinition<CT>): this {
    this.prefabs.set(name, definition);
    return this;
  }

  createEntityFromPrefab(
    name: string,
    overrides: { [componentName: string]: Partial<CT> } = {}
  ): Entity<CT> {
    const prefab = this.prefabs.get(name);
    if (!prefab) {
      throw new Error(`Prefab with name "${name}" not found.`);
    }

    const entity = this.createEntity();

    if (prefab.tags) {
      for (const tag of prefab.tags) {
        entity.addTag(tag);
      }
    }

    for (const prefabComponent of prefab.components) {
      const componentInstance = JSON.parse(JSON.stringify(prefabComponent));
      const componentWithConstructor = prefabComponent as CT & {
        constructor: { prototype: unknown; name: string };
      };
      Object.setPrototypeOf(
        componentInstance,
        componentWithConstructor.constructor.prototype as object
      );
      const componentName = componentWithConstructor.constructor.name;

      if (overrides[componentName]) {
        Object.assign(componentInstance, overrides[componentName]);
      }

      entity.add(componentInstance);
    }

    return entity;
  }

  setPhaseOrder(order: string[]): this {
    this.systems.setPhaseOrder(order);
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  find = (predicate: (entity: Entity<CT>) => boolean): Entity<CT> | null => {
    for (const entity of this.entities) {
      if (entity && predicate(entity)) {
        return entity;
      }
    }
    return null;
  };

  // eslint-disable-next-line no-unused-vars
  findAll = (predicate: (entity: Entity<CT>) => boolean): Entity<CT>[] => {
    const results: Entity<CT>[] = [];
    for (const entity of this.entities) {
      if (entity && predicate(entity)) {
        results.push(entity);
      }
    }
    return results;
  };

  locate = (
    cl: ClassConstructor<CT> | ClassConstructor<CT>[]
  ): Entity<CT> | null => {
    // OPTIMIZATION: Use existing query cache if simple 'All' query matches
    const comps = Array.isArray(cl) ? cl : [cl];
    // Try to construct a key for {all: comps}
    const sortedNames = comps
      .map(c => c.name)
      .sort()
      .join(',');
    const key = `all:${sortedNames}`;

    // If we have a cached query for this, use it! O(1)
    if (this.queries.has(key)) {
      const q = this.queries.get(key) as Query<CT>;
      return q.first();
    }

    // Fallback to O(N) scan
    for (const entity of this.entities) {
      if (entity && entity.components.has(cl)) {
        return entity;
      }
    }
    return null;
  };

  locateAll = (
    cl: ClassConstructor<CT> | ClassConstructor<CT>[]
  ): Entity<CT>[] => {
    const comps = Array.isArray(cl) ? cl : [cl];
    const sortedNames = comps
      .map(c => c.name)
      .sort()
      .join(',');
    const key = `all:${sortedNames}`;

    if (this.queries.has(key)) {
      return this.queries.get(key)?.get() || [];
    }

    const results: Entity<CT>[] = [];
    for (const entity of this.entities) {
      if (entity && entity.components.has(cl)) {
        results.push(entity);
      }
    }
    return results;
  };

  grab = <T extends CT>(
    cl: ClassConstructor<T>
  ): { entity: Entity<CT>; component: T } | null => {
    const entity = this.locate(cl);

    if (entity) {
      const cc =
        this.componentCollections[entity.id] || new ComponentCollection<CT>();

      const component = cc.get<T>(cl);

      return {
        entity,
        component,
      };
    }

    return null;
  };

  grabBy = <T extends CT>(
    cl: ClassConstructor<T>,
    // eslint-disable-next-line no-unused-vars
    predicate: (comp: T) => boolean
  ): { entity: Entity<CT>; component: T } | null => {
    const entities = this.locateAll(cl);

    for (const entity of entities) {
      const cc =
        this.componentCollections[entity.id] || new ComponentCollection<CT>();

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

  get = <T extends CT>(eid: EntityId, cl: ClassConstructor<T>): T => {
    const cc = this.componentCollections[eid] || new ComponentCollection<CT>();

    return cc.get<T>(cl);
  };

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

  getTagged = (tag: Tag): Entity<CT> | null => {
    const tagEntityIds = this.entitiesByTags.get(tag);

    if (tagEntityIds) {
      const entityId = tagEntityIds.values().next().value;

      if (entityId !== undefined) {
        const entity = this.entities[entityId];
        if (entity) return entity;
      }
    }

    return null;
  };

  getAllTagged = (tag: Tag): Entity<CT>[] => {
    const entities: Entity<CT>[] = [];

    const tagEntityIds = this.entitiesByTags.get(tag);

    if (tagEntityIds) {
      for (const entityId of tagEntityIds) {
        const entity = this.entities[entityId];
        if (entity) {
          entities.push(entity);
        }
      }
    }

    return entities;
  };

  add = <T extends CT>(eid: EntityId, component: T): this => {
    let cc = this.componentCollections[eid];

    if (!cc) {
      cc = new ComponentCollection<CT>();
      this.componentCollections[eid] = cc;
    }

    const entity = this.entities[eid];

    if (!entity) {
      throw new Error(`world.add: Unable to locate entity with id ${eid}`);
    }

    // --- BITMASK OPTIMIZATION ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compId = ComponentRegistry.getId((component as any).constructor);
    entity.componentMask.set(compId);

    cc.add(component);

    // --- UPDATE QUERIES ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.updateQueries(entity, (component as any).constructor.name);

    // @ts-ignore
    if (component[TrackedCompSymbolKeys.isTracked]) {
      // @ts-ignore
      component[TrackedCompSymbolKeys.setWorld](this);
      // @ts-ignore
      component[TrackedCompSymbolKeys.entityIDs].add(eid);
      // @ts-ignore
      component[TrackedCompSymbolKeys.onAdd](this, entity);
    }

    const componentWithLifecycle = component as CT & ComponentLifecycle<CT>;
    if (componentWithLifecycle.onAdd) {
      componentWithLifecycle.onAdd({ world: this, entity, component });
    }

    entity.onComponentAdd({ world: this, component });

    return this;
  };

  remove = (eid: EntityId, cType: ClassConstructor<CT>): this => {
    const cc = this.componentCollections[eid];
    if (!cc) {
      return this;
    }

    const componentName = cType.name;
    if (!cc.hasByName(componentName)) {
      return this;
    }

    const component = cc.get(cType);
    const entity = this.entities[eid];
    if (!entity) {
      return this;
    }

    const componentWithLifecycle = component as CT & ComponentLifecycle<CT>;
    if (componentWithLifecycle.onRemove) {
      componentWithLifecycle.onRemove({ world: this, entity, component });
    }

    // Handle TrackedComponent logic first
    // @ts-ignore
    if (component[TrackedCompSymbolKeys.isTracked]) {
      // @ts-ignore
      component[TrackedCompSymbolKeys.entityIDs].delete(eid);
      // @ts-ignore
      component[TrackedCompSymbolKeys.onRemove](this, entity);
    }

    const compId = ComponentRegistry.getId(cType);
    entity.componentMask.clear(compId);

    // --- UPDATE QUERIES ---
    cc.remove(cType); // Remove from collection before checking? No, logic usually implies "after change"
    // Actually, we cleared the bitmask above, which is what queries check.

    this.updateQueries(entity, componentName);

    entity.onComponentRemove({ world: this, component });

    return this;
  };

  private updateQueries(entity: Entity<CT>, componentName: string): void {
    // 1. Check specific queries interested in this component
    const affectedKeys = this.componentToQueries.get(componentName);
    if (affectedKeys) {
      for (const key of affectedKeys) {
        this.checkQuery(key, entity);
      }
    }

    // 2. Check universal queries (min, max, only, different)
    for (const key of this.universalQueries) {
      this.checkQuery(key, entity);
    }
  }

  private checkQuery(key: string, entity: Entity<CT>): void {
    const query = this.queries.get(key);
    if (!query) return;

    const matches = query.match(entity);
    const has = query.entities.has(entity.id);

    if (matches && !has) {
      query.entities.add(entity.id);
    } else if (!matches && has) {
      query.entities.delete(entity.id);
    }
  }

  addSystem(
    queryDef: ClassConstructor<CT>[] | QueryDef<CT> | Query<CT>,
    systemFunc: SystemFunc<CT>,
    options: { phase?: string; name?: string } = {}
  ): this {
    // Normalize to a Query object
    let query: Query<CT>;

    if (queryDef instanceof Query) {
      query = queryDef;
      // Ensure this query is actually registered in this world (if passed from external source)
      if (!this.queries.has(query.key)) {
        // Use the definition to register it properly
        // Warning: we can't easily extract Def from Query, so we assume the user
        // passed a Query created via world.query().
        // If they created `new Query(world, def)`, we should ideally register it.
        this.queries.set(query.key, query);
      }
    } else if (Array.isArray(queryDef)) {
      // Legacy support: Array -> { all: [...] }
      query = this.query({ all: queryDef });
    } else {
      // QueryDef object
      query = this.query(queryDef);
    }

    this.systems.add(query, systemFunc, options);

    return this;
  }

  registerEntity(entity: Entity<CT>): World<CT> {
    const cc = new ComponentCollection<CT>();

    this.componentCollections[entity.id] = cc;
    this.entities[entity.id] = entity;

    this.entitiesToCreate.add(entity);

    entity.onCreate(this);

    return this;
  }

  clearEntityComponents(entityId: EntityId): this {
    this.componentCollections[entityId] = new ComponentCollection<CT>();

    for (const query of this.queries.values()) {
      if (query.entities.has(entityId)) {
        query.entities.delete(entityId);
      }
    }

    return this;
  }

  createEntity(): Entity<CT> {
    const entityId = ++this.nextEntityId;
    const entity = new Entity(this, entityId);

    return entity;
  }

  destroyEntity(entityId: EntityId): this {
    delete this.componentCollections[entityId];

    const entity = this.entities[entityId];
    if (!entity) {
      throw new Error(
        `world.destroyEntity: No entity found. entity id: ${entityId}`
      );
    }

    delete this.entities[entityId];

    this.entitiesToCreate.delete(entity);
    this.entitiesToDestroy.delete(entity);

    for (const query of this.queries.values()) {
      if (query.entities.has(entityId)) {
        query.entities.delete(entityId);
      }
    }

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

  toJSON(): SerializedWorld {
    const serialized: SerializedWorld = {
      resources: [],
      entities: [],
    };

    for (const [constructor, instance] of this.resources.entries()) {
      const serializableInstance = instance as unknown & {
        toJSON?: () => unknown;
      };
      const data = serializableInstance.toJSON
        ? serializableInstance.toJSON()
        : { ...(instance as object) };
      serialized.resources.push({ name: constructor.name, data });
    }

    for (const entity of this.entities) {
      if (!entity) continue;

      const serializedComponents: { name: string; data: unknown }[] = [];
      const components = this.componentCollections[entity.id];

      if (components) {
        for (const component of components) {
          const componentWithToJSON = component as CT & ComponentLifecycle<CT>;
          const data = componentWithToJSON.toJSON
            ? componentWithToJSON.toJSON()
            : { ...component };
          serializedComponents.push({
            name: (component as { constructor: { name: string } }).constructor
              .name,
            data,
          });
        }
      }

      serialized.entities.push({
        id: entity.id,
        tags: Array.from(entity.tags),
        components: serializedComponents,
      });
    }

    return serialized;
  }

  static fromJSON<CT>(
    serializedWorld: SerializedWorld,
    typeMapping: TypeMapping
  ): World<CT> {
    const world = new World<CT>();

    for (const res of serializedWorld.resources) {
      const ResourceClass = typeMapping.resources[res.name];
      if (!ResourceClass) {
        throw new Error(
          `Cannot hydrate resource: Class constructor for "${res.name}" not found in typeMapping.resources.`
        );
      }
      let instance: unknown;
      if (ResourceClass.fromJSON) {
        instance = ResourceClass.fromJSON(res.data);
      } else {
        instance = new ResourceClass();
        Object.assign(instance as object, res.data);
      }
      world.setResource(instance);
    }

    let maxId = 0;
    for (const ent of serializedWorld.entities) {
      if (typeof ent.id === 'number' && ent.id > maxId) {
        maxId = ent.id;
      }
    }
    world.nextEntityId = maxId;

    for (const ent of serializedWorld.entities) {
      const entity = new Entity(world, ent.id);
      world.registerEntity(entity);

      for (const tag of ent.tags) {
        entity.addTag(tag);
      }

      for (const comp of ent.components) {
        const ComponentClass = typeMapping.components[comp.name];
        if (!ComponentClass) {
          throw new Error(
            `Cannot hydrate component: Class constructor for "${comp.name}" not found in typeMapping.components.`
          );
        }
        let instance: unknown;
        if (ComponentClass.fromJSON) {
          instance = ComponentClass.fromJSON(comp.data);
        } else {
          instance = new ComponentClass();
          Object.assign(instance as object, comp.data);
        }
        entity.add(instance as CT);
      }
    }

    return world;
  }
}
