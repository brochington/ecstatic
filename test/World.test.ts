import { expect } from "chai";
import noop from "lodash/noop";
import World from "../src/World";
import { createSystem } from "../src/System";
import Entity, { createEntity } from "../src/Entity";
import ComponentCollection from "../src/ComponentCollection";

class FirstComponent {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class SecondComponent {
  otherId: string;
  constructor(otherId: string) {
    this.otherId = otherId;
  }
}

interface CompTypes {
  FirstComponent: typeof FirstComponent;
  SecondComponent: typeof SecondComponent;
}

// type CompTypes = FirstComponent | SecondComponent;

describe("World", () => {
  it("exists", () => {
    const testWorld = new World<CompTypes>();

    expect(testWorld).to.be.instanceof(World);
  });

  describe("instance methods", () => {
    context("registerSystems", () => {
      it("set correct content in the world instance.", () => {
        const testWorld = new World<CompTypes>();
        const cTypes = [FirstComponent];

        createSystem<CompTypes>(testWorld, cTypes, noop);

        const t = [...testWorld.entitiesByCTypes.entries()];

        expect(testWorld.entitiesByCTypes.size).to.equal(1);
        expect(t[0][0].includes(FirstComponent.name)).to.equal(true);
        expect(t[0][1]).to.be.instanceof(Set);
        // expect(testWorld.entitiesByCTypes.has(ctNames)).to.equal(true);
      });
    });
    context("registerEntity", () => {
      it("creates ComponentCollection at correct entityId location in entities map", () => {
        const testWorld = new World<CompTypes>();

        const entity = createEntity<CompTypes>(testWorld);

        entity.add(new FirstComponent("test-comp-1"));

        const cc = testWorld.componentCollections.get(entity.id);

        expect(cc.size).to.equal(1);

        expect(testWorld.entities.has(entity.id)).to.equal(true);
        expect(testWorld.entities.get(entity.id)).to.be.instanceof(Entity);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.has([FirstComponent, SecondComponent])).to.equal(false);
        expect(cc.get(FirstComponent).id).to.equal("test-comp-1");
      });

      it("Add entity to entitiesByCType in correct spot", () => {
        const testWorld = new World<CompTypes>();
        const cTypes1 = [FirstComponent];
        const cTypes2 = [SecondComponent];

        const ctNames1 = cTypes1.map((ct) => ct.name) as (keyof CompTypes)[];
        const ctNames2 = cTypes2.map((ct) => ct.name) as (keyof CompTypes)[];

        testWorld.registerSystem(ctNames1);
        testWorld.registerSystem(ctNames2);

        const entity = createEntity<CompTypes>(testWorld);

        const firstComponet = new FirstComponent("test-comp-1");
        entity.add(firstComponet);

        expect(
          testWorld.entitiesByCTypes.get(ctNames1).has(entity.id)
        ).to.equal(true);
        expect(
          testWorld.entitiesByCTypes.get(ctNames2).has(entity.id)
        ).to.equal(false);
      });
    });

    context("find", () => {
      it("finds correct entity", () => {
        const world = new World<CompTypes>();

        const entity1 = createEntity(world).add(new FirstComponent("a"));

        createEntity(world).add(new FirstComponent("b"));

        const foundEntity = world.find((entity) => {
          const comp = entity.components.get(FirstComponent);
          return comp.id === "a";
        });

        expect(foundEntity).to.be.instanceof(Entity);
        expect(foundEntity.id).to.equal(entity1.id);
      });
    });

    context("findAll", () => {
      it("finds all filtered entities", () => {
        const world = new World<CompTypes>();

        const entity1 = createEntity(world).add(new FirstComponent("a"));
        const entity2 = createEntity(world).add(new FirstComponent("a"));
        const entity3 = createEntity(world).add(new FirstComponent("b"));
        createEntity(world).add(new SecondComponent("c"));

        const foundEntities = world.findAll((entity) => {
          if (entity.components.has(FirstComponent)) {
            const comp = entity.components.get(FirstComponent);

            return comp.id === "a";
          }

          return false;
        });

        expect(foundEntities.length).to.equal(2);
        expect(foundEntities.includes(entity1)).to.equal(true);
        expect(foundEntities.includes(entity2)).to.equal(true);
        expect(foundEntities.includes(entity3)).to.equal(false);
      });
    });

    it("locate", () => {
      const world = new World<CompTypes>();

      createSystem(world, [FirstComponent], noop);

      const entity1 = createEntity(world).add(new FirstComponent("a"));
      createEntity(world).add(new FirstComponent("b"));
      createEntity(world).add(new FirstComponent("c"));

      const l = world.locate(FirstComponent);

      expect(l.id).to.equal(entity1.id);
    });

    it("grab", () => {
      const world = new World<CompTypes>();

      createSystem(world, [FirstComponent], noop);

      expect(world.grab(FirstComponent)).to.equal(null);

      const entity1 = createEntity(world).add(new FirstComponent("a"));
      createEntity(world).add(new FirstComponent("b"));
      createEntity(world).add(new FirstComponent("c"));

      const { entity, component } = world.grab(FirstComponent);

      expect(entity.id).to.equal(entity1.id);
      expect(component.id).to.equal("a");
    });

    it("grabBy", () => {
      const world = new World<CompTypes>();

      const pred = (comp: FirstComponent) => {
        return comp.id === "b";
      };

      createSystem(world, [FirstComponent], noop);

      expect(world.grabBy(FirstComponent, pred)).to.equal(null);

      createEntity(world).add(new FirstComponent("a"));
      const entity2 = createEntity(world).add(new FirstComponent("b"));
      createEntity(world).add(new FirstComponent("c"));

      const { entity, component } = world.grabBy(FirstComponent, pred);

      expect(entity.id).to.equal(entity2.id);
      expect(component.id).to.equal("b");
    });

    it("grabAll", () => {
      const world = new World<CompTypes>();

      createSystem(world, [FirstComponent], noop);

      expect(world.grabAll(FirstComponent).length).to.equal(0);

      const entity1 = createEntity(world).add(new FirstComponent("a"));
      const entity2 = createEntity(world).add(new FirstComponent("b"));
      const entity3 = createEntity(world).add(new FirstComponent("c"));

      const [first, second, third] = world.grabAll(FirstComponent);

      expect(first.entity.id).to.equal(entity1.id);
      expect(first.component.id).to.equal('a')

      expect(second.entity.id).to.equal(entity2.id);
      expect(second.component.id).to.equal("b");

      expect(third.entity.id).to.equal(entity3.id);
      expect(third.component.id).to.equal("c");
    });

    it('get', () => {
      const world = new World<CompTypes>();

      createSystem(world, [FirstComponent], noop);

      const entity1 = createEntity(world).add(new FirstComponent("a"));

      const comp = world.get(entity1.id, FirstComponent);

      expect(comp.id).to.equal('a');
    })

    context("set", () => {
      it("sets component in the correct entityId, and updates entitiesByCType", () => {
        const testWorld = new World<CompTypes>();
        const cTypes = [FirstComponent];

        const ctNames = cTypes.map((ct) => ct.name) as (keyof CompTypes)[];
        testWorld.registerSystem(ctNames);

        const entity = createEntity<CompTypes>(testWorld);

        const component = new FirstComponent("test-comp-1");

        testWorld.set(entity.id, component);

        const cc = testWorld.componentCollections.get(entity.id);

        expect(cc).to.be.instanceof(ComponentCollection);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.size).to.equal(1);

        expect(testWorld.entitiesByCTypes.get(ctNames).has(entity.id)).to.equal(
          true
        );
      });
    });
  });
});
