import { CompTypes } from "interfaces";
import { isComponentInstance } from "./guards";

type Class<T> = { new (...args: any[]): T };

export default class ComponentCollection<CT extends CompTypes<CT>> {
  components: Map<keyof CT, InstanceType<CT[keyof CT]>> = new Map();

  // instance of a component
  add = (component: InstanceType<CT[keyof CT]>): void => {
    this.components.set(component.constructor.name, component);
  };

  update = <T>(
    cl: Class<T>,
    func: (c: InstanceType<typeof cl>) => InstanceType<typeof cl>
  ): void => {
    const c = this.components.get(cl.name);

    if (isComponentInstance(cl, c)) {
      const updatedComponent = func(c);
      this.components.set(cl.name, updatedComponent as InstanceType<CT[keyof CT]>);
    }
  };

  remove = (cType: CT[keyof CT]): void => {
    this.components.delete(cType.name);
  };

  get = <T>(cl: Class<T>): InstanceType<typeof cl> => {
    const comp = this.components.get(cl.name);

    if (isComponentInstance<T>(cl, comp)) {
      return comp;
    } else {
      throw new Error(
        `ComponentCollection does not have component of type ${cl.name}`
      );
    }
  };

  // Possible other way to write a get method that maintains the type of the
  // Component throughout. Keeping around for now are a reference.
  // get<U extends CT>(compClass: Class<U>): U {
  //   if (!this.components.has(compClass.name)) {
  //     throw new Error(
  //       `ComponentCollection does not have component of type ${compClass.name}`
  //     );
  //   }

  //   return this.components.get(compClass.name)! as unknown as U;
  // }

  has = (cType: CT[keyof CT] | CT[keyof CT][]): boolean => {
  // has = <T>(cType: Class<T> | Class<T>[]): boolean => {
    return Array.isArray(cType)
      ? cType.every((ct) => this.components.has(ct.name) === true)
      : this.components.has(cType.name);
  };

  hasByName = (cName: string | string[]): boolean => {
    return Array.isArray(cName)
      ? cName.every(ct => this.components.has(ct) === true)
      : this.components.has(cName);
  };

  get componentTypes(): (keyof CT)[] {
    return [...this.components.keys()];
  }

  get size(): number {
    return this.components.size;
  }
}
