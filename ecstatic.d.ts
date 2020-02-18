export type EntityId = string;

export class Entity<CT> {
  id: string;
  world: World<CT>;

  add(component: Component<CT>): this;

  clear(): this;

  destroy(): void;
}

export function createEntity<CT>(world: World<CT>): Entity<CT>;

export type System = () => void;

export interface SystemFuncArgs<CT> {
  entity: Entity<CT>;
  components: ComponentCollection<CT>;
  world: World<CT>;
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
}

export type SystemFunc<CT> = (
  args: SystemFuncArgs<CT>
) => void;

export function createSystem<CT>(world: World < CT >, cTypes: CT[], func: SystemFunc<CT>): System

declare class World<CT> {
  set: (entityId: EntityId, component: Component<CT>) => void;
}
