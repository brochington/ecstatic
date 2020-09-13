export default class LifeCycleComponent<CT, S extends object = object> {
  type: CT;
  storage: S;

  constructor(storage: S) {
    this.type = ("AbstractComponent" as unknown) as CT;

    // Should the proxy be a "revocable" type?
    this.storage = new Proxy(storage, {
      get: this.handleStoragePropAccess,
      set: this.handleStoragePropChange,
    });
  }

  handleStoragePropAccess = (
    _target: S,
    prop: keyof S,
    _receiver: any
  ): S[keyof S] => {
    this.storageWillBeAccessed(prop);

    const val = this.onStorageAccess(prop);

    this.storageWasAccessed(prop);

    return val;
  };

  handleStoragePropChange = (
    target: S,
    prop: keyof S,
    value: any,
    _receiver: any
  ): boolean => {
    if (this.storageShouldUpdate(prop, value)) {
      this.storageWillUpdate(prop, value);
      const prevValue = target[prop];
      target[prop] = value;
      this.storageDidUpdate(prop, prevValue);
    }

    return true;
  };

  // Lifecycle methods
  storageShouldUpdate(_prop: keyof S, _value: any): boolean {
    return true;
  }

  storageWillBeAccessed(_prop: keyof S): void {
    // left empty.
  }

  onStorageAccess(prop: keyof S): S[keyof S] {
    return this.storage[prop];
  }

  storageWasAccessed(_prop: keyof S): void {
    // left empty.
  }

  storageWillUpdate(_prop: keyof S, _nextValue: any): void {
    // left empty.
  }

  storageDidUpdate(_prop: keyof S, _prevValue: any): void {
    // left empty.
  }

  onRemove(): void {
    // do stuff when removed....
  }
}
