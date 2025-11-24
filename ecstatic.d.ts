export type Tag = string | number;

export type State = string | number | symbol;

export type ClassConstructor<T> = { new (...args: any[]): T };

export type SerializableClassConstructor<T> = ClassConstructor<T> & {
  fromJSON?: (data: unknown) => T;
};

export type EntityId = number;

export type EntityState =
  | "creating"
  | "created"
  | "destroying"
  | "destroyed"
  | "error";

export interface EntityCompEventArgs<CT> {
  world: World<CT>;
  component: CT;
}

export interface ComponentLifecycleEventArgs<CT> {
  world: World<CT>;
  entity: Entity<CT>;
  component: CT;
}

export interface ComponentLifecycle<CT> {
  onAdd?: (args: {
    world: World<CT>;
    entity: Entity<CT>;
    component: CT;
  }) => void;
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

export interface SerializedWorld {
  resources: { name: string; data: unknown }[];
  entities: {
    id: EntityId;
    tags: Tag[];
    components: { name: string; data: unknown }[];
  }[];
}

export interface EventListenerArgs<E, CT> {
  event: E;
  world: World<CT>;
}

export type EventListenerFunc<E, CT> = (args: EventListenerArgs<E, CT>) => void;

export type Transitions<S extends State, D = undefined> = Record<
  S,
  (data: D, current: S) => S
>;

export class Entity<CT> {
  get id(): EntityId;
  get world(): World<CT>;

  /**
   * Get the current state of the entity.
   */
  get state(): EntityState;

  constructor(world: World<CT>, id: EntityId);

  /* LifeCycle methods, meant to be overridden */

  onCreate(world: World<CT>): void;

  onDestroy(world: World<CT>): void;

  onComponentAdd(args: EntityCompEventArgs<CT>): void;

  onTrackedComponentUpdate(args: EntityCompEventArgs<CT>): void;

  onComponentRemove(args: EntityCompEventArgs<CT>): void;

  /**
   * Add a component to an Entity
   */
  add<T extends CT>(component: T): this;

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): this;

  /**
   * Check to see if the entity has a specific component.
   */
  has<T extends CT>(cType: ClassConstructor<T>): boolean;

  /**
   * Check to see if the entity has at least one of the given components.
   */
  hasSome<T extends CT>(cTypes: ClassConstructor<T>[]): boolean;

  /**
   * Check to see if an entity tagged with a given tag.
   */
  hasTag(tag: Tag): boolean;

  /**
   * Get a component that belongs to an entity.
   */
  get<T extends CT>(cl: ClassConstructor<T>): T;

  /**
   * Get all components that have been added to an entity, via a ComponentCollection
   */
  getAll(): ComponentCollection<CT>;

  /**
   * Get all components that have been added to an entity, via a ComponentCollection.
   * Does the same thing as entityInstance.getAll().
   */
  get components(): ComponentCollection<CT>;

  /**
   * Retrieves all the tags that have been added to this entity.
   */
  get tags(): Set<Tag>;

  /**
   * Remove a component from an entity.
   * @param cType A component class, eg MyComponent
   */
  remove(cType: ClassConstructor<CT>): this;

  /**
   * Remove a tag from an entity
   */
  removeTag(tag: Tag): this;

  /**
   * Clears all components from an Entity
   */
  clear(): this;

  /**
   * Remove all tags on an entity
   */
  clearTags(): this;

  /**
   * Sets the state of the entity to 'created'. that's it.
   */
  finishCreation(): void;

  /**
   * Destroy an entity. Actual destruction is deferred until after the next pass of systems.
   * This gives the systems a chance to do any cleanup that might be needed.
   */
  destroy(): void;

  /**
   * Immediately destroy an entity. does not defer until after a systems pass like entity.destroy() does.
   */
  destroyImmediately(): void;

  /**
   * Convert Entity to a DevEntity. Very helpful in for debugging.
   */
  toDevEntity(): DevEntity<CT>;
}

export interface DevEntityTableRow {
  id: EntityId;
  components: string;
  tags: string;
  systems: string;
}

export class DevEntity<CT> {
  id: EntityId;

  components: Record<string, CT>;

  tags: Tag[];

  systems: string[];

  state: EntityState;

  constructor(entity: Entity<CT>, world: World<CT>);

  toTableRow(): DevEntityTableRow;
}

interface DevSystemComps {
  system: string;
  components: string;
}

declare class DevTools<CT> {
  world: World<CT>;

  constructor(world: World<CT>);

  /**
   * display the all systems of the world, and the components required by each system.
   * Super helpful to use with console.table()
   * @example
   * ```
   * console.table(world.dev.systemComponents);
   * ```
   */
  get systemComponents(): DevSystemComps[];

  /**
   * Create an array of DevEntites. Can be very helpful for things like inspecting component state,
   * and which systems will be called on an entity.
   * @example
   * ```
   * console.table(world.dev.entities);
   *
   * // Pro tip! try displaying a table of entities with console.table and DevEntity.toTableRow().
   * console.table(world.dev.entities.map(devEntity => devEntity.toTableRow()));
   * ```
   */

