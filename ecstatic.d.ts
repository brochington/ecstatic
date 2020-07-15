export type EntityId = string;

export class Entity<CT> {
  id: string;
  world: World<CT>;

  /**
   * Add a component to an Entity
   */
  add(component: Component<CT>): this;

  /**
   * Check to see if the entity has a specific component.
   */
  has(cType: CT): boolean;

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
   * Clears all components from an Entity
   */
  clear(): this;

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

export interface Component<CT> {
  type: CT;
  storage: Map<any, any> | Set<any> | object;
}

// export abstract class Component<CT, S = Record<string, unknown>> {
//   type: CT;
//   private storage: S;

//   constructor(storage: S);
// }

export class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>>;

  private componentTypes: Set<CT>;

  add(component: Component<CT>): void;

  update(cType: CT, func: (c: Component<CT>) => Component<CT>): void;

  get: <C>(cType: CT) => C;

  has(cType: CT | CT[]): boolean;

  get size(): number;
}

export type SystemFunc<CT> = (
  args: SystemFuncArgs<CT>
) => void;

export function createSystem<CT>(world: World < CT >, cTypes: CT[], func: SystemFunc<CT>): System

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
  grabBy: <C>(cType: CT, predicate: GrabPredicate<C>) => SingleComponentResp<CT, C> | null;


  /**
   * Grab all the components primarily, and the entities if needed
   */
  grabAll: <C>(cType: CT) => SingleComponentResp<CT, C>[];

  /**
   * Given an entity id and componentType, returns component
   */
  get: <C>(entityId: EntityId, cType: CT) => C;

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
