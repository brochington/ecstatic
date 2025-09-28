import Entity, { EntityId } from './Entity';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import { SystemFunc } from './Systems';
import DevTools from './DevTools';
import Systems from './Systems';
import { TrackedCompSymbolKeys } from './TrackedComponent';
import { EventListenerFunc, EventManager } from './EventManager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
export type ClassConstructor<T> = { new (...args: any[]): T };

/**
 * Defines the structure for a prefab, used for creating entities from a template.
 */
export interface PrefabDefinition<CT> {
  tags?: Tag[];

  components: CT[];
}

export default class World<CT> {
  componentCollections: Map<EntityId, ComponentCollection<CT>> = new Map();

  entities: Map<EntityId, Entity<CT>> = new Map();

  entitiesByCTypes: Map<string, Set<EntityId>> = new Map();

  entitiesByTags: Map<Tag, Set<EntityId>> = new Map();

  systems: Systems<CT>;

  dev: DevTools<CT>;

  events: EventManager<CT>;

  private componentToSystemQueries: Map<string, string[]> = new Map();
  private resources: Map<ClassConstructor<unknown>, unknown> = new Map();
  private prefabs: Map<string, PrefabDefinition<CT>> = new Map();

  constructor() {
    this.dev = new DevTools(this);
    this.systems = new Systems(this);
    this.events = new EventManager(this);
  }

  /**
   * Registers a system-like listener for a specific event type.
   * @param EventType The class of the event to listen for.
   * @param listenerFunc The function to execute when the event is emitted.
   * @param options An object to specify options, like the execution phase.
   */
  addSystemListener<E>(
    EventType: ClassConstructor<E>,
    listenerFunc: EventListenerFunc<E, CT>,
    options: { phase?: string } = {}
  ): this {
    const { phase = 'Events' } = options; // Default to 'Events' phase
    this.events.addListener(EventType, listenerFunc, phase);
    return this;
  }

  /**
   * Stores a singleton resource in the world. Resources are global, unique data structures.
   * @param resource The instance of the resource to store.
   */
  setResource<T>(resource: T): this {
    // @ts-ignore
    this.resources.set(resource.constructor as ClassConstructor<T>, resource);
    return this;
  }

  /**
   * Retrieves a singleton resource from the world.
   * @param ResourceType The class of the resource to retrieve.
   * @returns The resource instance, or undefined if not found.
   */
  getResource<T>(ResourceType: ClassConstructor<T>): T | undefined {
    return this.resources.get(ResourceType) as T;
  }

  /**
   * Checks if a resource exists in the world.
   * @param ResourceType The class of the resource to check.
   */
  hasResource<T>(ResourceType: ClassConstructor<T>): boolean {
    return this.resources.has(ResourceType);
  }

  /**
   * Removes a resource from the world.
   * @param ResourceType The class of the resource to remove.
   */
  removeResource<T>(ResourceType: ClassConstructor<T>): boolean {
    return this.resources.delete(ResourceType);
  }

  /**
   * Registers a prefab definition with the world, allowing for reusable entity templates.
   * @param name A unique name for the prefab.
   * @param definition The prefab definition, including components and optional tags.
   */
  registerPrefab(name: string, definition: PrefabDefinition<CT>): this {
    this.prefabs.set(name, definition);
    return this;
  }

  /**
   * Creates a new entity from a registered prefab.
   * @param name The name of the prefab to use.
   * @param overrides An object to override properties of the prefab's components for this specific instance.
   * @returns The newly created entity.
   */
  createEntityFromPrefab(
    name: string,
    overrides: { [componentName: string]: Partial<CT> } = {}
  ): Entity<CT> {
    const prefab = this.prefabs.get(name);
    if (!prefab) {
      throw new Error(`Prefab with name "${name}" not found.`);
    }

    const entity = this.createEntity();

    // Add tags if they exist
    if (prefab.tags) {
      for (const tag of prefab.tags) {
        entity.addTag(tag);
      }
    }

    // Add and override components
    for (const prefabComponent of prefab.components) {
      // Deep clone the component to prevent shared state between entities
      const componentInstance = JSON.parse(JSON.stringify(prefabComponent));
      // Restore the constructor to maintain proper typing
      Object.setPrototypeOf(
        componentInstance,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prefabComponent as any).constructor.prototype
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const componentName = (prefabComponent as any).constructor.name;

      if (overrides[componentName]) {
        Object.assign(componentInstance, overrides[componentName]);
      }

      entity.add(componentInstance);
    }

    return entity;
  }

  /**
   * Sets the execution order for system phases.
   * @param order An array of phase names in the desired order of execution.
   */
  setPhaseOrder(order: string[]): this {
    this.systems.setPhaseOrder(order);
    return this;
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
      if (ctArr.split(',').every(name => cc.hasByName(name))) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (component as any).onAdd === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onAdd({ world: this, entity, component });
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
    const entity = this.entities.get(eid);
    if (!entity) {
      // This should ideally not happen if a component collection exists.
      return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (component as any).onRemove === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onRemove({ world: this, entity, component });
    }

    // Handle TrackedComponent logic first
    // @ts-ignore
    if (component[TrackedCompSymbolKeys.isTracked]) {
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

    entity.onComponentRemove({ world: this, component });

    return this;
  };

  /**
   * Add a system to the world.
   */
  addSystem(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    options: { phase?: string; name?: string } = {}
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
    this.systems.add(cTypes, systemFunc, canonicalKey, options);

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
   * Destroys an entity
   */
  destroyEntity(entityId: EntityId): this {
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
