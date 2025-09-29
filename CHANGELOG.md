# Changelog

**Version 0.4.0 - Sept 27, 2025**

This release introduces significant enhancements to `ecstatic`, focusing on core engine flexibility, improved developer experience, and essential tooling for state management. These updates lay the groundwork for more complex game logic, easier entity creation, and the ability to save and load game states.

## **Added**

- **System Execution Phases:**
  - Introduced named execution phases (`Input`, `Logic`, `Events`, `Render`, `Cleanup`) to control the order in which systems run. This allows for declarative, predictable frame execution.
  - `world.setPhaseOrder(order: string[])`: A new method to customize the global execution order of phases.
  - Systems can now be registered with an optional `phase` property: `world.addSystem(components, systemFunc, { phase: 'Logic', name: 'MySystem' })`.
  - **Phase Validation:** The system now intelligently detects and throws an error if there's a mix of phased and non-phased systems, preventing ambiguous execution orders.
- **World Event System:**
  - `world.events`: A new `EventManager` instance accessible on the world, providing a first-class event bus.
  - `world.events.emit(event: object)`: Queues an event instance to be processed.
  - `world.addSystemListener(EventType, listenerFunc, { phase: 'Events' })`: Registers a function to listen for specific event types. Event listeners are executed within their declared phase (defaulting to `'Events'`).
  - Events enable decoupled communication between systems, making it easier to react to game events (e.g., collisions, state changes) without tight coupling.
- **Singleton Components as "Resources":**
  - `world.setResource(resource: T)`: Stores a unique instance of a class as a global resource.
  - `world.getResource<T>(ResourceType: ClassConstructor<T>)`: Retrieves a stored resource.
  - `world.hasResource<T>(ResourceType: ClassConstructor<T>)`: Checks for the existence of a resource.
  - `world.removeResource<T>(ResourceType: ClassConstructor<T>)`: Removes a resource.
  - This provides a clearer and more direct API for managing global game state, input, or other singleton data.
- **Entity Prefabs / Blueprints:**
  - `world.registerPrefab(name: string, definition: PrefabDefinition<CT>)`: Allows you to define reusable entity templates with pre-configured components and tags.
  - `world.createEntityFromPrefab(name: string, overrides?: { [componentName: string]: Partial<CT> })`: Instantiates a new entity based on a registered prefab, with optional property overrides for unique instances.
  - Simplifies entity creation, promotes reuse, and supports data-driven entity definitions.
- **Component Lifecycle Hooks:**
  - Components can now define optional `onAdd` and `onRemove` methods.
  - `onAdd({ world, entity, component })`: Automatically called when a component instance is added to an entity.
  - `onRemove({ world, entity, component })`: Automatically called just before a component instance is removed from an entity.
  - Enables clean resource management and setup/teardown logic directly within components, without forcing inheritance.
- **World State Serialization & Hydration:**
  - `world.toJSON()`: Serializes the entire world state (entities, components, resources) into a JSON-compatible object. It supports custom `.toJSON()` methods on components/resources for fine-grained control and falls back to `class-transformer` for plain data.
  - `World.fromJSON(serializedWorld, typeMapping)`: A static method to reconstruct a `World` instance from a serialized state. Requires a `typeMapping` to correctly re-instantiate classes.
  - This is fundamental for features like save/load games, hot-reloading, and state synchronization.

#### **Changed**

- **`world.addSystem()` Signature:** The `world.addSystem()` method now accepts an `options` object (`{ phase?: string; name?: string }`) instead of a simple `funcName` string, providing more control over system registration.
- **`Systems.run()` Behavior:** Modified to execute systems based on defined phases and to process events within those phases. It also correctly allows systems to run on entities in the `'destroying'` state for cleanup.

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
  },
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

### Typescript: Component type unions that are passed into World are no longer "typeof Component" unions, and just "Union".

```typescript
/* old busted */
const compTypes = typeof Component1 | typeof Component2;

/* new hotness */
const compTypes = Component1 | Component2;
```

this makes internal types much easier
