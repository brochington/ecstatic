// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
type ClassConstructor = { new (...args: any[]): any };

export class ComponentRegistry {
  private static nextId = 0;
  private static registry = new Map<ClassConstructor, number>();

  static getId(componentClass: ClassConstructor): number {
    if (!this.registry.has(componentClass)) {
      this.registry.set(componentClass, this.nextId++);
    }
    return this.registry.get(componentClass) as number;
  }
}
