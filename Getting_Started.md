# Getting Started

Lots more info on the [Documentation Site](https://brochington.github.io/ecstatic-doc-site/docs/getting_started/what-is-ecs/)

## What is ECS?

ECS stands for `Entity, Component, System`, and is a way to organize logic and state in your code. Although the definition of each of these parts can vary greatly with the implementation, the way that Ecstatic defines these is:

- `Entity` - An unique ID. Ecstatic houses this ID in an object with some helper methods (`new Entity()`) .

- `Component` - A container of state, that has a type. Each instance of a Component is usually linked to an Entity. Basically the Entity has a collection of components that are "attached" to it.

- `Systems` - Systems are functions that iterate all Entities that have Components that match certain types. If I have an Entity with a `MyComponent` Component added to it, and I have a System that is set to be called on all Entities that have a `MyComponent` Component attached to it, then my Sytem will be called. The important part here is that the composition of the types of Components is what determines what logic is run. Usually Systems are run every "tick", and in a loop.

---

## Setup

### Creating a World instance

A `World` in ECS contains all instances of entities, and also facilitates registering of systems.

```typescript
const world = new World();
```

### Creating and Registering Systems

```typescript
// Define the components that let the system identify which entities to run on.
// In other words, if an entity has all the defined components, then the system will be called on it.
const systemComponents = [Component1, Component];

// Systems are provided a number of helpful arguments to work on in the function body.
const systemFunction = args => {
  const {
    world, // the world instance
    entity, // the current entity
    components, // the current entity's components
    index, // index of which entity of all entities that the system will run over
    isFirst, // If this is the first entity to run in this system pass
    isLast, // If this is the last entity to be run over in this system pass.
    size, // The count of entities that match the given system component requirements.
  } = args;
};

// Register the components and system function together on the world.
// This will return a function that should be called in a loop along with
// all other systems, usually once each "tick".
const firstSystem = world.addSystem(
  systemComponents,
  systemFunction
)(
  // Running every system in a loop allows for changes in components to be picked up, adding
  // a degree of declarativity, but is not required.
  function run() {
    world.systems.run();

    window.requestAnimationFrame(run);
  }
)();
```

### Creating Entities and adding Components

```typescript
class MyComponent {}

const myEntity = world.createEntity();

myEntity.add(new MyComponent());
```

### Querying Entities

There are many methods available on the `World` instance to query entites by what types of Components are attached to them. There is no need to define a "Query" ahead of time. For a complete list, check out the [World Instance Methods](https://brochington.github.io/ecstatic/classes/_src_world_.world.html) in the API Documentation. Some highlights include:

```typescript
// `world.locate()` "locates" a single entity based on its Components.
const entity1 = world.locate([Component1, Component2]);

// `world.grabAll "Grabs" all entities that have a component of the given type attached,
// as well as the actual component instance.

world.grabAll(Component1).forEach(({ entity, component }) => /* do greate things */)

```

### Tags

Tags may be added to entities in much the same way as components. A tag is just a string.

```typescript
const myEntity = world.createEntity().addTag('AwesomeTag');
```

Entities can be queried by tag

```typescript
const myEntity = world.getTagged('AwesomeTag');
```
