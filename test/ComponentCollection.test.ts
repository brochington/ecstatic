import { expect } from 'chai';
import { describe, it } from 'vitest';

import ComponentCollection from '../src/ComponentCollection';

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

describe('Component Collection (internal)', () => {
  it('Can be created', () => {
    const cc = new ComponentCollection<CompTypes>();

    expect(cc).to.be.instanceof(ComponentCollection);
  });
  describe('Instance Methods', () => {
    describe('add', () => {
      it('Class Instance', () => {
        const cc = new ComponentCollection<CompTypes>();

        // Adding componenents
        cc.add(new FirstComponent('first-comp'));
        cc.add(new SecondComponent('second-comp'));

        const firstComp = cc.get(FirstComponent);

        expect(firstComp.id).to.equal('first-comp');
        expect(cc.size).to.equal(2);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.has(SecondComponent)).to.equal(true);

        // Replacing a component
        cc.add(new FirstComponent('next-first-comp'));

        expect(cc.size).to.equal(2);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.get(FirstComponent).id).to.equal('next-first-comp');
        expect(cc.has(SecondComponent)).to.equal(true);
      });
    });

    it('get', () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent('id'));

      const comp = cc.get(FirstComponent);

      expect(comp.id).to.equal('id');
    });

    it('has', () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent('first'));

      expect(cc.has(FirstComponent)).to.equal(true);
      expect(cc.has(SecondComponent)).to.equal(false);

      cc.add(new SecondComponent('second'));

      expect(cc.has([FirstComponent, SecondComponent])).to.equal(true);

      cc.remove(SecondComponent);

      expect(cc.has([FirstComponent, SecondComponent])).to.equal(false);
    });

    it('hasByName', () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent('first'));

      expect(cc.hasByName(FirstComponent.name)).to.equal(true);
      expect(cc.hasByName(SecondComponent.name)).to.equal(false);

      cc.add(new SecondComponent('second'));

      expect(
        cc.hasByName([FirstComponent.name, SecondComponent.name])
      ).to.equal(true);

      cc.remove(SecondComponent);

      expect(
        cc.hasByName([FirstComponent.name, SecondComponent.name])
      ).to.equal(false);
    });

    it('update', () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent('first'));

      cc.update(FirstComponent, comp => {
        comp.id = 'second';
        return comp;
      });

      expect(cc.get(FirstComponent).id).to.equal('second');
    });

    it('remove', () => {
      const cc = new ComponentCollection<CompTypes>();

      cc.add(new FirstComponent('first'));
      cc.add(new SecondComponent('second'));

      cc.remove(FirstComponent);

      expect(cc.has(FirstComponent)).to.equal(false);
      expect(cc.has(SecondComponent)).to.equal(true);
    });
  });

  describe('iteration', () => {
    it('supports for...of iteration', () => {
      const cc = new ComponentCollection<CompTypes>();
      const firstComp = new FirstComponent('first');
      const secondComp = new SecondComponent('second');

      cc.add(firstComp);
      cc.add(secondComp);

      const iteratedComponents: CompTypes[] = [];
      for (const comp of cc) {
        iteratedComponents.push(comp);
      }

      expect(iteratedComponents).to.have.length(2);
      expect(iteratedComponents).to.include(firstComp);
      expect(iteratedComponents).to.include(secondComp);
    });

    it('supports Array.from conversion', () => {
      const cc = new ComponentCollection<CompTypes>();
      const firstComp = new FirstComponent('first');
      const secondComp = new SecondComponent('second');

      cc.add(firstComp);
      cc.add(secondComp);

      const componentsArray = Array.from(cc);

      expect(componentsArray).to.have.length(2);
      expect(componentsArray).to.include(firstComp);
      expect(componentsArray).to.include(secondComp);
    });

    it('supports spreading', () => {
      const cc = new ComponentCollection<CompTypes>();
      const firstComp = new FirstComponent('first');
      const secondComp = new SecondComponent('second');

      cc.add(firstComp);
      cc.add(secondComp);

      const componentsArray = [...cc];

      expect(componentsArray).to.have.length(2);
      expect(componentsArray).to.include(firstComp);
      expect(componentsArray).to.include(secondComp);
    });

    it('supports array methods via Array.from', () => {
      const cc = new ComponentCollection<CompTypes>();
      const firstComp = new FirstComponent('first');
      const secondComp = new SecondComponent('second');

      cc.add(firstComp);
      cc.add(secondComp);

      // Test forEach
      const forEachResults: string[] = [];
      Array.from(cc).forEach(comp => {
        if (comp instanceof FirstComponent) {
          forEachResults.push(comp.id);
        } else if (comp instanceof SecondComponent) {
          forEachResults.push(comp.otherId);
        }
      });
      expect(forEachResults).to.deep.equal(['first', 'second']);

      // Test map
      const ids = Array.from(cc).map(comp =>
        comp instanceof FirstComponent ? comp.id : comp.otherId
      );
      expect(ids).to.deep.equal(['first', 'second']);

      // Test filter
      const firstComponents = Array.from(cc).filter(comp => comp instanceof FirstComponent);
      expect(firstComponents).to.have.length(1);
      expect(firstComponents[0]).to.equal(firstComp);
    });
  });

  describe('dev', () => {
    it('toDevComponents', () => {
      const cc = new ComponentCollection<CompTypes>();
      const firstComp = new FirstComponent('first');
      const secondComp = new SecondComponent('second');

      cc.add(firstComp);
      cc.add(secondComp);

      const devComponents = cc.toDevComponents();

      expect(devComponents).to.have.property('FirstComponent', firstComp);
      expect(devComponents).to.have.property('SecondComponent', secondComp);
    });
  });
});
