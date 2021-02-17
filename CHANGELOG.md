# Changelog

## V 0.2

---

### Systems are now added directly to the world with a new `world.addSystem` method.

```typescript
const world = new World();

function mySystem() { }

class MyComponent() {}

/* old busted */
const systemFunc = createSystem(world, [MyComponent], mySystem);

function run() {
  systemFunc();
}

run();

/* new hotness */
world.addSystem([MyComponent], mySystem);

world.systems.run(); // calls all systems.
```


### Added `trackComponent()` function which allows Components to be decorated with a few lifecycle methods (onAdd, onUpdate, onRemove)

```typescript

import { trackComponent } from '@brochington/ecstatic';

class MyComponent {
  something = 'here';
}

const TrackedMyComponent = trackComponent(MyComponent, {
  onAdd({ world, component, entity, entities }) {
    // Triggers when component is added to an entity.
  },

  onUpdate({ world, component, property, previousVal, entities }) {
    // Triggers when a property on the component is updated.
  },

  onRemove({ world, component, entity, entities }) {
    // Triggers when component is removed from an entity.
  }
});

const trackedComp = new TrackedMyComponent();

const entity = world.createEntity().add(trackedComp);

// trackedComp.onAdd() is called.

entity.get(MyComponent /* or TrackedMyComponent */).something = 'there';

// trackedComp.onUpdate() is called.

entity.remove(MyComponent);

// trackedComp.onRemove() is called.
```


### Lifecycle methods may now be added to an entity by extending the Entity class.

```typescript
class EntityWithLifecycle extends Entity<CompTypes> {
  onCreate(): void {}

  onTrackedComponentUpdate(): void {}

  onDestroy(): void {}
}

// Note that you must pass in the world, instead of just using world.createEntity().
const firstLCComp = new EntityWithLifecycle(world);
```


### deferred completion of entity creation and destruction until after the next pass of the systems.

  - entities now have a state that can be check via `entity.state`.
    - possible states:
        - `creating`
        - `created`
        - `destroying`
        - `destroyed`
        - `error`
    - `creating` and `destroying` are particularly useful in systems:

    ```typescript
    function mySystem({ entity }) {
      if (entity.state === 'creating') {
        // do initialization logic here.
      }

      if (entity.state === 'destroying') {
        // do any cleanup that is needed. Remove event handlers, unmount elements, etc.
      }
    }
    ```

  - If needed, entities can be destroyed by calling `entity.destroyImmediately()`. `entity.state` will immediately be set to `destroyed`.

  - this will be bypassed if no systems are added.


### `createEntity(world)` is removed. Use `world.createEntity` or `new Entity(world)` to create an entity.

```typescript
/* old busted */
const entity = createEntity(world);

/* new hotness */
const entity = world.createEntity();
// OR
const entity = new Entity(world);
```


### Typescript: Component type unions that are passed into World are no longer  "typeof Component" unions, and just "Union".

```typescript
/* old busted */
const compTypes = typeof Component1 | typeof Component2;

/* new hotness */
const compTypes = Component1 | Component2;
```

this makes internal types much easier