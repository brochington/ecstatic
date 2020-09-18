export default class Component<CT, S extends object = {}> {
  type: CT;
  storage: S;

  constructor(storage: S) {
    this.type = ("AbstractComponent" as unknown) as CT;
    this.storage = storage;

    for (const [key, val] of Object.entries(storage)) {
      Object.defineProperty(this, key, {
        get: (): typeof val => {
          return this.storage[key];
        },
        set: (nextVal: typeof val): void => {
          this.storage[key] = nextVal;
        },
      });
    }

    // Add getters/setters?
  }

  // getProperty():

  // TODO: Will add onRemove later as not to screw up components that
  //       "implement" Component instead of "extend"ing it.
  onRemove(): void {
    // empty
  }
}
