import { track } from '../src/TrackedComponent';
import World from '../src/World';

describe('LifeCycleComponent', () => {
  it('Scratchpad', () => {
    class MyComponent {
      something = 'here';

      hello: string;
      thisIsStuff: string;

      constructor(stuff: string) {
        this.hello = 'someone';
        this.thisIsStuff = stuff;
      }
    }

    const TrackedMyComp = track(MyComponent, {
      onAdd(...args) {
        console.log('external onAdd!', args);
      },
      onUpdate() {
        console.log('external onUpdate!');
      },
    });

    const myComp = new TrackedMyComp("hahaha");

    
    const world = new World<typeof MyComponent>();
    
    world.createEntity().add(myComp);

    console.log('myComp', myComp);
  });
});

