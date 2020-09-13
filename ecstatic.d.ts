export type Tag = string | number;

export type EntityId = string;

export class Entity<CT> {
  id: string;
  world: World<CT>;

  /**
   * Add a component to an Entity
   */
  add(component: Component<CT>): this;

  /**
   * Add a tag to a component
   */
  addTag(tag: Tag): Entity<CT>;

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
  get<C>(cType: CT): C;

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
   * Remove a component from an entity.
   */
  remove(cType: CT): Entity<CT>;

  /**
   * Remove a tag from an entity
   */
  removeTag(tag: Tag): Entity<CT>;

  /**
   * Clears all components from an Entity
   */
  clear(): Entity<CT>;

  /**
   * Remove all tags on an entity
   */
  clearTags(): Entity<CT>;

  /**
   * Detroy an entity.
   */
  destroy(): void;
}

export function createEntity<CT>(world: World<CT>): Entity<CT>;

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

export class Component<CT, S extends object = object> {
  type: CT;
  storage: S;
}

export default class LifeCycleComponent<CT, S extends object = object> {
  type: CT;
  storage: S;

  constructor(storage: S);

  // Lifecycle methods
  storageShouldUpdate(prop: keyof S, value: any): boolean;

  storageWillBeAccessed(prop: keyof S): void;

  onStorageAccess(prop: keyof S): S[keyof S];

  storageWasAccessed(prop: keyof S): void;

  storageWillUpdate(prop: keyof S, nextValue: any): void;

  storageDidUpdate(prop: keyof S, prevValue: any): void;

  onRemove(): void;
}

export class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>>;

  private componentTypes: Set<CT>;

  add(component: Component<CT>): void;

  update(cType: CT, func: (c: Component<CT>) => Component<CT>): void;

  get: <C>(cType: CT) => C;

  has(cType: CT | CT[]): boolean;

  get size(): number;
}

export type SystemFunc<CT> = (args: SystemFuncArgs<CT>) => void;

export function createSystem<CT>(
  world: World<CT>,
  cTypes: CT[],
  func: SystemFunc<CT>
): System;

export type FindPredicate<CT> = (entity: Entity<CT>) => boolean;

export type GrabPredicate<C> = (component: C) => boolean;

export type FilterPredicate<CT> = (entity: Entity<CT>) => boolean;

export interface SingleComponentResp<CT, C> {
  entity: Entity<CT>;
  component: C;
}

declare class World<CT> {
  /**
   * "finds" a single entity based on a predicate
   */
  find: (predicate: FindPredicate<CT>) => Entity<CT> | null;

  /**
   * "finds" all entities based on a predicate, kinda like filter.
   */
  findAll: (predicate: FindPredicate<CT>) => Entity<CT>[];

  /**
   * "locates" a single entity based on its Components.
   */
  locate: (cTypes: CT | CT[]) => Entity<CT> | null;

  /**
   * Locates all entities that contain the components named
   */
  locateAll: (cTypes: CT | CT[]) => Entity<CT>[];

  /**
   * Grabs the first entity, and its related component, that matches the component type.
   * @example
   * ```
   * const { entity, component } = world.grab<MyComponent>(Components.MyComponent);
   * ```
   */
  grab: <C>(cType: CT) => SingleComponentResp<CT, C> | null;

  /**
   * Grab single component based on component type and predicate.
   *
   * @example
   * ```typescript
   * const { entity, component } = world.grabBy<FirstComponent>(Components.FirstComponent, (comp) => comp.id == 'awesome')
   * ```
   */
  grabBy: <C>(
    cType: CT,
    predicate: GrabPredicate<C>
  ) => SingleComponentResp<CT, C> | null;

  /**
   * Grab all the components primarily, and the entities if needed
   */
  grabAll: <C>(cType: CT) => SingleComponentResp<CT, C>[];

  /**
   * Given an entity id and componentType, returns component
   */
  get: <C>(entityId: EntityId, cType: CT) => C;

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
  set: (entityId: EntityId, component: Component<CT>) => void;

  /**
   * Remove a component from the given entity.
   * NOTE: This will change what systems will be called on the entity.
   */
  remove: (entityId: EntityId, cType: CT) => void;

  /**
   * Remove all components from a given entity
   */
  clearEntityComponents(entityId: EntityId): void;

  /**
   * Destroys an entity
   */
  destroyEntity(entityId: EntityId): void;
}
