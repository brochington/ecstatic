/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import isUUID from 'validator/lib/isUUID';
import noop from 'lodash/noop';

import World from "../src/World";
import Entity from "../src/Entity";
import { createSystem } from '../src/System'

class FirstComponent {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class SecondComponent {}

type CompTypes =
  | typeof FirstComponent
  | typeof SecondComponent

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

      createSystem(testWorld, [FirstComponent, SecondComponent], noop);

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

      console.log(testWorld.dev.entities);
    });

    it('Cleans up tags for entities that have been destroyed', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);
      const testTag1 = 'Tag1';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag1)).to.equal(false);
      expect(testWorld.getTagged(testTag1)).to.equal(null);

      testEntity.addTag(testTag1);

      testEntity.destroy();

      expect(testWorld.getTagged(testTag1)).to.equal(null);
      expect(testWorld.getAllTagged(testTag1).length).to.equal(0);
    })
  });
});
