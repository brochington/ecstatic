export type EntityId = string;

export type System = () => void;

export interface Component<CT> {
  type: CT;
  storage: Map<any, any> | Set<any> | object;
}

export class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>>;

  private componentTypes: Set<CT>;

  add(component: Component<CT>): void;

  update(cType: CT, func: (c: Component<CT>) => Component<CT>): void;

  get(cType: CT): Component<CT> | undefined;

  has(cType: CT): boolean;
}

export type SystemFunc<CT> = (
  entityId: EntityId,
  cc: ComponentCollection<CT>,
  world: World<CT>,
) => void;

export function createSystem<CT>(world: World < CT >, cTypes: CT[], func: SystemFunc<CT>): System

declare class World<CT> {
  set: (entityId: EntityId, component: Component<CT>) => void;
}