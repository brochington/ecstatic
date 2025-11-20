import World, { ClassConstructor } from './World';
import ComponentCollection from './ComponentCollection';
import { Tag } from './Tag';
import DevEntity from './DevEntity';
import SimpleFSM from './SimpleFSM';
import { BitSet } from './BitSet';

export type EntityId = number;

export type EntityState =
  | 'creating'
  | 'created'
  | 'destroying'
  | 'destroyed'
  | 'error';

export interface EntityCompEventArgs<CT> {
  world: World<CT>;
  component: CT;
}

export interface ComponentLifecycleEventArgs<CT> {
  world: World<CT>;
  entity: Entity<CT>;
  component: CT;
}

export default class Entity<CT> {
  private _id: EntityId;
  private _world: World<CT>;
  private _componentMask: BitSet;
  private _error: Error | null;
  private _state: SimpleFSM<EntityState, EntityState>;

  get id(): EntityId {
    return this._id;
  }

  get world(): World<CT> {
    return this._world;
  }

  get componentMask(): BitSet {
    return this._componentMask;
  }

  get state(): EntityState {
    return this._state.current;
  }

  constructor(world: World<CT>, id: EntityId) {
    this._id = id;
    this._world = world;
    this._componentMask = new BitSet();

    this._error = null;

    const fsmTransition = (ns: EntityState): EntityState => {
      if (ns === 'error' || this._error) return 'error';
      return ns;
    };

    this._state = new SimpleFSM<EntityState, EntityState>('creating', {
      creating: fsmTransition,
      created: fsmTransition,
      destroying: fsmTransition,
      destroyed: () => 'destroyed',
      error: () => 'error',
    });

    this._world.registerEntity(this);

    if (this._world.systems.compNamesBySystemName.size === 0) {
      this._state.next('created');
    }
  }

  // ... lifecycle methods ...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onCreate(world: World<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onDestroy(world: World<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onComponentAdd(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onTrackedComponentUpdate(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onComponentRemove(args: EntityCompEventArgs<CT>): void {
    // abstract
  }

  add<T extends CT>(component: T): this {
    if (!component) {
      throw new Error(`Entity.add: Component is null or undefined`);
    }
    this._world.add(this._id, component);
    return this;
  }

  addTag(tag: Tag): this {
    const entitySet = this._world.entitiesByTags.has(tag)
      ? this._world.entitiesByTags.get(tag)
      : new Set<EntityId>();

    if (entitySet) {
      entitySet.add(this._id);
      this._world.entitiesByTags.set(tag, entitySet);
    }

    return this;
  }

  has<T extends CT>(cType: ClassConstructor<T>): boolean {
    const cc =
      this._world.componentCollections[this._id] ||
      new ComponentCollection<CT>();

    return cc.has(cType);
  }

  hasSome<T extends CT>(cTypes: ClassConstructor<T>[]): boolean {
    const cc =
      this._world.componentCollections[this._id] ||
      new ComponentCollection<CT>();

    return cc.has(cTypes);
  }

  hasTag(tag: Tag): boolean {
    if (this._world.entitiesByTags.has(tag)) {
      const entitySet = this._world.entitiesByTags.get(tag);
      if (entitySet) {
        return entitySet.has(this._id);
      }
    }
    return false;
  }

  get<T extends CT>(cl: ClassConstructor<T>): T {
    const cc =
      this._world.componentCollections[this._id] ||
      new ComponentCollection<CT>();

    return cc.get<T>(cl);
  }

  getAll(): ComponentCollection<CT> {
    return (
      this._world.componentCollections[this._id] ||
      new ComponentCollection<CT>()
    );
  }

  remove(cType: ClassConstructor<CT>): this {
    this._world.remove(this._id, cType);
    return this;
  }

  removeTag(tag: Tag): this {
    if (this._world.entitiesByTags.has(tag)) {
      const entitySet = this._world.entitiesByTags.get(tag);
      if (entitySet) {
        entitySet.delete(this._id);
        if (entitySet.size === 0) {
          this._world.entitiesByTags.delete(tag);
        }
      }
    }
    return this;
  }

  clear(): this {
    this._world.clearEntityComponents(this._id);
    this._componentMask = new BitSet();
    return this;
  }

  clearTags(): this {
    for (const [tag, entitySet] of this._world.entitiesByTags.entries()) {
      entitySet.delete(this._id);
      if (entitySet.size === 0) {
        this._world.entitiesByTags.delete(tag);
      }
    }
    return this;
  }

  finishCreation(): void {
    this._state.next('created');
  }

  destroy(): void {
    if (this._world.systems.compNamesBySystemName.size === 0) {
      this.destroyImmediately();
      return;
    }
    this._state.next('destroying');
    this._world.entitiesToDestroy.add(this);
  }

  destroyImmediately(): void {
    this.onDestroy(this._world);
    this._world.destroyEntity(this._id);
    this._state.next('destroyed');
  }

  get components(): ComponentCollection<CT> {
    return (
      this._world.componentCollections[this._id] ||
      new ComponentCollection<CT>()
    );
  }

  get tags(): Set<Tag> {
    const tags = new Set<Tag>();
    for (const [tag, entitySet] of this._world.entitiesByTags.entries()) {
      if (entitySet.has(this._id)) {
        tags.add(tag);
      }
    }
    return tags;
  }

  toDevEntity(): DevEntity<CT> {
    return new DevEntity<CT>(this, this._world);
  }
}
