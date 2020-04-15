export type EntityId = string;

export class Entity<CT> {
  id: string;
  world: World<CT>;

  add(component: Component<CT>): this;

  get(cType: CT): Component<CT>;

  getAll(): ComponentCollection<CT>;

  get components(): ComponentCollection<CT>;

  clear(): this;

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

export class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>>;

  private componentTypes: Set<CT>;

  add(component: Component<CT>): void;

  update(cType: CT, func: (c: Component<CT>) => Component<CT>): void;

  get(cType: CT): Component<CT>;

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
  find: (predicate: FindPredicate<CT>) => Entity<CT> | null;

  findAll: (predicate: FindPredicate<CT>) => Entity<CT>[];

  locate: (cTypes: CT | CT[]) => Entity<CT> | null;

  locateAll: (cTypes: CT | CT[]) => Entity<CT>[];

  grab: <C>(cType: CT) => SingleComponentResp<CT, C> | null;

  grabBy: <C>(cType: CT, predicate: GrabPredicate<C>) => SingleComponentResp<CT, C> | null;

  grabAll: <C>(cType: CT) => SingleComponentResp<CT, C>[];

  set: (entityId: EntityId, component: Component<CT>) => void;

  entitiesBy(predicate: (entity: Entity<CT>) => boolean): Entity<CT>
}
