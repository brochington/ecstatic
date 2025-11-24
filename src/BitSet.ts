export class BitSet {
  mask: Uint32Array;
  size: number;

  constructor(size: number = 1) {
    this.size = size;
    this.mask = new Uint32Array(size);
  }

  /**
   * Sets the bit at the given index to 1.
   * Automatically resizes if the index is out of bounds.
   */
  set(index: number): void {
    const elementIndex = Math.floor(index / 32);
    const bitIndex = index % 32;

    if (elementIndex >= this.mask.length) {
      this.resize(elementIndex + 1);
    }

    this.mask[elementIndex] |= 1 << bitIndex;
  }

  /**
   * Sets the bit at the given index to 0.
   */
  clear(index: number): void {
    const elementIndex = Math.floor(index / 32);
    const bitIndex = index % 32;

    if (elementIndex < this.mask.length) {
      this.mask[elementIndex] &= ~(1 << bitIndex);
    }
  }

  /**
   * Resizes the underlying array to the new size.
   */
  private resize(newSize: number): void {
    const newMask = new Uint32Array(newSize);
    newMask.set(this.mask);
    this.mask = newMask;
    this.size = newSize;
  }

  /**
   * Checks if this BitSet contains all bits set in the other BitSet.
   * Used for 'All' checks.
   */
  contains(other: BitSet): boolean {
    const len = other.mask.length;
    for (let i = 0; i < len; i++) {
      const otherChunk = other.mask[i];
      if ((this.mask[i] & otherChunk) !== otherChunk) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if this BitSet shares ANY bits with the other BitSet.
   * Used for 'Any'/'Some' checks.
   */
  intersects(other: BitSet): boolean {
    const len = Math.min(this.mask.length, other.mask.length);
    for (let i = 0; i < len; i++) {
      if ((this.mask[i] & other.mask[i]) !== 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if this BitSet is exactly equal to the other BitSet.
   * Used for 'Only'/'Same' checks.
   */
  equals(other: BitSet): boolean {
    const len = Math.max(this.mask.length, other.mask.length);
    for (let i = 0; i < len; i++) {
      const a = this.mask[i] || 0;
      const b = other.mask[i] || 0;
      if (a !== b) return false;
    }
    return true;
  }

  /**
   * Returns the total number of bits set to 1.
   * Uses SWAR algorithm for 32-bit integers.
   */
  count(): number {
    let count = 0;
    const len = this.mask.length;
    for (let i = 0; i < len; i++) {
      let n = this.mask[i];
      n = n - ((n >>> 1) & 0x55555555);
      n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
      count += (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
    }
    return count;
  }

  /**
   * Generates a unique string key for Map lookups.
   */
  toString(): string {
    return this.mask.join('-');
  }

  /**
   * Creates a copy of the BitSet.
   */
  clone(): BitSet {
    const clone = new BitSet(this.size);
    clone.mask.set(this.mask);
    return clone;
  }
}
