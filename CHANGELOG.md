# Changelog

## **Version 0.5.0 - November 25, 2025**

This release represents a major performance overhaul of `ecstatic`, introducing a powerful new Query system with intelligent caching and bitset-based component matching. These changes significantly improve entity lookup performance and system execution speed, making `ecstatic` suitable for even larger-scale applications.

### **Added**

- **Query System:**
  - Introduced a new `Query` class that provides intelligent, cached entity filtering with automatic maintenance.
  - `world.query(def: QueryDef)`: Create or retrieve a cached query based on a definition object.
  - **QueryDef Options:**
    - `all`: Entities must have ALL of these components
    - `any`: Entities must have AT LEAST ONE of these components
    - `none`: Entities must NOT have ANY of these components
    - `only`/`same`: Entities must have EXACTLY these components (no more, no less)
    - `different`: Entities must NOT have exactly this combination of components
    - `min`: Entities must have AT LEAST this many components
    - `max`: Entities must have AT MOST this many components
  - Queries are automatically updated as entities gain/lose components, providing O(1) lookups for cached results.
  - Query objects are iterable: `for (const entity of query) { ... }`
  - Query methods: `query.get()` (returns array), `query.first()` (returns first match), `query.size` (count)
  - **Universal vs Targeted Queries:** The system intelligently distinguishes between queries that need to check every component change (universal) vs those that only care about specific components (targeted), minimizing unnecessary checks.

- **BitSet for Component Tracking:**
  - Added `BitSet` class for ultra-fast component mask operations using bit manipulation.
  - Each entity now has a `componentMask` property (a `BitSet`) that represents which components it has.
  - BitSet operations (`contains`, `intersects`, `equals`) enable O(1) component matching.
  - `ComponentRegistry` automatically assigns unique IDs to component classes for bitmask indexing.

- **Entity.hasSome():**
  - `entity.hasSome(cTypes: ClassConstructor<CT>[])`: Check if an entity has at least one of the given component types.

### **Changed**

- **Breaking: System Registration:**
  - `world.addSystem()` now accepts `Query` objects, `QueryDef` objects, or arrays of component constructors (legacy support).
  - Systems internally use the Query system for improved performance.
  - Example: `world.addSystem(world.query({ all: [Position, Velocity] }), systemFunc, { phase: 'Logic' })`
  - Legacy syntax still works: `world.addSystem([Position, Velocity], systemFunc)`

- **Performance: Entity ID Migration:**
  - Entity IDs changed from UUIDs (strings) to sequential numbers for faster lookups and reduced memory overhead.
  - This is a significant performance improvement for entity operations.

- **Internal Architecture Changes:**
  - `world.entities`: Changed from `Map<EntityId, Entity<CT>>` to `Entity<CT>[]` (array-based storage for faster access).
  - `world.componentCollections`: Changed from `Map<EntityId, ComponentCollection<CT>>` to `ComponentCollection<CT>[]`.
  - Removed `world.entitiesByCTypes` in favor of the new Query system.
  - Added `world.queries`: A map of all registered queries, automatically maintained by the world.
  - Systems execution optimized to use query result sets directly.

- **Bundle Configuration:**
  - Temporarily disabled standalone ESM build; UMD bundle now serves as the primary distribution format.

### **Performance Improvements**

This release includes extensive internal refactoring focused on performance:
- Bitset-based component matching is orders of magnitude faster than class name string comparisons.
- Query result caching eliminates redundant entity filtering on every system run.
- Array-based entity storage provides faster iteration and lookup compared to Maps.
- Sequential numeric IDs reduce memory footprint and improve cache locality.
- Targeted query updates mean only affected queries are rechecked when components change.

### **Migration Notes**

- If you were relying on entity IDs being UUIDs, update your code to handle numeric IDs instead.
- Consider migrating systems to use the new Query system for better performance, especially for complex component filtering.
- The old array-based system registration (`world.addSystem([Comp1, Comp2], func)`) still works but is internally converted to a Query.

---

## **Version 0.4.4 - October 7, 2025**

### **Fixed**

- Fixed rspack ESM export naming issue by disabling mangleExports configuration.

---

## **Version 0.4.0 - September 27, 2025**

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

### **Changed**

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
