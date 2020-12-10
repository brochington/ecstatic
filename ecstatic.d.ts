/* eslint-disable @typescript-eslint/no-explicit-any */

export type Tag = string | number;

export type Class<T> = { new (...args: any[]): T };

export interface CompTypes<CT> {
  [key: string]: Class<CT>;
}

export type Key<C extends CompTypes<C>> = C[keyof C];

export type ClassInstance<C extends CompTypes<C>> = InstanceType<Key<C>>;

export type EntityId = string;

export class Entity<CT extends Class<any>> {
  id: string;
  world: World<CT>;

  constructor(world: World<CT>);

  /**
   * Add a component to an Entity
   */
  add(component: InstanceType<CT>): this;

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): this;

  /**
   * Check to see if the entity has a specific component.
   */
  has(cType: CT): boolean;

  /**
   * Check to see if an entity tagged with a given tag.
   */
  hasTag(tag: Tag): boolean;

  /**
   * Get a component that belongs to an entity.
   */
  get<T>(cl: Class<T>): InstanceType<typeof cl>;

  /**
   * Find and get the first instance of a component, without any associated entities.
   * Helpful is you know that only one instance of a component exists across all entities.
   * @param cl Component Class Contructor
   * @param defaultValue A default component instance if no components are found.
   */
  getComponent<T>(cl: Class<T>): InstanceType<typeof cl> | null;
  getComponent<T>(cl: Class<T>, defaultValue?: InstanceType<typeof cl>): InstanceType<typeof cl>;

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
  remove(cType: CT): this;

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
   * Detroy an entity.
   */
  destroy(): void;
}

export function createEntity<CT extends Class<any>>(
  world: World<CT>
): Entity<CT>;

export class ComponentCollection<CT extends Class<any>> {
  components: Map<string, InstanceType<CT>>;

  add(component: InstanceType<CT>): void;

  update<T>(
    cl: Class<T>,
    func: (c: InstanceType<typeof cl>) => InstanceType<typeof cl>
  ): void;

  /**
   * Remove a component.
   * @param cType Class of component to remove.
   */
  remove(cType: CT): void;

  /**
   * Get a component that matches the passed class.
   * Will throw an error if an instance of the given component
   * doesn't exist in the collection, so if you don't know if it's safe
   * to get a component, you should test with has() or hasByName() first.
   * You have been warned.
   * @param cl component Class reference.
   */
  get<T>(cl: Class<T>): InstanceType<typeof cl>;

  /**
   * Test to see if the collection contains a specific Class or Classes.
   * @param cType component Class, or array of component Classes.
   */
  has(cType: CT | CT[]): boolean;

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
}

export type System = () => void;

export interface SystemFuncArgs<CT extends Class<any>> {
  entity: Entity<CT>;
  components: ComponentCollection<CT>;
  world: World<CT>;
  index: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
}

export type SystemFunc<CT extends Class<any>> = (
  args: SystemFuncArgs<CT>
) => void;

export function createSystem<CT extends Class<any>>(
  world: World<CT>,
  cTypes: CT[],
  func: SystemFunc<CT>
): System;

declare class World<CT extends Class<any>> {
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
  locate: (cl: CT | CT[]) => Entity<CT> | null;

  /**
   * Locates all entities that contain the components named
   */
  locateAll: (cl: CT | CT[]) => Entity<CT>[];

  /**
   * Grabs the first entity, and its related component, that matches the component type.
   * @example
   * ```
   * const { entity, component } = world.grab(MyComponent);
   * ```
   */
  grab: <T>(
    cl: Class<T>
  ) => { entity: Entity<CT>; component: InstanceType<typeof cl> } | null;

  /**
   * Grab single component based on component type and predicate.
   *
   * @example
   * ```typescript
   * const { entity, component } = world.grabBy(FirstComponent, (comp) => comp.id == 'awesome')
   * ```
   */
  grabBy: <T>(
    cl: Class<T>,
    predicate: (comp: InstanceType<typeof cl>) => boolean
  ) => { entity: Entity<CT>; component: InstanceType<typeof cl> } | null;

  /**
   * Grab all the components primarily, and the entities if needed
   */
  grabAll: <T>(
    cl: Class<T>
  ) => { entity: Entity<CT>; component: InstanceType<typeof cl> }[];

  /**
   * Given an entity id and componentType, returns component
   */
  get: <T>(eid: EntityId, cl: Class<T>) => InstanceType<typeof cl>;

  /**
   * Get an entity that has been tagged with the given tag, or return null;
   */
  getTagged(tag: Tag): Entity<CT> | null;

  /**
   * Get all entities that have been given a tag.
   */
  getAllTagged(tag: Tag): Entity<CT>[];

  /**
   * Set a component on the given entity
   */
  set: (eid: EntityId, component: InstanceType<CT>) => this;

  /**
   * Remove a component from the given entity.
   * NOTE: This will change what systems will be called on the entity.
   */
  remove: (eid: EntityId, cType: CT) => this;

  /**
   * an alias for createSystem().
   */
  createSystem(cl: CT[], systemFunc: SystemFunc<CT>): System;

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
