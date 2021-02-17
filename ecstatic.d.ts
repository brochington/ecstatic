/* eslint-disable @typescript-eslint/no-explicit-any */

export type Tag = string | number;

export type ClassConstructor<T> = { new (...args: any[]): T };

export type EntityId = string;


export type EntityState =
  | "creating"
  | "created"
  | "destroying"
  | "destroyed"
  | "error";

export class Entity<CT> {
  get id(): string;
  get world(): World<CT>;

  constructor(world: World<CT>);

  /**
   * Add a component to an Entity
   */
  add(component: CT): this;

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): this;

  /**
   * Check to see if the entity has a specific component.
   */
  has(cType: ClassConstructor<CT>): boolean;

  /**
   * Check to see if an entity tagged with a given tag.
   */
  hasTag(tag: Tag): boolean;

  /**
   * Get a component that belongs to an entity.
   */
  get<T>(cl: ClassConstructor<T>): T;

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
  id: string;
  components: string;
  tags: string;
  systems: string;
}

export class DevEntity<CT> {
  id: string;

  components: Record<string, CT>;

  tags: Tag[];

  systems: string[];

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
}

export type SystemFunc<CT> = (
  args: SystemFuncArgs<CT>
) => void;

declare class Systems<CT> {
  world: World<CT>;

  systemFuncBySystemName: Map<string, SystemFunc<CT>>;

  compNamesBySystemName: Map<string, string[]>;

  constructor(world: World<CT>);

  add(cTypes: ClassConstructor<CT>[], systemFunc: SystemFunc<CT>, funcName?: string): this;

  run(): void;
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
   * Add a system to the world.
   */
  addSystem(cTypes: ClassConstructor<CT>[], systemFunc: SystemFunc<CT>, funcName?: string): this;

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
}
