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

  get = (cType: CT): Component<CT> => {
    if (!this.components.has(cType)) {
      throw new Error(`ComponentCollection does not have component of type ${cType}`)
    }
    
    return this.components.get(cType);
  }

  has = (cType: CT): boolean => {
    return this.components.has(cType)
  }

  size = (): number => {
    return this.components.size;
  }
}
