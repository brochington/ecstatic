import { isComponentInstance } from "./guards";

type CompName = string;
type ClassConstructor<T> = { new (...args: any[]): T };

// CT is a Union, like `type = FirstComponent | SecondComponent`.
export default class ComponentCollection<CT> {
  components: Map<CompName, CT> = new Map();

  // instance of a component
  // add = (component: InstanceType<CT[keyof CT]>): void => {
  add = (component: CT): void => {
    this.components.set((<any>component).constructor.name, component);
  };

  update = <T extends CT>(
    cl: ClassConstructor<T>,
    func: (c: T) => T
  ): void => {
    const c = this.components.get(cl.name);

    if (isComponentInstance(cl, c)) {
      const updatedComponent = func(c);
      this.components.set(cl.name, updatedComponent);
    }
  };

  /**
   * Remove a component.
   * @param cType Class of component to remove.
   */
  remove = (cType: ClassConstructor<CT>): void => {
    this.components.delete(cType.name);
  };

  /**
   * Get a component that matches the passed class.
   * Will throw an error if an instance of the given component
   * doesn't exist in the collection, so if you don't know if it's safe
   * to get a component, you should test with has() or hasByName() first.
   * You have been warned.
   * @param cl component Class reference.
   */
  get = <T extends CT>(cl: ClassConstructor<T>): T => {
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

  /**
   * Test to see if the collection contains a specific Class or Classes.
   * @param cType component Class, or array of component Classes.
   */
  has = (cType: ClassConstructor<CT> | ClassConstructor<CT>[]): boolean => {
    return Array.isArray(cType)
      ? cType.every((ct) => this.components.has(ct.name) === true)
      : this.components.has(cType.name);
  };

  /**
   * Test to see if the collection has a component instance based on a
   * class name. Some build steps/minifiers will change the name of Classes,
   * so it's usually best to pass in a MyClass.name instead of 'MyClass'.
   * @param cName The name of a Class, or array of Class names.
   */
  hasByName = (cName: string | string[]): boolean => {
    return Array.isArray(cName)
      ? cName.every(ct => this.components.has(ct) === true)
      : this.components.has(cName);
  };

  /**
   * Get the component type names that are currently being used in the collection.
   */
  get componentTypes(): string[] {
    return [...this.components.keys()];
  }

  /**
   * Get the current number of components that are in the collection.
   */
  get size(): number {
    return this.components.size;
  }

  toDevComponents(): Record<string, CT> {
    const obj: Record<string, CT> = {};
    for (const [compName, comp] of this.components) {
      obj[compName] = comp;
    }

    return obj;
  }
}
