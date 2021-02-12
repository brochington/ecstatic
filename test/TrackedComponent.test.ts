import { expect } from "chai";
import sinon from 'sinon';
import { trackComponent } from '../src/TrackedComponent';
import World from '../src/World';
import Entity from '../src/Entity';

describe('TrackedComponent', () => {
  // it('Scratchpad', () => {
  //   class MyComponent {
  //     something = 'here';

  //     hello: string;
  //     thisIsStuff: string;

  //     constructor(stuff: string) {
  //       this.hello = 'someone';
  //       this.thisIsStuff = stuff;
  //     }
  //   }

  //   type CompTypes = typeof MyComponent;

  //   const TrackedMyComp = trackComponent<CompTypes, MyComponent>(MyComponent, {
  //     onAdd(...args) {
  //       // console.log('external onAdd!', args);
  //     },
  //     onUpdate() {
  //       // console.log('external onUpdate!');
  //     },
  //   });

  //   const myComp = new TrackedMyComp("hahaha");

    
  //   const world = new World<CompTypes>();
    
  //   world.createEntity().add(myComp);

  //   // console.log('myComp', myComp);
  // });
  it('returns a wrapped component class constructor', () => {
    class Component1 {}

    const TrackedComp1 = trackComponent(Component1, {});

    const comp = new TrackedComp1();

    expect(comp).is.an.instanceof(Component1);
  })

  describe('trackComponent()', () => {
    it('add onAdd event handler to a component', (done) => {
      class Component1 {}

      const TrackedComp1 = trackComponent<typeof Component1, Component1>(Component1, {
        onAdd: (args) => {
          const { component, world, entity } = args;

          expect(component).to.be.an.instanceof(Component1);
          expect(world).to.be.an.instanceof(World);
          expect(entity).to.be.an.instanceof(Entity);

          done();
        },
      });

      const world = new World<typeof Component1>();

      world.createEntity().add(new TrackedComp1());
    });

    it('add onUpdate event handler to a component', (done) => {
      class Component1 {
        test = 1;
      }

      const TrackedComp1 = trackComponent<typeof Component1, Component1>(Component1, {
        onUpdate: (args) => {
          const { component, world, previousVal, property } = args;

          expect(component).to.be.an.instanceof(Component1);
          expect(world).to.be.an.instanceof(World);
          expect(previousVal).to.equal(1);
          expect(component.test).to.equal(2);
          expect(property).to.equal('test');

          done();
        },
      });

      const world = new World<typeof Component1>();

      const comp = new TrackedComp1();

      world.createEntity().add(comp);

      comp.test = 2;
    });

    it('add onRemove event handler to component', (done) => {
      class Component1 {
        test = 1;
      }

      let entityID = null;
      const TrackedComp1 = trackComponent(Component1, {
        onRemove: (args) => {
          const { component, world, entity } = args;
  
          expect(component).to.be.an.instanceof(Component1);
          expect(component.test).to.equal(1);
          
          expect(world).to.be.an.instanceof(World);
          
          expect(entity).to.be.instanceof(Entity);
          expect(entityID).to.not.equal(null);
          expect(entityID).to.equal(entity.id);
  
          done();
        },
      });
  
      const world = new World<typeof Component1>();
      
      const entity = world.createEntity().add(new TrackedComp1());

      entityID = entity.id;
  
      entity.remove(TrackedComp1); // should this work for Component1 too?
    });
  });
});

