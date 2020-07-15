import isUUID from 'validator/lib/isUUID';
import noop from 'lodash/noop';

import World from "../src/World";
import Entity from "../src/Entity";
import { Component } from '../src/Component';
import ComponentCollection from '../src/ComponentCollection';
import { createSystem } from '../src/System'

enum CompTypes {
  FirstComponent,
  SecondComponent,
}

interface TestCompStorage {
  id: string;
}

class FirstComponent implements Component<CompTypes> {
  type = CompTypes.FirstComponent;
  storage: TestCompStorage;

  constructor(id: string) {
    this.storage = {
      id,
    }
  }
}

class SecondComponent implements Component<CompTypes> {
  type = CompTypes.SecondComponent;
  storage: TestCompStorage;

  constructor(id: string) {
    this.storage = {
      id,
    }
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
});
