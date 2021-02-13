# Changelog

## V2

- Added `trackComponent()` function which allows Components to be decorated with a few lifecycle methods (onAdd, onUpdate, onRemove)
- Component type unions that are passed into World are no longer  "typeof Component" unions, and just "Union".

```typescript
// old busted
const compTypes = typeof Component1 | typeof Component2;

// new hotness
const compTypes = Component1 | Component2;
```

this makes internal types much easier

- Systems are now added directly to the world. 

- Entities may now have basic lifecycle events

```typescript
class EntityWithLifecycle extends Entity<CompTypes> {
  onCreate(): void {}

  onDestroy(): void {}
}

// Note that you pass in the world, instead of just using world.createEntity().
const firstLCComp = new EntityWithLifecycle(world);
```

- `createEntity(world)` is removed. Use `world.createEntity` or `new Entity(world)` to create an entity.

- deferred completion of entity creation and destruction until after the next pass of the systems.
  - this will be bypassed if no systems are added.
  - If needed, entities can be destroyed by calling `entity.destroyImmediately()`.

- Entity Lifecycle methods
  - `class LCEntity extends Entity<CompTypes> { onCreate() {} onDestory() {} }`
  - entity.onCreate()
  - entity.onDestory()
  - lifecycle methods related to components on entities coming soon.

### Coming Soon
- Update ecstatic.d.ts!!!