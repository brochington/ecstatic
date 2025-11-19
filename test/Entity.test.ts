import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'vitest';
import noop from 'lodash/noop';

import World from '../src/World';
import Entity, {
  EntityCompEventArgs,
  ComponentLifecycleEventArgs,
} from '../src/Entity';
import DevEntity from '../src/DevEntity';
import { trackComponent } from '../src/TrackedComponent';
import ComponentCollection from '../src/ComponentCollection';

class FirstComponent {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class SecondComponent {}

type CompTypes = FirstComponent | SecondComponent;

describe('Entity', () => {
  it('exists', () => {
    const testWorld = new World<CompTypes>();
    const testEntity = new Entity<CompTypes>(testWorld, 1);

    expect(testEntity).to.be.instanceof(Entity);
  });

  it('entity has correct id', () => {
    const testWorld = new World<CompTypes>();
    const testEntity = new Entity<CompTypes>(testWorld, 1);

    expect(testEntity.id).to.equal(1);
  });

  describe('instance methods', () => {
    it('add one entity', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld, 1);
      const testCompId = 'test-comp-1';

      testEntity.add(new FirstComponent(testCompId));

      const cc = testWorld.componentCollections.get(
        testEntity.id
      ) as ComponentCollection<CompTypes>;
      expect(cc).to.be.instanceof(ComponentCollection);
      expect(cc.size).to.equal(1);
      expect(cc.has(FirstComponent)).to.equal(true);
    });

    it('remove', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld, 1);

      testWorld.addSystem([FirstComponent, SecondComponent], noop);

      testEntity.add(new FirstComponent('test-comp-1'));
      testEntity.add(new SecondComponent());

      expect(testEntity.has(FirstComponent)).to.equal(true);
      expect(testEntity.has(SecondComponent)).to.equal(true);
      expect(testWorld.entitiesByCTypes.size).to.equal(1);

      // Testing to make sure World.entitiesByCType is dealt with correctly.
      let entitySet1 = new Set();

      for (const [ctArr, entitySet] of testWorld.entitiesByCTypes) {
        //@ts-ignore
        if (
          ctArr.includes(FirstComponent.name) &&
          ctArr.includes(SecondComponent.name)
        ) {
          entitySet1 = entitySet;
        }
      }

      expect(entitySet1.size).to.equal(1);
      expect(entitySet1.has(testEntity.id)).to.equal(true);

      testEntity.remove(FirstComponent);

      expect(testEntity.has(FirstComponent)).to.equal(false);
      expect(testEntity.has(SecondComponent)).to.equal(true);

      let entitySet2 = new Set();
      let entitySet3 = new Set();
      for (const [ctArr, entitySet] of testWorld.entitiesByCTypes) {
        // @ts-ignore
        if (
          ctArr.includes(FirstComponent.name) &&
          ctArr.includes(SecondComponent.name)
        ) {
          entitySet2 = entitySet;
          return;
        }

        // @ts-ignore
        if (ctArr.includes(SecondComponent.name)) {
          entitySet3 = entitySet;
        }
      }

      expect(entitySet2.size).to.equal(0);
      expect(entitySet2.has(testEntity.id)).to.equal(false);
      expect(entitySet3.size).to.equal(1);
      expect(entitySet3.has(testEntity.id)).to.equal(true);
    });
  });

  describe('tags', () => {
    it('Add a tag to an entity', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld, 1);
      const testTag = 'Tag1';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag)).to.equal(false);
      expect(testWorld.getTagged(testTag)).to.equal(null);

      testEntity.addTag(testTag);

      expect(testEntity.hasTag(testTag)).to.equal(true);
      expect(testEntity.tags.size).to.equal(1);
      expect(testEntity.tags.has(testTag)).to.equal(true);
      expect(testWorld.getTagged(testTag)).to.equal(testEntity);
      expect(testWorld.getAllTagged(testTag)[0]).to.equal(testEntity);
    });

    it('Remove tag from entity', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld, 1);
      const testTag1 = 'Tag1';
      const testTag2 = 'Tag2';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag1)).to.equal(false);
      expect(testWorld.getTagged(testTag1)).to.equal(null);

      testEntity.addTag(testTag1);
      testEntity.addTag(testTag2);

      expect(testEntity.hasTag(testTag1)).to.equal(true);
      expect(testEntity.hasTag(testTag2)).to.equal(true);
      expect(testEntity.tags.size).to.equal(2);
      expect(testEntity.tags.has(testTag1)).to.equal(true);
      expect(testEntity.tags.has(testTag2)).to.equal(true);
      expect(testWorld.getTagged(testTag1)).to.equal(testEntity);
      expect(testWorld.getAllTagged(testTag1)[0]).to.equal(testEntity);

      testEntity.removeTag(testTag2);

      expect(testEntity.hasTag(testTag1)).to.equal(true);
      expect(testEntity.hasTag(testTag2)).to.equal(false);
      expect(testEntity.tags.size).to.equal(1);
      expect(testEntity.tags.has(testTag1)).to.equal(true);
      expect(testEntity.tags.has(testTag2)).to.equal(false);
      expect(testWorld.getTagged(testTag1)).to.equal(testEntity);
      expect(testWorld.getTagged(testTag2)).to.equal(null);
      expect(testWorld.getAllTagged(testTag1)[0]).to.equal(testEntity);
    });

    it('Cleans up tags for entities that have been destroyed', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld, 1);
      const testTag1 = 'Tag1';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag1)).to.equal(false);
      expect(testWorld.getTagged(testTag1)).to.equal(null);

      testEntity.addTag(testTag1);

      testEntity.destroyImmediately();

      expect(testWorld.getTagged(testTag1)).to.equal(null);
      expect(testWorld.getAllTagged(testTag1).length).to.equal(0);
    });
  });

  describe('dev', () => {
    it('toDevEntity', () => {
      const testWorld = new World<CompTypes>();

      function firstSystem() {
        /* */
      }
      testWorld.addSystem([FirstComponent], firstSystem);

      const firstComp = new FirstComponent('id1');
      const testTag = 'testTag1';
      const testEntity = testWorld
        .createEntity()
        .add(firstComp)
        .addTag(testTag);

      const devEntity = testEntity.toDevEntity();

      expect(devEntity).to.be.instanceof(DevEntity);

      expect(devEntity.id).to.equal(testEntity.id);

      // components
      expect(devEntity.components.FirstComponent).to.eql({ id: firstComp.id });

      // tags
      expect(devEntity.tags.length).to.equal(1);
      expect(devEntity.tags[0]).to.equal(testTag);

      //systems
      expect(devEntity.systems.length).to.equal(1);
      expect(devEntity.systems[0]).to.equal(firstSystem.name);
    });
  });

  describe('lifecycle methods', () => {
    it('onCreate', () => {
      const world = new World<CompTypes>();

      const onCreateFake = sinon.fake();

      class FirstLCComp extends Entity<CompTypes> {
        onCreate(world: World<CompTypes>): void {
          expect(world).to.be.instanceof(World);
          onCreateFake();
        }
      }

      const _firstLCComp = new FirstLCComp(world, 1); // eslint-disable-line

      expect(onCreateFake.callCount).to.equal(1);
    });

    it('onComponentAdd', () => {
      const world = new World<CompTypes>();

      const onCompAddFake = sinon.fake();

      class LCEntity extends Entity<CompTypes> {
        onComponentAdd({
          world: _world,
          component,
        }: EntityCompEventArgs<CompTypes>): void {
          expect(_world).to.be.instanceof(World);
          expect(component).to.be.instanceof(FirstComponent);
          onCompAddFake();
        }
      }

      const entity = new LCEntity(world, 1);

      entity.add(new FirstComponent('testComp'));

      expect(onCompAddFake.callCount).to.equal(1);
    });

    it('onTrackedComponentUpdate', async () => {
      const world = new World<CompTypes>();

      const TrackedComp = trackComponent(FirstComponent, {});

      await new Promise<void>(resolve => {
        class LCEntity extends Entity<CompTypes> {
          onTrackedComponentUpdate({
            world: _world,
            component,
          }: EntityCompEventArgs<CompTypes>): void {
            expect(_world).to.be.instanceof(World);
            expect(component).to.be.instanceof(FirstComponent);
            expect(component).to.be.instanceof(TrackedComp);
            resolve();
          }
        }

        const lcEntity = new LCEntity(world, 1);

        const comp = new TrackedComp('1'); // contsructor args is broken here...

        lcEntity.add(comp);

        comp.id = '2';
      });
    });

    it('onComponentRemove', () => {
      const world = new World<CompTypes>();

      const onCompAddFake = sinon.fake();

      class LCEntity extends Entity<CompTypes> {
        onComponentRemove({
          world: _world,
          component,
        }: EntityCompEventArgs<CompTypes>): void {
          expect(_world).to.be.instanceof(World);
          expect(component).to.be.instanceof(FirstComponent);
          onCompAddFake();
        }
      }

      const entity = new LCEntity(world, 1);

      entity.add(new FirstComponent('testComp'));

      entity.remove(FirstComponent);

      expect(onCompAddFake.callCount).to.equal(1);
    });

    it('onDestroy', () => {
      const world = new World<CompTypes>();

      const onDestoryFake = sinon.fake();

      class FirstLCComp extends Entity<CompTypes> {
        onDestroy(world: World<CompTypes>): void {
          expect(world).to.be.instanceof(World);
          onDestoryFake();
        }
      }

      const firstLCComp = new FirstLCComp(world, 1);

      firstLCComp.destroy();

      expect(onDestoryFake.callCount).to.equal(1);
    });
  });

  describe('Component Lifecycle Hooks', () => {
    class LifecycleComponent {
      id: string;
      onAddCalled: boolean = false;
      onRemoveCalled: boolean = false;
      onAddArgs: any = null;
      onRemoveArgs: any = null;

      constructor(id: string) {
        this.id = id;
      }

      onAdd(args: ComponentLifecycleEventArgs<LifecycleComponent>) {
        this.onAddCalled = true;
        this.onAddArgs = args;
      }

      onRemove(args: ComponentLifecycleEventArgs<LifecycleComponent>) {
        this.onRemoveCalled = true;
        this.onRemoveArgs = args;
      }
    }

    class NoHooksComponent {
      value: number;

      constructor(value: number) {
        this.value = value;
      }
    }

    it('component onAdd hook is called when component is added to entity', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new LifecycleComponent('test-comp');

      expect(component.onAddCalled).to.equal(false);

      entity.add(component);

      expect(component.onAddCalled).to.equal(true);
      expect(component.onAddArgs.world).to.equal(world);
      expect(component.onAddArgs.entity).to.equal(entity);
      expect(component.onAddArgs.component).to.equal(component);
    });

    it('component onRemove hook is called when component is removed from entity', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new LifecycleComponent('test-comp');

      entity.add(component);
      expect(component.onRemoveCalled).to.equal(false);

      entity.remove(LifecycleComponent);

      expect(component.onRemoveCalled).to.equal(true);
      expect(component.onRemoveArgs.world).to.equal(world);
      expect(component.onRemoveArgs.entity).to.equal(entity);
      expect(component.onRemoveArgs.component).to.equal(component);
    });

    it('components without lifecycle hooks work normally', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new NoHooksComponent(42);

      expect(() => entity.add(component)).to.not.throw();
      expect(entity.has(NoHooksComponent)).to.equal(true);
      expect(entity.get(NoHooksComponent).value).to.equal(42);

      expect(() => entity.remove(NoHooksComponent)).to.not.throw();
      expect(entity.has(NoHooksComponent)).to.equal(false);
    });

    it('lifecycle hooks are called with correct arguments', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new LifecycleComponent('test-args');

      entity.add(component);

      // Check onAdd arguments
      expect(component.onAddArgs).to.have.property('world');
      expect(component.onAddArgs).to.have.property('entity');
      expect(component.onAddArgs).to.have.property('component');
      expect(component.onAddArgs.world).to.be.instanceof(World);
      expect(component.onAddArgs.entity).to.be.instanceof(Entity);
      expect(component.onAddArgs.component).to.be.instanceof(
        LifecycleComponent
      );

      entity.remove(LifecycleComponent);

      // Check onRemove arguments
      expect(component.onRemoveArgs).to.have.property('world');
      expect(component.onRemoveArgs).to.have.property('entity');
      expect(component.onRemoveArgs).to.have.property('component');
      expect(component.onRemoveArgs.world).to.be.instanceof(World);
      expect(component.onRemoveArgs.entity).to.be.instanceof(Entity);
      expect(component.onRemoveArgs.component).to.be.instanceof(
        LifecycleComponent
      );
    });

    it('lifecycle hooks are called when using world.add directly', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new LifecycleComponent('direct-add');

      expect(component.onAddCalled).to.equal(false);

      world.add(entity.id, component);

      expect(component.onAddCalled).to.equal(true);
      expect(component.onAddArgs.world).to.equal(world);
      expect(component.onAddArgs.entity).to.equal(entity);
    });

    it('lifecycle hooks are called when using world.remove directly', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const component = new LifecycleComponent('direct-remove');

      world.add(entity.id, component);
      expect(component.onRemoveCalled).to.equal(false);

      world.remove(entity.id, LifecycleComponent);

      expect(component.onRemoveCalled).to.equal(true);
      expect(component.onRemoveArgs.world).to.equal(world);
      expect(component.onRemoveArgs.entity).to.equal(entity);
    });

    it('multiple components with lifecycle hooks work independently', () => {
      const world = new World<CompTypes>();
      const entity = world.createEntity();
      const comp1 = new LifecycleComponent('comp1');
      const comp2 = new LifecycleComponent('comp2');

      entity.add(comp1);
      entity.add(comp2);

      expect(comp1.onAddCalled).to.equal(true);
      expect(comp2.onAddCalled).to.equal(true);
      expect(comp1.onAddArgs.entity).to.equal(entity);
      expect(comp2.onAddArgs.entity).to.equal(entity);

      entity.remove(LifecycleComponent); // This removes the first instance

      expect(comp1.onRemoveCalled || comp2.onRemoveCalled).to.equal(true);
    });
  });

  describe('Creation', () => {
    it('Setting of created state on entity is immediate if no systems added to world', () => {
      const world = new World<CompTypes>();

      const entity = world.createEntity();

      expect(entity.state).equals('created');
    });

    it('Setting of created state on entity is deferred until after systems are run', () => {
      const world = new World<CompTypes>();

      const systemFake = sinon.fake();

      world.addSystem(
        [FirstComponent],
        args => {
          const { entity: _entity } = args;

          systemFake();
          expect(_entity.state).to.equal('creating');
        },
        { name: 'testSystem' }
      );

      const entity = world.createEntity().add(new FirstComponent('testEntity'));

      expect(entity.state).to.equal('creating');

      world.systems.run();

      expect(systemFake.callCount).to.equal(1);
      expect(entity.state).to.equal('created');
    });
  });

  describe('Destruction', () => {
    it('Entity is destroyed immediately if no systems are added to the world.', () => {
      const world = new World<CompTypes>();

      const entity = world.createEntity();

      expect(entity.state).to.equal('created');

      entity.destroy();

      expect(entity.state).to.equal('destroyed');
    });

    it('Entity destruction is defered if systems are added to the world', () => {
      const world = new World<CompTypes>();

      const systemFake = sinon.fake();

      world.addSystem(
        [FirstComponent],
        args => {
          const { entity: _entity } = args;

          systemFake();

          expect(_entity.state).to.equal('destroying');
        },
        { name: 'testSystem' }
      );

      const entity = world.createEntity().add(new FirstComponent('testEntity'));

      entity.destroy();

      expect(entity.state).to.equal('destroying');

      world.systems.run();

      expect(systemFake.callCount).to.equal(1);
      expect(entity.state).to.equal('destroyed');
    });

    it('entity.destoryImmediately(): Entity destruction is immediate', () => {
      const world = new World<CompTypes>();

      const systemFake = sinon.fake();

      world.addSystem(
        [FirstComponent],
        () => {
          systemFake();
        },
        { name: 'testSystem' }
      );

      const entity = world.createEntity().add(new FirstComponent('testEntity'));

      entity.destroyImmediately();

      expect(entity.state).to.equal('destroyed');

      world.systems.run();

      expect(systemFake.callCount).to.equal(0);
      expect(entity.state).to.equal('destroyed');
    });
  });
});