  get entities(): DevEntity<CT>[];
}

export class ComponentCollection<CT> {
  components: Map<string, CT>;

  add(component: CT): void;

  update<T extends CT>(
    cl: ClassConstructor<CT>,
    func: (c: T) => T
  ): void;

  /**
   * Remove a component.
   * @param cType Class of component to remove.
   */
  remove(cType: ClassConstructor<CT>): void;

  /**
   * Get a component that matches the passed class.
   * Will throw an error if an instance of the given component
   * doesn't exist in the collection, so if you don't know if it's safe
   * to get a component, you should test with has() or hasByName() first.
   * You have been warned.
   * @param cl component Class reference.
   */
  get<T extends CT>(cl: ClassConstructor<T>): T;

  /**
   * Test to see if the collection contains a specific Class or Classes.
   * @param cType component Class, or array of component Classes.
   */
  has(cType: ClassConstructor<CT> | ClassConstructor<CT>[]): boolean;

  /**
   * Test to see if the collection contains at least one of the given Classes.
   * @param cTypes array of component Classes.
   */
  hasSome(cTypes: ClassConstructor<CT>[]): boolean;

  /**
   * Test to see if the collection has a component instance based on a
   * class name. Some build steps/minifiers will change the name of Classes,
   * so it's usually best to pass in a MyClass.name instead of 'MyClass'.
   * @param cName The name of a Class, or array of Class names.
   */
  hasByName(cName: string | string[]): boolean;

  /**
   * Get the component type names that are currently being used in the collection.
   */
  get componentTypes(): string[];

  /**
   * Get the current number of components that are in the collection.
   */
  get size(): number;

  /**
   * Make ComponentCollection iterable by delegating to the internal Map's iterator.
   * This allows for...of loops, spreading [...collection], and Array.from(collection).
   */
  [Symbol.iterator](): IterableIterator<CT>;

  toDevComponents(): Record<string, CT>;
}

export type System = () => void;

export interface SystemFuncArgs<CT> {
  entity: Entity<CT>;
  components: ComponentCollection<CT>;
  world: World<CT>;
  index: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
  dt: number;
  time: number;
}

export type SystemFunc<CT> = (
  args: SystemFuncArgs<CT>
) => void;

declare class Systems<CT> {
  world: World<CT>;

  systemFuncBySystemName: Map<string, SystemFunc<CT>>;

  compNamesBySystemName: Map<string, string[]>;

  constructor(world: World<CT>);

  setPhaseOrder(order: string[]): void;

  add(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    canonicalKey: string,
    options: { phase?: string; name?: string }
  ): this;

  run(args?: { dt?: number; time?: number }): void;
}

declare class World<CT> {
  componentCollections: Map<EntityId, ComponentCollection<CT>>;

  entities: Map<EntityId, Entity<CT>>;

  entitiesByCTypes: Map<string[], Set<EntityId>>;

  entitiesByTags: Map<Tag, Set<EntityId>>;

  /**
   * Provides access to systems added to the world.
   * Exposes the all important `world.systems.run()` method, so you can run your systems.
   */
  systems: Systems<CT>;

  /**
   * Lots of cool things to help view the state of the world. Check it out!
   */
  dev: DevTools<CT>;

  /**
   * Event management system for handling custom events.
   */
  events: EventManager<CT>;

  /**
   * "finds" a single entity based on a predicate
   */
  find: (predicate: (entity: Entity<CT>) => boolean) => Entity<CT> | null;

  /**
   * "finds" all entities based on a predicate, kinda like filter.
   */
  findAll: (predicate: (entity: Entity<CT>) => boolean) => Entity<CT>[];

  /**
   * "locates" a single entity based on its Components.
   */
  locate: (cl: ClassConstructor<CT> | ClassConstructor<CT>[]) => Entity<CT> | null;

  /**
   * Locates all entities that contain the components named
   */
  locateAll: (cl: ClassConstructor<CT> | ClassConstructor<CT>[]) => Entity<CT>[];

  /**
   * Grabs the first entity, and its related component, that matches the component type.
   * @example
   * ```
   * const { entity, component } = world.grab(MyComponent);
   * ```
   */
  grab: <T extends CT>(
    cl: ClassConstructor<T>
  ) => { entity: Entity<CT>; component: T } | null;

  /**
   * Grab single component based on component type and predicate.
   *
   * @example
   * ```typescript
   * const { entity, component } = world.grabBy(FirstComponent, (comp) => comp.id == 'awesome')
   * ```
   */
  grabBy: <T extends CT>(
    cl: ClassConstructor<T>,
    predicate: (comp: T) => boolean
  ) => { entity: Entity<CT>; component: T } | null;

  /**
   * Grab all the components primarily, and the entities if needed
   */
  grabAll: <T extends CT>(
    cl: ClassConstructor<T>
  ) => { entity: Entity<CT>; component: T }[];

