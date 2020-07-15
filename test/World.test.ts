import World from '../src/World';
import { createSystem } from '../src/System';
import Entity, { createEntity } from '../src/Entity';
import ComponentCollection from '../src/ComponentCollection';
import { Component } from '../src/Component';

enum CompTypes {
  FirstComponent,
  SecondComponent,
}

interface TestComp1Storage {
  id: string;
}

class TestComp1 implements Component<CompTypes> {
  type = CompTypes.FirstComponent;
  storage: TestComp1Storage;

  constructor(id: string) {
    this.storage = {
      id,
    }
  }
}

describe('World', () => {
  it('exists', () => {
    const testWorld = new World<CompTypes>();

    expect(testWorld).to.be.instanceof(World);
  });

  describe('instance methods', () => {
    context('registerSystems', () => {
      it('set correct content in the world instance.', () => {
        const testWorld = new World<CompTypes>();
        const cTypes = [CompTypes.FirstComponent];

        createSystem<CompTypes>(testWorld, cTypes, () => {
          // don't need to do anything here for this test.
        });
        expect(testWorld.entitiesByCTypes.has(cTypes)).to.equal(true);
        expect(testWorld.entitiesByCTypes.get(cTypes)).to.be.instanceof(Set);
      });
    });
    context('registerEntity', () => {
      it('creates ComponentCollection at correct entityId location in entities map', () => {
        const testWorld = new World<CompTypes>();

        const entity = createEntity<CompTypes>(testWorld);

        entity.add(new TestComp1('test-comp-1'));

        const cc = testWorld.componentCollections.get(entity.id) as ComponentCollection<CompTypes>;

        expect(cc.size).to.equal(1);

        expect(testWorld.entities.has(entity.id)).to.equal(true);
        expect(testWorld.entities.get(entity.id)).to.be.instanceof(Entity);
        expect(cc.has(CompTypes.FirstComponent)).to.equal(true);
        expect(cc.get<TestComp1>(CompTypes.FirstComponent).storage.id).to.equal('test-comp-1');


      });

      it('Add entity to entitiesByCType in correct spot', () => {
        const testWorld = new World<CompTypes>();
        const cTypes1 = [CompTypes.FirstComponent];
        const cTypes2 = [CompTypes.SecondComponent];

        testWorld.registerSystem(cTypes1);
        testWorld.registerSystem(cTypes2);

        const entity = createEntity<CompTypes>(testWorld);

        const firstComponet: Component<CompTypes> = {
          type: CompTypes.FirstComponent,
          storage: {},
        };

        entity.add(firstComponet);

        expect(testWorld.entitiesByCTypes.get(cTypes1).has(entity.id)).to.equal(
          true
        );
        expect(testWorld.entitiesByCTypes.get(cTypes2).has(entity.id)).to.equal(
          false
        );
      });
    });
    context('set', () => {
      it('sets component in the correct entityId, and updates entitiesByCType', () => {
        const testWorld = new World<CompTypes>();
        const cTypes = [CompTypes.FirstComponent];

        testWorld.registerSystem(cTypes);

        const entity = createEntity<CompTypes>(testWorld);

        const component: Component<CompTypes> = {
          type: CompTypes.FirstComponent,
          storage: {},
        };

        testWorld.set(entity.id, component);

        const cc = testWorld.componentCollections.get(entity.id) as ComponentCollection<CompTypes>;

        expect(cc).to.be.instanceof(ComponentCollection);
        expect(cc.has(CompTypes.FirstComponent)).to.equal(true);
        expect(cc.size).to.equal(1);

        expect(testWorld.entitiesByCTypes.get(cTypes).has(entity.id)).to.equal(true);
      });
    });
  });
});
