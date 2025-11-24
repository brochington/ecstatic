# Query Optimization in FPS Example

This document explains the Query optimization pattern used in the first-person shooter example.

## What Changed

The FPS example now uses the **Query API** for better performance by caching commonly-used entity queries.

## The Problem

Previously, systems called `world.locateAll()` every frame to find entities:

```javascript
export function collisionSystem({ world }) {
  // This scans ALL entities every single frame
  const bullets = world.locateAll([Projectile, Collider]);
  const enemies = world.locateAll([EnemyAI, Collider]);
  const healthPacks = world.locateAll([HealthPack]);
  // ... more queries ...
}
```

With hundreds of entities, this becomes expensive because:
- Every `locateAll()` call scans **all entities** in the world
- Systems that run 60 times per second repeat the same queries
- Component checks happen over and over for the same entities

## The Solution: Query API

The new Query API creates **persistent, reactive queries**:

```javascript
// Setup (once during initialization)
const queryCache = new QueryCache();
queryCache.projectiles = world.query({ all: [Projectile, Collider] });
queryCache.healthPacks = world.query({ all: [HealthPack] });

// Usage in systems (every frame)
export function collisionSystem({ world }) {
  const queryCache = world.getResource(QueryCache);
  const bullets = queryCache.projectiles.get();  // Fast!
  const healthPacks = queryCache.healthPacks.get(); // Fast!
}
```

### How It Works

1. **Create Query Once**: `world.query({ all: [Component1, Component2] })` creates a Query object
2. **Auto-Update**: World automatically adds/removes entities from the query when components change
3. **Fast Retrieval**: `query.get()` returns only matching entities (no scanning needed)

### Performance Benefits

- **Reactive Updates**: Queries update automatically when entities gain/lose components
- **Bitmask Operations**: Uses efficient bit operations instead of component name checks
- **No Redundant Scanning**: Each query maintains its own entity set
- **O(n) where n = matched entities**, not total entities

## Query Syntax

### Basic Queries

```javascript
// All components required (AND)
world.query({ all: [Position, Velocity] })

// Any component matches (OR)
world.query({ any: [EnemyAI, BossAI, MonsterAI] })

// None of these components (NOT)
world.query({ none: [Dead, Frozen] })

// Exact match (ONLY these components)
world.query({ only: [Position, Velocity] })

// Different from (NOT exactly these)
world.query({ different: [Position, Velocity] })

// At least N components
world.query({ min: 2 })

// At most N components
world.query({ max: 5 })
```

### Complex Queries

```javascript
// Enemies with any AI type, but must have collider
world.query({
  any: [EnemyAI, ScoutAI, TankAI, SniperAI],
  all: [Collider]
})

// Mobile entities that aren't dead
world.query({
  all: [Position, Velocity],
  none: [Dead]
})
```

## Updated Systems

The following systems now use cached queries:

1. **collisionSystem** - Most performance-critical
   - `projectiles`: `{ all: [Projectile, Collider] }`
   - `allEnemies`: `{ any: [EnemyAI, ScoutAI, TankAI, SniperAI], all: [Collider] }`
   - `healthPacks`, `weaponPickups`, `armorPickups`, `collectables`

2. **entityObstacleCollisionSystem**
   - `weaponPickups`, `weaponPickupArrows`
   - `enemiesWithAI`: For collision detection with obstacles

3. **Spawner Systems**
   - `enemySpawnerSystem`: Counts current enemies
   - `healthPackSpawnerSystem`: Counts health packs
   - `weaponPickupSpawnerSystem`: Counts weapon pickups
   - `armorPickupSpawnerSystem`: Counts armor pickups
   - `collectableSpawnerSystem`: Counts collectables

4. **armorRegenerationSystem**
   - `armorRegenPlayers`: `{ all: [Armor, ArmorRegeneration] }`

5. **damageIndicatorSystem**
   - `damageIndicators`: `{ all: [DamageIndicator] }`

## Migration Guide

To migrate your own systems to use queries:

### Before:
```javascript
export function mySystem({ world }) {
  const entities = world.locateAll([Position, Velocity]);
  
  for (const entity of entities) {
    // ... process entity
  }
}
```

### After:

1. **Add query to QueryCache** (in `resources.js`):
```javascript
export class QueryCache {
  constructor() {
    this.movableEntities = null;
  }
}
```

2. **Initialize query** (in `game.js`):
```javascript
const queryCache = new QueryCache();
queryCache.movableEntities = world.query({ all: [Position, Velocity] });
world.setResource(queryCache);
```

3. **Use in system**:
```javascript
export function mySystem({ world }) {
  const queryCache = world.getResource(QueryCache);
  const entities = queryCache.movableEntities.get();
  
  for (const entity of entities) {
    // ... process entity
  }
}
```

## When to Use Queries

✅ **Use Queries When:**
- System runs frequently (every frame or multiple times per frame)
- Query results are reused across multiple systems
- Component set is complex (multiple ANY/NONE conditions)
- You need high performance

❌ **Use `locateAll()` When:**
- One-time or rare queries
- Simple, ad-hoc queries
- Prototyping or debugging

## Performance Impact

In the FPS example with ~100+ entities:

- **Before**: ~15-20 `locateAll()` calls per frame × 100+ entities = 1500-2000 checks
- **After**: Query maintenance only when components change + instant `get()` calls

The Query API scales better as entity count increases, especially for systems that run at high frequency.

## Learn More

See the full Query API documentation in the main Ecstatic docs.