  /**
   * Given an entity id and componentType, returns component
   */
  get: <T extends CT>(eid: EntityId, cl: ClassConstructor<T>) => T;

  /**
   * Find and get the first instance of a component, without any associated entities.
   * Helpful is you know that only one instance of a component exists across all entities.
   * @param cl Component Class Contructor
   * @param defaultValue A default component instance if no components are found.
   */
  getComponent<T extends CT>(cl: ClassConstructor<T>): T | null;
  getComponent<T extends CT>(cl: ClassConstructor<T>, defaultValue?: T): T;

  /**
   * Get an entity that has been tagged with the given tag, or return null;
   */
  getTagged(tag: Tag): Entity<CT> | null;

  /**
   * Get all entities that have been given a tag.
   */
  getAllTagged(tag: Tag): Entity<CT>[];

  /**
   * Add a component on the given entity
   */
  add: <T extends CT>(eid: EntityId, component: T) => this;

  /**
   * Remove a component from the given entity.
   * NOTE: This will change what systems will be called on the entity.
   */
  remove: (eid: EntityId, cType: ClassConstructor<CT>) => this;

  /**
   * Registers a system-like listener for a specific event type.
   */
  addSystemListener<E>(
    EventType: ClassConstructor<E>,
    listenerFunc: EventListenerFunc<E, CT>,
    options: { phase?: string }
  ): this;

  /**
   * Stores a singleton resource in the world. Resources are global, unique data structures.
   */
  setResource<T>(resource: T): this;

  /**
   * Retrieves a singleton resource from the world.
   */
  getResource<T>(ResourceType: ClassConstructor<T>): T | undefined;

  /**
   * Checks if a resource exists in the world.
   */
  hasResource<T>(ResourceType: ClassConstructor<T>): boolean;

  /**
   * Removes a resource from the world.
   */
  removeResource<T>(ResourceType: ClassConstructor<T>): boolean;

  /**
   * Registers a prefab definition with the world, allowing for reusable entity templates.
   */
  registerPrefab(name: string, definition: PrefabDefinition<CT>): this;

  /**
   * Creates a new entity from a registered prefab.
   */
  createEntityFromPrefab(
    name: string,
    overrides: { [componentName: string]: Partial<CT> }
  ): Entity<CT>;

  /**
   * Sets the execution order for system phases.
   */
  setPhaseOrder(order: string[]): this;

  /**
   * Add a system to the world.
   */
  addSystem(
    cTypes: ClassConstructor<CT>[],
    systemFunc: SystemFunc<CT>,
    options: { phase?: string; name?: string }
  ): this;

  /**
   * Setup an entity to exist in the given world. This is mostly an internal method, but exposed just in case.
   */
  registerEntity(entity: Entity<CT>): World<CT>;

  /**
   * Remove all components from a given entity
   */
  clearEntityComponents(entityId: EntityId): this;

  /**
   * Create an entity that is in the world.
   * Basically just new Entity(world), but saves an import of Entity.
   */
  createEntity(): Entity<CT>;

  /**
   * Destroys an entity
   */
  destroyEntity(entityId: EntityId): this;

  /**
   * Serializes the entire state of the world into a JSON-compatible object.
   */
  toJSON(): SerializedWorld;

  /**
   * Creates a new World instance by hydrating it from a serialized state.
   */
  static fromJSON<CT>(
    serializedWorld: SerializedWorld,
    typeMapping: TypeMapping
  ): World<CT>;
}

export declare class SimpleFSM<S extends State, D = undefined> {
  current: S;
  inital: S;
  transitions: Transitions<S, D>;

  constructor(initialState: S, transitions: Transitions<S, D>);

  next(data: D): void;

  reset(): void;

  is(checkState: S): boolean;
}

export declare class EventManager<CT> {
  constructor(world: World<CT>);

  addListener<E>(
    EventType: ClassConstructor<E>,
    func: EventListenerFunc<E, CT>,
    phase: string
  ): void;

  emit(event: object): void;

  processQueueForPhase(phase: string): void;

  clearQueue(): void;
}

export declare const TrackedCompSymbolKeys: {
  isTracked: symbol;
  world: symbol;
  entityIDs: symbol;
  getEntities: symbol;
  setWorld: symbol;
  onAdd: symbol;
  onUpdate: symbol;
  onRemove: symbol;
};

export declare function trackComponent<CT>(
  CompClass: ClassConstructor<CT>,
  trackedEventHandlers: {
    onAdd?: (args: {
      world: World<CT>;
      component: CT;
      entity: Entity<CT>;
      entities: Map<EntityId, Entity<CT>>;
    }) => void;
    onUpdate?: (args: {
      entities: Map<EntityId, Entity<CT>>;
      component: CT;
      world: World<CT>;
      previousVal: CT[keyof CT];
      property: keyof CT;
    }) => void;
    onRemove?: (args: {
      world: World<CT>;
      component: CT;
      entity: Entity<CT>;
      entities: Map<EntityId, Entity<CT>>;
    }) => void;
  }
): any;