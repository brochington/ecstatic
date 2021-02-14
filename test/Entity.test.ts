/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import sinon from 'sinon';
import isUUID from 'validator/lib/isUUID';
import noop from 'lodash/noop';

import World from "../src/World";
import Entity, { EntityCompEventArgs } from "../src/Entity";
import DevEntity from '../src/DevEntity';
import { trackComponent } from '../src/TrackedComponent';

class FirstComponent {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class SecondComponent {}

type CompTypes =
  | FirstComponent
  | SecondComponent

describe('Entity', () => {
  it('exists', () => {
    const testWorld = new World<CompTypes>();
    const testEntity = new Entity<CompTypes>(testWorld);

    expect(testEntity).to.be.instanceof(Entity);
  });

  it('entity has correct id', () => {
    const testWorld = new World<CompTypes>();
    const testEntity = new Entity<CompTypes>(testWorld);

    expect(isUUID(testEntity.id, '4')).to.equal(true);
  });

  describe('instance methods', () => {
    it('add one entity', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);
      const testCompId = 'test-comp-1';

      testEntity.add(new FirstComponent(testCompId));

      const cc = testWorld.componentCollections.get(testEntity.id);
      expect(cc.size).to.equal(1);
      expect(cc.has(FirstComponent)).to.equal(true);
    });

    it('remove', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);

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
        if (ctArr.includes(FirstComponent.name) && ctArr.includes(SecondComponent.name)) {
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
        if (ctArr.includes(FirstComponent.name) && ctArr.includes(SecondComponent.name)) {
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
      const testEntity = new Entity<CompTypes>(testWorld);
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
      const testEntity = new Entity<CompTypes>(testWorld);
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
      const testEntity = new Entity<CompTypes>(testWorld);
      const testTag1 = 'Tag1';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag1)).to.equal(false);
      expect(testWorld.getTagged(testTag1)).to.equal(null);

      testEntity.addTag(testTag1);

      testEntity.destroyImmediately();

      expect(testWorld.getTagged(testTag1)).to.equal(null);
      expect(testWorld.getAllTagged(testTag1).length).to.equal(0);
    })
  });

  describe('dev', () => {
    it('toDevEntity', () => {
      const testWorld = new World<CompTypes>();

      function firstSystem() { /* */ }
      testWorld.addSystem([FirstComponent], firstSystem);

      const firstComp = new FirstComponent('id1');
      const testTag = 'testTag1';
      const testEntity = testWorld.createEntity()
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
        onCreate(world): void {
          expect(world).to.be.instanceof(World);
          onCreateFake();
        }
      }

      const firstLCComp = new FirstLCComp(world);

      expect(onCreateFake.callCount).to.equal(1);
    });

    it('onComponentAdd', () => {
      const world = new World<CompTypes>();

      const onCompAddFake = sinon.fake();

      class LCEntity extends Entity<CompTypes> {
        onComponentAdd({ world: _world, component }: EntityCompEventArgs<CompTypes>): void {
          expect(_world).to.be.instanceof(World);
          expect(component).to.be.instanceof(FirstComponent);
          onCompAddFake();
        }
      }

      const entity = new LCEntity(world);

      entity.add(new FirstComponent('testComp'));

      expect(onCompAddFake.callCount).to.equal(1);
    });

    it('onTrackedComponentUpdate', (done) => {
      const world = new World<CompTypes>();

      const TrackedComp = trackComponent(FirstComponent, {});

      class LCEntity extends Entity<CompTypes> {
        onTrackedComponentUpdate({ world: _world, component }) {
          expect(_world).to.be.instanceof(World);
          expect(component).to.be.instanceof(FirstComponent);
          expect(component).to.be.instanceof(TrackedComp);
          done();
        }
      }

      const lcEntity = new LCEntity(world);

      const comp = new TrackedComp('1'); // contsructor args is broken here...

      lcEntity.add(comp);

      comp.id = '2';
    })

    it('onComponentRemove', () => {
      const world = new World<CompTypes>();

      const onCompAddFake = sinon.fake();

      class LCEntity extends Entity<CompTypes> {
        onComponentRemove({ world: _world, component }: EntityCompEventArgs<CompTypes>): void {
          expect(_world).to.be.instanceof(World);
          expect(component).to.be.instanceof(FirstComponent);
          onCompAddFake();
        }
      }

      const entity = new LCEntity(world);

      entity.add(new FirstComponent('testComp'));

      entity.remove(FirstComponent);

      expect(onCompAddFake.callCount).to.equal(1);
    });

    it('onDestroy', () => {
      const world = new World<CompTypes>();

      const onDestoryFake = sinon.fake();

      class FirstLCComp extends Entity<CompTypes> {
        onDestroy(world): void {
          expect(world).to.be.instanceof(World);
          onDestoryFake();
        }
      }

      const firstLCComp = new FirstLCComp(world);

      firstLCComp.destroy();

      expect(onDestoryFake.callCount).to.equal(1);
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

      world.addSystem([FirstComponent], (args) => {
        const { entity: _entity } = args;

        systemFake();
        expect(_entity.state).to.equal('creating');
      }, 'testSystem');


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

      world.addSystem([FirstComponent], (args) => {
        const { entity: _entity } = args;

        systemFake();

        expect(_entity.state).to.equal('destroying');
      }, 'testSystem');

      const entity = world.createEntity().add(new FirstComponent('testEntity'));

      entity.destroy()

      expect(entity.state).to.equal('destroying')

      world.systems.run();

      expect(systemFake.callCount).to.equal(1);
      expect(entity.state).to.equal('destroyed');
    });

    it('entity.destoryImmediately(): Entity destruction is immediate', () => {
      const world = new World<CompTypes>();

      const systemFake = sinon.fake();

      world.addSystem([FirstComponent], () => {
        systemFake();
      }, 'testSystem');

      const entity = world.createEntity().add(new FirstComponent('testEntity'));

      entity.destroyImmediately()

      expect(entity.state).to.equal('destroyed')

      world.systems.run();

      expect(systemFake.callCount).to.equal(0);
      expect(entity.state).to.equal('destroyed');
    });
  });
});
