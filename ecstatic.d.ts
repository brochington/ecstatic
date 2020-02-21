export type EntityId = string;

export class Entity<CT> {
  id: string;
  world: World<CT>;

  add(component: Component<CT>): this;

  get(cType: CT): Component<CT>;

  getAll(): ComponentCollection<CT>;

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

  has(cType: CT): boolean;

  size(): number;
}

export type SystemFunc<CT> = (
  args: SystemFuncArgs<CT>
) => void;

export function createSystem<CT>(world: World < CT >, cTypes: CT[], func: SystemFunc<CT>): System

declare class World<CT> {
  set: (entityId: EntityId, component: Component<CT>) => void;

  getEntitiesBy(predicate: (entity: Entity<CT>, cc: ComponentCollection<CT>) => boolean): Map<Entity<CT>, ComponentCollection<CT>>
}
