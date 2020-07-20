export type ComponentStorage = object;

export default class Component<CT, S extends ComponentStorage = {}> {
  type: CT;
  storage: S;

  constructor(storage: S) {
    this.type = ('AbstractComponent' as unknown) as CT;
    this.storage = storage;
  }

  onRemove() {}
}
