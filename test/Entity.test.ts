import isUUID from 'validator/lib/isUUID';
import noop from 'lodash/noop';

import World from "../src/World";
import Entity from "../src/Entity";
import Component from '../src/Component';
import ComponentCollection from '../src/ComponentCollection';
import { createSystem } from '../src/System'

enum CompTypes {
  FirstComponent,
  SecondComponent,
}

interface TestCompStorage {
  id: string;
}

class FirstComponent extends Component<CompTypes, TestCompStorage> {
  type = CompTypes.FirstComponent;
  storage: TestCompStorage;

  constructor(id: string) {
    super({
      id,
    });
  }
}

class SecondComponent extends Component<CompTypes, TestCompStorage> {
  type = CompTypes.SecondComponent;
  storage: TestCompStorage;

  constructor(id: string) {
    super({
      id,
    });
  }
}

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
    it('add', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);
      const testCompId = 'test-comp-1';

      testEntity.add(new FirstComponent(testCompId));

      const cc = testWorld.componentCollections.get(testEntity.id) as ComponentCollection<CompTypes>;
      expect(cc.size).to.equal(1);
      expect(cc.has(CompTypes.FirstComponent)).to.equal(true);
    });

    it('remove', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);

      // Systems are needed here to create placeholders on entitiesByCTypes.
      createSystem(testWorld, [CompTypes.FirstComponent, CompTypes.SecondComponent], noop);
      createSystem(testWorld, [CompTypes.SecondComponent], noop);

      testEntity.add(new FirstComponent('test-comp-1'));
      testEntity.add(new SecondComponent('test-comp-2'));

      expect(testEntity.has(CompTypes.FirstComponent)).to.equal(true);
      expect(testEntity.has(CompTypes.SecondComponent)).to.equal(true);
      expect(testWorld.entitiesByCTypes.size).to.equal(2);

      // Testing to make sure World.entitiesByCType is dealt with correctly.
      let entitySet1 = new Set();
      for (const [ctArr, entitySet] of testWorld.entitiesByCTypes) {
        if (ctArr.includes(CompTypes.FirstComponent && ctArr.includes(CompTypes.SecondComponent))) {
          entitySet1 = entitySet;
        }
      }
      expect(entitySet1.size).to.equal(1);
      expect(entitySet1.has(testEntity.id)).to.equal(true);

      testEntity.remove(CompTypes.FirstComponent);

      expect(testEntity.has(CompTypes.FirstComponent)).to.equal(false);
      expect(testEntity.has(CompTypes.SecondComponent)).to.equal(true);

      let entitySet2 = new Set();
      let entitySet3 = new Set();
      for (const [ctArr, entitySet] of testWorld.entitiesByCTypes) {
        if (ctArr.includes(CompTypes.FirstComponent && ctArr.includes(CompTypes.SecondComponent))) {
          entitySet2 = entitySet;
          return;
        }

        if (ctArr.includes(CompTypes.SecondComponent)) {
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
      expect(testWorld.getTagged(testTag).length).to.equal(0);

      testEntity.addTag(testTag);

      expect(testEntity.hasTag(testTag)).to.equal(true);
      expect(testEntity.tags.size).to.equal(1);
      expect(testEntity.tags.has(testTag)).to.equal(true);
      expect(testWorld.getTagged(testTag).length).to.equal(1);
      expect(testWorld.getTagged(testTag)[0].id).to.equal(testEntity.id);
    });

    it('Remove tag from entity', () => {
      const testWorld = new World<CompTypes>();
      const testEntity = new Entity<CompTypes>(testWorld);
      const testTag1 = 'Tag1';
      const testTag2 = 'Tag2';

      expect(testEntity.tags.size).to.equal(0);
      expect(testEntity.hasTag(testTag1)).to.equal(false);
      expect(testWorld.getTagged(testTag1).length).to.equal(0);

      testEntity.addTag(testTag1);
      testEntity.addTag(testTag2);

      expect(testEntity.hasTag(testTag1)).to.equal(true);
      expect(testEntity.hasTag(testTag2)).to.equal(true);
      expect(testEntity.tags.size).to.equal(2);
      expect(testEntity.tags.has(testTag1)).to.equal(true);
      expect(testEntity.tags.has(testTag2)).to.equal(true);
      expect(testWorld.getTagged(testTag1).length).to.equal(1);
      expect(testWorld.getTagged(testTag1)[0].id).to.equal(testEntity.id);

      testEntity.removeTag(testTag2);

      expect(testEntity.hasTag(testTag1)).to.equal(true);
      expect(testEntity.hasTag(testTag2)).to.equal(false);
      expect(testEntity.tags.size).to.equal(1);
      expect(testEntity.tags.has(testTag1)).to.equal(true);
      expect(testEntity.tags.has(testTag2)).to.equal(false);
      expect(testWorld.getTagged(testTag1).length).to.equal(1);
      expect(testWorld.getTagged(testTag2).length).to.equal(0);
      expect(testWorld.getTagged(testTag1)[0].id).to.equal(testEntity.id);
    });
  });
});
