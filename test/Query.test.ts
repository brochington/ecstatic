import { expect } from 'chai';
import { describe, it, beforeEach } from 'vitest';

import World from '../src/World';

// Components
class Pos {
  x = 0;
}
class Vel {
  x = 0;
}
class Health {
  hp = 100;
}
class TagA {}
class TagB {}

type CompTypes = Pos | Vel | Health | TagA | TagB;

describe('Query', () => {
  let world: World<CompTypes>;

  beforeEach(() => {
    world = new World<CompTypes>();
  });

  describe('Configuration', () => {
    it('matches ALL (intersection)', () => {
      const q = world.query({ all: [Pos, Vel] });

      const e1 = world.createEntity().add(new Pos()).add(new Vel());
      const e2 = world.createEntity().add(new Pos()); // Missing Vel
      const e3 = world
        .createEntity()
        .add(new Pos())
        .add(new Vel())
        .add(new Health()); // Extra is fine

      expect(q.match(e1)).to.be.true;
      expect(q.match(e2)).to.be.false;
      expect(q.match(e3)).to.be.true;
    });

    it('matches ANY (union)', () => {
      const q = world.query({ any: [Pos, Vel] });

      const e1 = world.createEntity().add(new Pos());
      const e2 = world.createEntity().add(new Vel());
      const e3 = world.createEntity().add(new Health()); // Neither

      expect(q.match(e1)).to.be.true;
      expect(q.match(e2)).to.be.true;
      expect(q.match(e3)).to.be.false;
    });

    it('matches NONE (exclusion)', () => {
      const q = world.query({ all: [Pos], none: [Health] });

      const e1 = world.createEntity().add(new Pos());
      const e2 = world.createEntity().add(new Pos()).add(new Health());

      expect(q.match(e1)).to.be.true;
      expect(q.match(e2)).to.be.false;
    });

    it('matches ONLY / SAME (exact equality)', () => {
      const q = world.query({ only: [Pos, Vel] });

      const e1 = world.createEntity().add(new Pos()).add(new Vel());
      const e2 = world.createEntity().add(new Pos()); // Not enough
      const e3 = world
        .createEntity()
        .add(new Pos())
        .add(new Vel())
        .add(new Health()); // Too many

      expect(q.match(e1)).to.be.true;
      expect(q.match(e2)).to.be.false;
      expect(q.match(e3)).to.be.false;
    });

    it('matches DIFFERENT (inequality)', () => {
      const q = world.query({ different: [Pos] });

      const e1 = world.createEntity().add(new Pos()); // Exactly Pos
      const e2 = world.createEntity().add(new Pos()).add(new Vel()); // Diff
      const e3 = world.createEntity(); // Empty is different than Pos

      expect(q.match(e1)).to.be.false;
      expect(q.match(e2)).to.be.true;
      expect(q.match(e3)).to.be.true;
    });

    it('matches MIN (at least)', () => {
      const q = world.query({ min: 2 });

      const e1 = world.createEntity().add(new Pos());
      const e2 = world.createEntity().add(new Pos()).add(new Vel());
      const e3 = world
        .createEntity()
        .add(new Pos())
        .add(new Vel())
        .add(new Health());

      expect(q.match(e1)).to.be.false;
      expect(q.match(e2)).to.be.true;
      expect(q.match(e3)).to.be.true;
    });

    it('matches MAX (at most)', () => {
      const q = world.query({ max: 1 });

      const e1 = world.createEntity().add(new Pos());
      const e2 = world.createEntity().add(new Pos()).add(new Vel());

      expect(q.match(e1)).to.be.true;
      expect(q.match(e2)).to.be.false;
    });
  });

  describe('Reactivity', () => {
    it('updates automatically when components are added', () => {
      const q = world.query({ all: [Pos] });
      const entity = world.createEntity();

      expect(q.size).to.equal(0);

      entity.add(new Pos());
      expect(q.size).to.equal(1);
      expect(q.get()[0]).to.equal(entity);
    });

    it('updates automatically when components are removed', () => {
      const q = world.query({ all: [Pos] });
      const entity = world.createEntity().add(new Pos());

      expect(q.size).to.equal(1);

      entity.remove(Pos);
      expect(q.size).to.equal(0);
    });

    it('handles universal queries (min/max) updates', () => {
      const q = world.query({ min: 2 });
      const entity = world.createEntity().add(new Pos());

      expect(q.size).to.equal(0);

      entity.add(new Vel());
      expect(q.size).to.equal(1); // Now has 2

      entity.remove(Pos);
      expect(q.size).to.equal(0); // Back to 1
    });

    it('handles destruction', () => {
      const q = world.query({ all: [Pos] });
      const entity = world.createEntity().add(new Pos());

      expect(q.size).to.equal(1);

      entity.destroyImmediately();
      expect(q.size).to.equal(0);
    });
  });

  describe('Iteration', () => {
    it('is iterable', () => {
      const q = world.query({ all: [Pos] });
      world.createEntity().add(new Pos());
      world.createEntity().add(new Pos());

      let count = 0;
      for (const e of q) {
        expect(e.has(Pos)).to.be.true;
        count++;
      }
      expect(count).to.equal(2);
    });

    it('get() returns array', () => {
      const q = world.query({ all: [Pos] });
      world.createEntity().add(new Pos());

      const arr = q.get();
      expect(Array.isArray(arr)).to.be.true;
      expect(arr.length).to.equal(1);
    });

    it('first() returns first match or null', () => {
      const q = world.query({ all: [Pos] });
      expect(q.first()).to.be.null;

      const e = world.createEntity().add(new Pos());
      expect(q.first()).to.equal(e);
    });
  });
});
