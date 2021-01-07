import { expect } from "chai";
import DevTools from "../src/DevTools";
import World from "../src/World";
import { createSystem } from "../src/System";
import noop from "lodash/noop";

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

type CompTypes = typeof FirstComponent | typeof SecondComponent;

function firstSystem() { /* */ }
function secondSystem() { /* */ }
function thirdSystem() { /* */ }

describe("DevTools", () => {
  it("exits", () => {
    const testWorld = new World<CompTypes>();

    expect(testWorld.dev).to.be.an.instanceof(DevTools);
  });

  it("logSystemCompTable", () => {
    const testWorld = new World<CompTypes>();

    createSystem(testWorld, [FirstComponent], firstSystem);
    createSystem(testWorld, [SecondComponent], secondSystem);
    createSystem(
      testWorld,
      [FirstComponent, SecondComponent],
      thirdSystem
    );

    testWorld.dev.logSystemCompTable();

    console.log(testWorld.dev.entities);
  });
});
