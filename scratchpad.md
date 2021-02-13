
## Something to help with types I think if I try to redo some typing strategy.
const deser: <K extends keyof typeof deserializers>(key: K): (typeof deserializers)[K] => deserializers[key]

# Things I would like to look into/do
- Better Component class
  - maybe a `createComponent()` function?
  - 

- Making "Lifecycle Systems". Something like: 

```typescript
export const systemComps = [Component1, Component2];

export function system(args) {
  const { entity } = args;

  if (entity.checkState('creating')) {
    // do something cool
  }

  if (entity.checkState('created')) {
    
  }

  if (entity.checkState('destroying')) {
    // This entity is being run on this system for the last time.
  }

} 
```


- Define Entity classes, ie:

```typescript
// One of the hardest things currently is knowing when things have updated, or state has changed.
class MyEntity extends Entity<Components> {
  constructor() { } // when instance is created
  onCreate() { /* ... */ } // when attached to the world
  onPreDestroy() { /* ... */ } // when the entity or world is destroyed
  onPostDestroy() { /* ... */ } // when the entity or world is destroyed

  onComponentAdd({ componentName, component, world }) { /* ... */ }
  onComponentUpdate({ componentName, prevComponent, nextComponent }) { /* ... */ }
  onComponentRemove() { /* ... */ }


  /// optional....
  beforeSystemRun() { /* ... */ }
  afterSystemRun() {  /* ... */ }
}

const TrackedEntity = trackEntity(MyEntity /*, { events... } */);

// Might be nice to do something like:

world.createEntity(TrackedEntity, { /* additional event handlers */ })


```

```typescript
// It's really nice that components can be ANY class, and aren't required to 
// be a subclass of something.
class MyComponent {
  whatever = 'here';
}

const TrackedComponent = trackComponent(MyComponent, { /* eventhandlers */})

const trackComp = new TrackedComponent();


```


```typescript

const world = new World<Components>();

class BoxEntity extends Entity<Components> {
  onCreate() {}
 // and such...
}


const boxPosition = new Position3D(1, 1, 1);

const boxEntity = new BoxEntity();

world.createEntity(boxEntity)
  .add(boxPosition); // trigger entity.onComponentAdd(), and component.onAdd()

boxEntity.destroy(); // call entity.onDestroy() and 
```


What are the problems folks are having:
- Hard to follow the cycle of ECS
- Don't know where to update code.
- Not clear what is ever on an entity
- Maybe too loose?


Note: Can use a State Machine for Enity and Component states, like: 
Created, Adding, Added, Updating, Updated, Destroyed, etc...

### TODO
- Moving systems to internal
  -  world.systems.run()
  - world.systems.register()
- Components
  - types of Components classes: 
    - `Component`
    - `LifeCycleComponent`
    - `TrackedComponent` // might be the same as LifeCycleComponent, bucause of onUpdate().