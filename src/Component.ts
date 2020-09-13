export type ComponentStorage = object;

export default class Component<CT, S extends ComponentStorage = {}> {
  type: CT;
  storage: S;

  constructor(storage: S) {
    this.type = ('AbstractComponent' as unknown) as CT;
    this.storage = storage;

    // Add getters/setters? 
  }

  // TODO: Will add onRemove later as not to screw up components that
  //       "implement" Component instead of "extend"ing it.
  onRemove(): void {}
}
