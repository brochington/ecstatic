import { expect } from 'chai';
import { describe, it } from 'vitest';

import { BitSet } from '../src/BitSet';

describe('BitSet', () => {
  describe('constructor', () => {
    it('should create a BitSet with default size of 1', () => {
      const bitSet = new BitSet();
      expect(bitSet.size).to.equal(1);
      expect(bitSet.mask).to.be.instanceof(Uint32Array);
    });

    it('should create a BitSet with custom size', () => {
      const bitSet = new BitSet(5);
      expect(bitSet.size).to.equal(5);
    });
  });

  describe('set & clear', () => {
    it('should set and clear bits correctly', () => {
      const bitSet = new BitSet();
      bitSet.set(0);
      bitSet.set(31);

      expect(bitSet.mask[0]).to.equal(0x80000001); // 2^31 + 2^0

      bitSet.clear(0);
      expect(bitSet.mask[0]).to.equal(0x80000000);
    });

    it('should resize automatically', () => {
      const bitSet = new BitSet(1);
      bitSet.set(100);
      expect(bitSet.mask.length).to.be.greaterThan(3);
      expect(bitSet.mask[3] & (1 << 100 % 32)).to.not.equal(0);
    });
  });

  describe('contains', () => {
    it('should return true if superset', () => {
      const a = new BitSet();
      const b = new BitSet();
      a.set(1);
      a.set(2);
      b.set(1);

      expect(a.contains(b)).to.be.true;
      expect(b.contains(a)).to.be.false;
    });
  });

  describe('intersects', () => {
    it('should return true if any bits overlap', () => {
      const a = new BitSet();
      const b = new BitSet();

      a.set(1);
      a.set(5);
      b.set(5);
      b.set(9);

      expect(a.intersects(b)).to.be.true;
    });

    it('should return false if no bits overlap', () => {
      const a = new BitSet();
      const b = new BitSet();

      a.set(1);
      b.set(2);

      expect(a.intersects(b)).to.be.false;
    });
  });

  describe('equals', () => {
    it('should return true for identical sets', () => {
      const a = new BitSet();
      const b = new BitSet();

      a.set(1);
      a.set(100);
      b.set(1);
      b.set(100);

      expect(a.equals(b)).to.be.true;
    });

    it('should return false for different sets', () => {
      const a = new BitSet();
      const b = new BitSet();

      a.set(1);
      b.set(1);
      b.set(2);

      expect(a.equals(b)).to.be.false;
    });
  });

  describe('count', () => {
    it('should return correct number of set bits', () => {
      const bs = new BitSet();
      expect(bs.count()).to.equal(0);

      bs.set(0);
      bs.set(5);
      bs.set(31);
      expect(bs.count()).to.equal(3);

      bs.set(100);
      expect(bs.count()).to.equal(4);

      bs.clear(5);
      expect(bs.count()).to.equal(3);
    });
  });

  describe('clone', () => {
    it('should create an independent copy', () => {
      const a = new BitSet();
      a.set(5);
      const b = a.clone();

      b.set(6);
      expect(a.count()).to.equal(1);
      expect(b.count()).to.equal(2);
    });
  });
});
