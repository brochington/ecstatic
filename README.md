# Ecstatic - A Simple ECS library

#### Ecstatic is a straightforward Javascript implementation of the ECS pattern commonly found in the games.

Lots more info on the [Documentation Site](https://brochington.github.io/ecstatic-doc-site/docs/getting_started/what-is-ecs/)

[API Documentation](https://brochington.github.io/ecstatic/)

```
$ npm install @brochington/estatic
```

Ecstatic is:

- **Fast!** Some fancy indexing occurs when an entity is created to make sure that systems iterate over entities very efficiently.
- **Simple!**
  - Class definitions (`class MyClass { ... }`) are used to key off of for things like Sytem registration and component querying. This greatly helps to reduce the amount typing.
  - Component classes need not inherit from any base Component class.
- **Type Safe!** Typescript is not required, but if you do use it, then you can enjoy autocomplete throughout.

### Example

```typescript
import {
  World,
  createSystem,
  SystemFuncArgs,
  Entity,
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
type Components = AwesomeComponent | UnusedComponent;

/*
  Create an instance of the world, which contains all ECS state, 
  including all entities and components. Also has some methods
  to help in interacting with these as well.
*/
const world = new World<Components>();

/* Create a system */
world.addSystem(
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
  },
  `AwesomeSystem` // Add an optional name if passing an anonymous function.
);

/* Create a component instance */
const awesomeComponent = new AwesomeComponent();

/* Create entity instance */
const awesomeEntity = new Entity<Components>(world);

/* Add a component to the entity */
awesomeEntity.add(awesomeComponent);

/* Run system */
world.systems.run();

/* find entities by component, which is this case is the same instance as awesomeEntity above. */
const stillAwesomeEntity = world.locate([AwesomeComponent]);

/* Get Component instance attached to entity */
const awesomeComp = stillAwesomeEntity.get(AwesomeComponent);

/* Count is updated! */
expect(awesomeComp.count).to.equal(1);
```

## Development

This project uses several tools to maintain code quality and consistency:

### Code Formatting

The codebase uses [Prettier](https://prettier.io/) for consistent code formatting:

```bash
# Format all files
npm run format

# Check if files are properly formatted
npm run format:check
```

### Linting

[ESLint](https://eslint.org/) is used for code quality and style checking:

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Quality Checks

Run both formatting and linting checks together:

```bash
# Check both formatting and linting
npm run quality
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm test:ui
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Questions? Comments? Bugs?

Create an issue, but be kind :)
