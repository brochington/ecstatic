# ecstatic
a simple ECS lib


```typescript
import {
  World,
  createSystem,
  SystemFuncArgs,
  Entity
} from '@brochington/ecstatic';

type enum Components {
  AwesomeComponent,
  CoolComponent
}

// Implement a class that uses the Component stucture.
class AwesomeComponent implements Component<Components> {
  type = Components.AwesomeComponent;

  storage: {
    count: number = 0,
  };

  // It can be nice to place some accessors on the class for
  // storage contents.
  get count(): number {
    return this.storage.count;
  }

  set count(nextCount: number) {
    this.storage.count = nextCount;
  }
}

// Create a component instance
const awesomeComponent = new AwesomeComponent();

// Create an instance of the world, which contains all ECS state, 
// including all entities and components. Also has some methods
// to help in interacting with these as well.
const world = new World<Components>();

// Create a system
const system = createSystem(
  world,
  [Components.AwesomeComponent],
  (args: SystemFuncArgs<Components>): void => {
    const { components } = args;
    // do stuff with components here.
  }
)

// Create entity instance
const awesomeEntity = new Entity<Components>(world)

// Add a component to the entity
awesomeEntity.add(awesomeComponent);

// Run system
system.run();
```