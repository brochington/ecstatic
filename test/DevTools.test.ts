import { expect } from "chai";
import { describe, it } from "vitest";

import DevTools from "../src/DevTools";
import World from "../src/World";
import DevEntity from "../src/DevEntity";

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

type CompTypes = FirstComponent | SecondComponent;

function firstSystem() {
  /* */
}
function secondSystem() {
  /* */
}
function thirdSystem() {
  /* */
}

describe("DevTools", () => {
  it("exits", () => {
    const testWorld = new World<CompTypes>();

    expect(testWorld.dev).to.be.an.instanceof(DevTools);
  });

  it("dev.systemComponents", () => {
    const testWorld = new World<CompTypes>();

    testWorld
      .addSystem([FirstComponent], firstSystem)
      .addSystem([SecondComponent], secondSystem)
      .addSystem([FirstComponent, SecondComponent], thirdSystem);

    testWorld.createEntity().add(new FirstComponent("first-1"));
    testWorld.createEntity().add(new SecondComponent("second-1"));
    testWorld
      .createEntity()
      .add(new FirstComponent("first-2"))
      .add(new SecondComponent("second-2"));

    const systemComps = testWorld.dev.systemComponents;

    expect(systemComps.length).to.equal(3);

    const [sc1, sc2, sc3] = systemComps;
    expect(sc1).to.be.an.eql({
      system: firstSystem.name,
      components: "FirstComponent",
    });
    expect(sc2).to.be.an.eql({
      system: secondSystem.name,
      components: "SecondComponent",
    });
    expect(sc3).to.be.an.eql({
      system: thirdSystem.name,
      components: "FirstComponent, SecondComponent",
    });
  });

  it("dev.entities", () => {
    const testWorld = new World<CompTypes>();

    testWorld
      .addSystem([FirstComponent], firstSystem)
      .addSystem([SecondComponent], secondSystem)
      .addSystem([FirstComponent, SecondComponent], thirdSystem);

    testWorld.createEntity().add(new FirstComponent("first-1"));
    testWorld.createEntity().add(new SecondComponent("second-1"));
    testWorld
      .createEntity()
      .add(new FirstComponent("first-2"))
      .add(new SecondComponent("second-2"));

    const devEntities = testWorld.dev.entities;

    expect(devEntities.length).to.equal(3);

    const [de1, de2, de3] = devEntities;
    expect(de1).to.be.an.instanceof(DevEntity);
    expect(de2).to.be.an.instanceof(DevEntity);
    expect(de3).to.be.an.instanceof(DevEntity);
  });
});
