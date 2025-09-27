import { expect } from "chai";
import { describe, it } from "vitest";

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

type CompTypes = FirstComponent | SecondComponent;

describe("Component Collection (internal)", () => {
  it("Can be created", () => {
    const cc = new ComponentCollection<CompTypes>();

    expect(cc).to.be.instanceof(ComponentCollection);
  });
  describe("Instance Methods", () => {
    describe('add', () => {
      it("Class Instance", () => {
        const cc = new ComponentCollection<CompTypes>();
  
        // Adding componenents
        cc.add(new FirstComponent("first-comp"));
        cc.add(new SecondComponent("second-comp"));
  
        const firstComp = cc.get(FirstComponent);
  
        expect(firstComp.id).to.equal("first-comp");
        expect(cc.size).to.equal(2);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.has(SecondComponent)).to.equal(true);
  
        // Replacing a component
        cc.add(new FirstComponent("next-first-comp"));
  
        expect(cc.size).to.equal(2);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.get(FirstComponent).id).to.equal("next-first-comp");
        expect(cc.has(SecondComponent)).to.equal(true);
      });
    });

    it("get", () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent("id"));

      const comp = cc.get(FirstComponent);

      expect(comp.id).to.equal("id");
    });

    it("has", () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent("first"));

      expect(cc.has(FirstComponent)).to.equal(true);
      expect(cc.has(SecondComponent)).to.equal(false);

      cc.add(new SecondComponent("second"));

      expect(cc.has([FirstComponent, SecondComponent])).to.equal(true);

      cc.remove(SecondComponent);

      expect(cc.has([FirstComponent, SecondComponent])).to.equal(false);
    });

    it("hasByName", () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent("first"));

      expect(cc.hasByName(FirstComponent.name)).to.equal(true);
      expect(cc.hasByName(SecondComponent.name)).to.equal(false);

      cc.add(new SecondComponent("second"));

      expect(cc.hasByName([FirstComponent.name, SecondComponent.name])).to.equal(true);

      cc.remove(SecondComponent);

      expect(cc.hasByName([FirstComponent.name, SecondComponent.name])).to.equal(false);
    });

    it("update", () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent("first"));

      cc.update(FirstComponent, (comp) => {
        comp.id = 'second';
        return comp;
      });

      expect(cc.get(FirstComponent).id).to.equal('second');
    });

    it("remove", () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent("first"));
      cc.add(new SecondComponent("second"));

      cc.remove(FirstComponent);

      expect(cc.has(FirstComponent)).to.equal(false);
      expect(cc.has(SecondComponent)).to.equal(true);
    });
  });

  describe('dev', () => {
    it('toDevComponents', () => {
      /* TODO! */
    });
  });
});
