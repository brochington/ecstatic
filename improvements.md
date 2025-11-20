### 1. Architectural & Performance Improvements

These changes require refactoring `World.ts` and `ComponentCollection.ts` but will yield the highest performance gains.

#### A. Move from String Keys to Bitmasks
**Current:** You identify component combinations by sorting class names and joining them into a string (e.g., `"Position,Velocity"`). This generates garbage collection (GC) pressure and is slow to compare.
**Proposed:**
1.  Assign a unique auto-incrementing integer ID (Index) to every Component Class upon registration.
2.  Use a **Bitmask** (or a `BitSet` class if you exceed 32/50 components) to represent an Entity's composition.
3.  System matching becomes a bitwise operation `(entityMask & systemMask) === systemMask`, which is orders of magnitude faster than string comparison.

#### B. Optimize Component Storage (Data Locality)
**Current:** `ComponentCollection` uses a `Map<string, Component>`. When iterating a system, the CPU jumps to random memory locations to find component instances.
**Proposed:**
Move towards **Archetypes** (or at least contiguous arrays).
1.  Instead of `Map<EntityId, ComponentCollection>`, group entities that have the *exact same* set of components into an **Archetype**.
2.  An Archetype contains parallel arrays of components (e.g., `Position[]`, `Velocity[]`).
3.  Iterating a system becomes iterating a few arrays sequentially, which creates **Cache Hits**, drastically improving performance for large numbers of entities.

#### C. Replace UUID with Integer IDs
**Current:** You use the `uuid` library. String UUIDs are heavy to generate and slow to use as Map keys.
**Proposed:**
1.  Use a simple incrementing integer (`nextId++`) for Entity IDs.
2.  Use a "Generation" index to handle ID recycling (so you don't reference destroyed entities).
    *   *Structure:* `EntityID = (Generation << 20) | Index`.
3.  This allows you to use Arrays instead of Maps for looking up entity data, which is faster.

---

### 2. Feature Additions

#### A. Delta Time (dt) in Systems
**Current:** Systems receive `index`, `size`, etc., but no time data. Users have to calculate movement using fixed numbers (e.g., `pos.x += 0.1`), which ties game speed to framerate.
**Proposed:**
Pass `time` and `delta` (time since last frame) to `SystemFuncArgs`.
```typescript
export interface SystemFuncArgs<CT> {
  dt: number; // Time in seconds since last frame
  time: number; // Total time
  // ... existing args
}

// Usage:
pos.x += vel.x * args.dt;
```

#### B. Persistent Queries
**Current:** `world.locate` and `world.findAll` iterate over *all* entities every time they are called.
**Proposed:**
Allow creating a "Query" that stays updated automatically.
```typescript
// In initialization
const enemies = world.createQuery([Enemy, Position]);

// In loop (O(1) access, no iteration to find them)
enemies.getEntities().forEach(e => ...);
```

#### C. Entity Relationships (Hierarchy)
**Current:** No built-in way to parent an entity to another (e.g., a Gun entity attached to a Player entity).
**Proposed:**
Add a standard way to link entities. When a Parent is destroyed, you usually want Children to be destroyed or detached.
*   Implement a standard `Parent` component and `Children` component.
*   Add a system that ensures if `Parent` moves, `Children` move (if you implement a Transform system).

---

### 3. Developer Experience (DX) & API

#### A. Remove `class-transformer` Dependency
**Current:** You rely on `class-transformer` for `instanceToPlain`.
**Proposed:**
This is a heavy dependency for a library. Since you already support a custom `.toJSON()` method on components, strictly rely on that or standard `JSON.stringify`. If a user needs complex serialization, let them handle it in their own `toJSON` implementation. This reduces your bundle size significantly.

#### B. Functional Components (Data-only)
**Current:** Components must be Classes.
**Proposed:**
In strict ECS, components are data, not methods. While classes are fine, supporting factory functions or simple objects can be cleaner.
```typescript
// Allow this
world.registerComponent('Position', { x: 0, y: 0 });
entity.add('Position', { x: 10, y: 20 });
```

#### C. System Groups / Pipeline Control
**Current:** You have `setPhaseOrder`.
**Proposed:**
Expand this to allow disabling specific systems or groups of systems at runtime (e.g., pausing the "Logic" phase while keeping the "Render" phase running).
```typescript
world.systems.pausePhase('Logic');
```

---

### 4. Code Specific Refactors

#### Fix `Systems.ts` ambiguity check
In `Systems.run()`, you iterate `this.world.entities.values()` to find creating/destroying entities.
**Improvement:** Keep a separate `Set<Entity>` for `entitiesToCreate` and `entitiesToDestroy`. Don't iterate the entire world population every frame just to find the 1 or 2 entities changing state.

#### Fix `World.ts` Generic Type `CT`
**Current:** The `World<CT>` generic is passed everywhere.
**Improvement:** It creates friction. If `CT` represents *all* components, updating the union type every time you add a component is tedious.
Consider making methods generic (`add<T>`) and defaulting the World to `any` or `unknown` internally, utilizing TypeScript's inference at the call site (`entity.get(Position)` knows it returns `Position`).

### Implementation Roadmap Recommendation

1.  **v0.5.0:** Add **Delta Time** (`dt`) to systems and replace `uuid` with **Integer IDs** (generation index). Drop `class-transformer`.
2.  **v0.6.0:** Implement **Bitmasks** for system matching. This removes the string manipulation bottlenecks.
3.  **v0.7.0:** Implement **Persistent Queries** to replace `findAll`.
4.  **v1.0.0:** Move to **Archetype** storage (this is the hardest change, essentially a rewrite of `World` storage).

### Example: Implementing Integer IDs & Bitmasks

Here is a sketch of how to move away from strings to IDs/Bitmasks:

```typescript
// ComponentRegistry.ts
export class ComponentRegistry {
  private static _nextId = 0;
  private static _map = new Map<Function, number>();

  static getId(componentClass: Function): number {
    if (!this._map.has(componentClass)) {
      this._map.set(componentClass, 1 << this._nextId++); // Bitflag
    }
    return this._map.get(componentClass)!;
  }
}

// Entity.ts
export class Entity {
  mask: number = 0; // Bitmask of current components

  add(component: any) {
    const compId = ComponentRegistry.getId(component.constructor);
    this.mask |= compId;
    // ... store component
  }
}

// Systems.ts
// When matching:
if ((entity.mask & system.mask) === system.mask) {
   // It matches!
}
```