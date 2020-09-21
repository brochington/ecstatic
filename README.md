# Ecstatic
#### a simple ECS lib

[Documentation](https://brochington.github.io/ecstatic/)

Ecstatic is a straightforward Javascript implementation of the ECS pattern. 

Ecstatic is:
- **Fast!** Some fancy indexing occurs when an entity is created to make sure that systems iterate over entities very efficiently.
- **Simple!** Class definitions (`class MyClass { ... }`) are used to key off of for things like Sytem registration and component querying. This greatly helps to reduce the amount typing. 
- **Type Safe!** Typescript is not required, but if you do use it, then you can enjoy autocomplete throughout.


```typescript
import {
  World,
  createSystem,
  SystemFuncArgs,
  Entity
} from '@brochington/ecstatic';

/*
  Components are just a regular ol' class!
  No need to inherit or extend another class. 
*/
class AwesomeComponent {
  count = 0;
}

class UnusedComponent {}

/*
  This type lets Ecstatic know the available component types.
  Unneeded if you are using vanilla JS.
*/ 
type Components = typeof AwesomeComponent | typeof UnusedComponent

/*
  Create an instance of the world, which contains all ECS state, 
  including all entities and components. Also has some methods
  to help in interacting with these as well.
*/
const world = new World<Components>();

/* Create a system */
const system = world.createSystem(
  /* 
    Note that you pass in the Component Class definition here.
    No need to use other keys such as strings.
  */
  [AwesomeComponent],
  (args: SystemFuncArgs<Components>): void => {
    const { components } = args;
    /*
      Ecstatic offers a number of ways to query for entities and components.
      Great care has been taken to maintain type completion in Typescript.
    */
    const comp = components.get(AwesomeComponent);

    comp.count += 1;
  }
);

/* Create a component instance */
const awesomeComponent = new AwesomeComponent();

/* Create entity instance */
const awesomeEntity = new Entity<Components>(world)

/* Add a component to the entity */
awesomeEntity.add(awesomeComponent);

/* Run system */
system.run();

/* Count is updated! */
expect(awesomeComponent.count).to.equal(1);
```

### What is ECS?
ECS stands for `Entity, Component, System`, and is a way to organize logic and state in your code. Although the definition of each of these parts can vary greatly with the implementation,  the way that Ecstatic defines these is:

- `Entity` - An unique ID. Ecstatic houses this ID in an object with some helper methods (`new Entity()`) .

- `Component` - A container of state, that has a type. Each instance of a Component is usually linked to an Entity. Basically the Entity has a collection of components that are "attached" to it.

- `Systems` - Systems are functions that iterate all Entities that have Components that match certain types. If I have an Entity with a `MyComponent` Component added to it, and I have a System that is set to be called on all Entities that have a `MyComponent` Component attached to it, then my Sytem will be called. The important part here is that the composition of the types of Components is what determines what logic is run. Usually Systems are run every "tick", and in a loop.

There is a whooooole lot more that can go into this, but this should be enough to let you start Googling up things. Although ECS is not too common in JS land, it's the new hotness in videogame engines.

### Questions? Comments? Bugs?
Create an issue, but be kind :)