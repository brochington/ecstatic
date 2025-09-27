import { expect } from "chai";
import sinon from 'sinon';
import { trackComponent } from '../src/TrackedComponent';
import World from '../src/World';
import Entity from '../src/Entity';

describe('TrackedComponent', () => {
  it('returns a wrapped component class constructor', () => {
    class Component1 {}

    const TrackedComp1 = trackComponent(Component1, {});

    const comp = new TrackedComp1();

    expect(comp).is.an.instanceof(Component1);
  });

  describe('trackComponent()', () => {
    it('add onAdd event handler to a component', () => {
      class Component1 {}

      let entityID = null;
      let eidCount = 0;

      const onAddFake = sinon.fake();

      const TrackedComp1 = trackComponent(Component1, {
        onAdd: (args) => {
          const { component, world, entity, entities } = args;

          expect(component).to.be.an.instanceof(Component1);
          expect(world).to.be.an.instanceof(World);
          expect(entity).to.be.an.instanceof(Entity);
          expect(entities.size).to.equal(eidCount);
          expect(entities.get(entityID)).to.be.an.instanceof(Entity);

          onAddFake()
        },
      });

      const world = new World<Component1>();
      const component = new TrackedComp1();

      const entity1 = world.createEntity();
      entityID = entity1.id;
      eidCount += 1;

      entity1.add(component);

      expect(onAddFake.callCount).to.equal(1);

      const entity2 = world.createEntity();
      entityID = entity2.id;
      eidCount += 1;

      entity2.add(component);

      expect(onAddFake.callCount).to.equal(2);
    });

    it('add onUpdate event handler to a component', async () => {
      class Component1 {
        test = 1;
      }

      let entityID = null;

      await new Promise<void>((resolve) => {
        const TrackedComp1 = trackComponent(Component1, {
          onUpdate: (args) => {
            const { component, world, previousVal, property, entities } = args;

            expect(component).to.be.an.instanceof(Component1);
            expect(world).to.be.an.instanceof(World);
            expect(previousVal).to.equal(1);
            expect(component.test).to.equal(2);
            expect(property).to.equal('test');
            expect(entities.size).to.equal(1);
            expect(entities.get(entityID)).to.be.an.instanceof(Entity);

            resolve();
          },
        });

        const world = new World<Component1>();
        const comp = new TrackedComp1();
        const entity = world.createEntity().add(comp);
        entityID = entity.id;

        comp.test = 2;
      });
    });

    it('add onRemove event handler to component', async () => {
      class Component1 {
        test = 1;
      }

      let entityID = null;
  
      const world = new World<Component1>();
      const entity = world.createEntity();
      entityID = entity.id;

      await new Promise<void>((resolve) => {
        const TrackedComp1 = trackComponent(Component1, {
          onRemove: (args) => {
            const { component, world, entity, entities } = args;

            expect(component).to.be.an.instanceof(Component1);
            expect(component.test).to.equal(1);

            expect(world).to.be.an.instanceof(World);

            expect(entity).to.be.an.instanceof(Entity);
            expect(entityID).to.not.equal(null);
            expect(entityID).to.equal(entity.id);
            expect(entities.size).to.equal(0);

            resolve();
          },
        });

        entity.add(new TrackedComp1());
        entity.remove(TrackedComp1);
      });
    });
  });
});

