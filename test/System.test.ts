import { expect } from "chai";
import sinon from "sinon";
import { createSystem, SystemFuncArgs } from "../src/System";
import Entity, { createEntity } from "../src/Entity";
import noop from "lodash/noop";
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
  | typeof FirstComponent
  | typeof SecondComponent
  | typeof ThirdComponent;

function firstSystem() { /* */ }

describe("System", () => {
  it("create a system", () => {
    const world = new World<CompTypes>();

    const system1 = createSystem(world, [FirstComponent], firstSystem);

    expect(system1).to.be.instanceof(Function);

    world.dev.logSystemCompTable();
  });

  it("Basic System Run", (done) => {
    const world = new World<CompTypes>();

    const system = createSystem(world, [FirstComponent], (args) => {
      const { components } = args;

      const firstComp = components.get(FirstComponent);

      expect(firstComp.id).to.equal("first");
      done();
    });

    createEntity(world).add(new FirstComponent("first"));

    system();
  });

  it("Correctly calls systems based on created entities", () => {
    const world = new World<CompTypes>();

    const fake1 = sinon.fake();
    const fake2 = sinon.fake();
    const fake3 = sinon.fake();
    const fake4 = sinon.fake();

    const system1 = createSystem(world, [FirstComponent], fake1);
    const system2 = createSystem(world, [SecondComponent], fake2);
    const system3 = createSystem(world, [ThirdComponent], fake3);
    const system4 = createSystem(
      world,
      [FirstComponent, SecondComponent],
      fake4
    );

    // entity 1;
    createEntity(world).add(new FirstComponent("first"));

    // entity 2;
    createEntity(world)
      .add(new FirstComponent("a"))
      .add(new SecondComponent("b"));

    system1();
    system2();
    system3();
    system4();

    expect(fake1.callCount).to.equal(2); // entity 1 and 2
    expect(fake2.callCount).to.equal(1); // entity 2
    expect(fake3.callCount).to.equal(0); // no entities
    expect(fake4.callCount).to.equal(1); // entity 2
  });

  it("Correct args passed to system function", (done) => {
    const world = new World<CompTypes>();

    const system = createSystem(
      world,
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

    createEntity(world).add(new FirstComponent('a'));

    system();
  });
});
