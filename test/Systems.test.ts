import { expect } from "chai";
import sinon from "sinon";
import { SystemFuncArgs } from "../src/Systems";
import Entity from "../src/Entity";
import World from "../src/World";
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

class ThirdComponent {}

type CompTypes =
  | FirstComponent
  | SecondComponent
  | ThirdComponent;

function firstSystem() {
  /* */
}

describe("System", () => {
  it("create a system", () => {
    const world = new World<CompTypes>();

    world.addSystem([FirstComponent], firstSystem);

    expect(world.systems.systemFuncBySystemName.get(firstSystem.name)).to.equal(firstSystem);
  });

  it("Run System with Anonymous function", (done) => {
    const world = new World<CompTypes>();

    world.addSystem([FirstComponent], (args) => {
      const { components } = args;

      const firstComp = components.get(FirstComponent);

      expect(firstComp.id).to.equal("first");
      done();
    });

    world.createEntity().add(new FirstComponent("first"));

    world.systems.run();
  });

  it("Correctly calls systems based on created entities", () => {
    const world = new World<CompTypes>();

    const fake1 = sinon.fake();
    const fake2 = sinon.fake();
    const fake3 = sinon.fake();
    const fake4 = sinon.fake();

    world
      .addSystem([FirstComponent], fake1, "fake1")
      .addSystem([SecondComponent], fake2, "fake2")
      .addSystem([ThirdComponent], fake3, "fake3")
      .addSystem([FirstComponent, SecondComponent], fake4, "fake4");

    // entity 1;
    world.createEntity().add(new FirstComponent("first"));

    // entity 2;
    world.createEntity()
      .add(new FirstComponent("a"))
      .add(new SecondComponent("b"));

    world.systems.run();

    expect(fake1.callCount).to.equal(2); // entity 1 and 2
    expect(fake2.callCount).to.equal(1); // entity 2
    expect(fake3.callCount).to.equal(0); // no entities
    expect(fake4.callCount).to.equal(1); // entity 2
  });

  it("Correct args passed to system function", (done) => {
    const world = new World<CompTypes>();

    world.addSystem(
      [FirstComponent],
      (args: SystemFuncArgs<CompTypes>) => {
        expect(args.entity).to.be.instanceof(Entity);
        expect(args.components).to.be.instanceof(ComponentCollection);
        expect(args.components.size).to.equal(1);
        expect(args.world).to.be.instanceof(World);
        expect(args.index).to.equal(0);
        expect(args.isFirst).to.equal(true);
        expect(args.isLast).to.equal(true);

        done();
      }
    );

    world.createEntity().add(new FirstComponent("a"));

    world.systems.run();
  });
});
