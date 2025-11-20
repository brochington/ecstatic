import { expect } from 'chai';
import { describe, it } from 'vitest';

import { BitSet } from '../src/BitSet';

describe('BitSet', () => {
  describe('constructor', () => {
    it('should create a BitSet with default size of 1', () => {
      const bitSet = new BitSet();

      expect(bitSet.size).to.equal(1);
      expect(bitSet.mask).to.be.instanceof(Uint32Array);
      expect(bitSet.mask.length).to.equal(1);
    });

    it('should create a BitSet with custom size', () => {
      const bitSet = new BitSet(5);

      expect(bitSet.size).to.equal(5);
      expect(bitSet.mask).to.be.instanceof(Uint32Array);
      expect(bitSet.mask.length).to.equal(5);
    });
  });

  describe('set', () => {
    it('should set a bit at index 0', () => {
      const bitSet = new BitSet();

      bitSet.set(0);

      expect(bitSet.mask[0]).to.equal(1);
    });

    it('should set a bit at index 31 (last bit in first 32-bit chunk)', () => {
      const bitSet = new BitSet();

      bitSet.set(31);

      expect(bitSet.mask[0]).to.equal(0x80000000); // 2^31
    });

    it('should set a bit at index 32 (first bit in second 32-bit chunk)', () => {
      const bitSet = new BitSet();

      bitSet.set(32);

      expect(bitSet.mask[0]).to.equal(0);
      expect(bitSet.mask[1]).to.equal(1);
      expect(bitSet.size).to.equal(2);
    });

    it('should automatically resize when setting bits beyond current capacity', () => {
      const bitSet = new BitSet(1);

      bitSet.set(100); // This should trigger resize

      expect(bitSet.size).to.equal(4); // ceil(100/32) = 4
      expect(bitSet.mask.length).to.equal(4);
      expect(bitSet.mask[3]).to.equal(1 << 100 % 32); // Bit 4 in the 4th chunk
    });

    it('should handle multiple bit sets in the same chunk', () => {
      const bitSet = new BitSet();

      bitSet.set(0);
      bitSet.set(1);
      bitSet.set(31);

      expect(bitSet.mask[0]).to.equal(0x80000003); // Bits 0, 1, and 31 set
    });
  });

  describe('clear', () => {
    it('should clear a set bit', () => {
      const bitSet = new BitSet();

      bitSet.set(5);
      expect(bitSet.mask[0]).to.equal(32); // 2^5 = 32

      bitSet.clear(5);
      expect(bitSet.mask[0]).to.equal(0);
    });

    it('should handle clearing a bit that is already clear', () => {
      const bitSet = new BitSet();

      bitSet.clear(10); // Should not error

      expect(bitSet.mask[0]).to.equal(0);
    });

    it('should handle clearing bits beyond current capacity', () => {
      const bitSet = new BitSet(1);

      bitSet.clear(100); // Should not error or resize

      expect(bitSet.size).to.equal(1);
      expect(bitSet.mask.length).to.equal(1);
    });

    it('should clear multiple bits correctly', () => {
      const bitSet = new BitSet();

      bitSet.set(0);
      bitSet.set(1);
      bitSet.set(2);

      bitSet.clear(1);

      expect(bitSet.mask[0]).to.equal(5); // Bits 0 and 2 set (1 + 4)
    });
  });

  describe('contains', () => {
    it('should return true when this BitSet contains all bits from other BitSet', () => {
      const bitSet1 = new BitSet();
      const bitSet2 = new BitSet();

      bitSet1.set(0);
      bitSet1.set(1);
      bitSet1.set(2);

      bitSet2.set(0);
      bitSet2.set(1);

      expect(bitSet1.contains(bitSet2)).to.be.true;
    });

    it('should return false when this BitSet does not contain all bits from other BitSet', () => {
      const bitSet1 = new BitSet();
      const bitSet2 = new BitSet();

      bitSet1.set(0);
      bitSet1.set(1);

      bitSet2.set(0);
      bitSet2.set(2); // bitSet1 doesn't have bit 2

      expect(bitSet1.contains(bitSet2)).to.be.false;
    });

    it('should return false when other BitSet has bits set beyond this BitSet capacity', () => {
      const bitSet1 = new BitSet(1); // Only 32 bits
      const bitSet2 = new BitSet();

      bitSet2.set(100); // Beyond bitSet1's capacity

      expect(bitSet1.contains(bitSet2)).to.be.false;
    });

    it('should return true for empty BitSet containment', () => {
      const bitSet1 = new BitSet();
      const bitSet2 = new BitSet();

      bitSet1.set(0);

      expect(bitSet1.contains(bitSet2)).to.be.true;
    });

    it('should return true when BitSets are identical', () => {
      const bitSet1 = new BitSet();
      const bitSet2 = new BitSet();

      bitSet1.set(0);
      bitSet1.set(5);
      bitSet2.set(0);
      bitSet2.set(5);

      expect(bitSet1.contains(bitSet2)).to.be.true;
    });

    it('should handle BitSets with different sizes', () => {
      const bitSet1 = new BitSet(2); // 64 bits
      const bitSet2 = new BitSet(1); // 32 bits

      bitSet1.set(0); // Both have bit 0 set
      bitSet1.set(40); // bitSet1 also has bit 40 set

      expect(bitSet1.contains(bitSet2)).to.be.true; // bitSet1 has all bits that bitSet2 has
      expect(bitSet2.contains(bitSet1)).to.be.false; // bitSet2 doesn't have bit 40
    });
  });

  describe('toString', () => {
    it('should return string representation of empty BitSet', () => {
      const bitSet = new BitSet();

      expect(bitSet.toString()).to.equal('0');
    });

    it('should return string representation with multiple chunks', () => {
      const bitSet = new BitSet();

      bitSet.set(0);
      bitSet.set(32);

      expect(bitSet.toString()).to.equal('1-1');
    });

    it('should return string representation with complex bit patterns', () => {
      const bitSet = new BitSet();

      bitSet.set(1);
      bitSet.set(5);
      bitSet.set(31);
      bitSet.set(33);

      expect(bitSet.toString()).to.equal('2147483682-2');
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the BitSet', () => {
      const bitSet = new BitSet();

      bitSet.set(0);
      bitSet.set(5);
      bitSet.set(32);

      const clone = bitSet.clone();

      expect(clone).to.be.instanceof(BitSet);
      expect(clone.size).to.equal(bitSet.size);
      expect(clone.mask).to.not.equal(bitSet.mask); // Different array reference
      expect(clone.mask[0]).to.equal(bitSet.mask[0]);
      expect(clone.mask[1]).to.equal(bitSet.mask[1]);
    });

    it('should create independent copies', () => {
      const bitSet = new BitSet();

      bitSet.set(0);

      const clone = bitSet.clone();

      clone.set(1);
      bitSet.clear(0);

      expect(bitSet.mask[0]).to.equal(0);
      expect(clone.mask[0]).to.equal(3); // Has both bit 0 and 1
    });

    it('should clone BitSets with different sizes', () => {
      const bitSet = new BitSet(3);

      bitSet.set(64); // Forces resize

      const clone = bitSet.clone();

      expect(clone.size).to.equal(bitSet.size);
      expect(clone.mask.length).to.equal(bitSet.mask.length);
    });
  });
});
