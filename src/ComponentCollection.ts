import { Component } from './Component';

export default class ComponentCollection<CT> {
  private components: Map<CT, Component<CT>> = new Map();

  private componentTypes: Set<CT> = new Set();

  add = (component: Component<CT>): void => {
    this.components.set(component.type, component);
    this.componentTypes.add(component.type);
  }

  update = (cType: CT, func: (c: Component<CT>) => Component<CT>): void => {
    if (this.componentTypes.has(cType)) {
      const c = this.components.get(cType);

      if (c) {
        const updatedComponent = func(c);
        this.components.set(cType, updatedComponent);
      }
    }
  };

  get = (cType: CT): Component<CT> | undefined => {
    return this.components.get(cType);
  }

  has = (cType: CT): boolean => {
    return this.components.has(cType)
  }
}