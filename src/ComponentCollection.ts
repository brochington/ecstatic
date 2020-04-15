import { Component } from './Component';

export default class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>> = new Map();

  add = (component: Component<CT>): void => {
    this.components.set(component.type, component);
  }

  update = (cType: CT, func: (c: Component<CT>) => Component<CT>): void => {
    if (this.components.has(cType)) {
      const c = this.components.get(cType);

      if (c) {
        const updatedComponent = func(c);
        this.components.set(cType, updatedComponent);
      }
    }
  };

  get = <C>(cType: CT): C => {
    if (!this.components.has(cType)) {
      throw new Error(`ComponentCollection does not have component of type ${cType}`)
    }
    
    return this.components.get(cType) as unknown as C;
  }

  has = (cType: CT | CT[]): boolean => {
    if (Array.isArray(cType)) {
      return cType.every((ct) => this.components.has(ct) === true);
    } else {
      return this.components.has(cType)
    }
  }

  get size(): number {
    return this.components.size;
  }
}
