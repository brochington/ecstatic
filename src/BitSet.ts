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
   * Ideally used to check if an Entity (this) has all components required by a System (other).
   */
  contains(other: BitSet): boolean {
    const len = other.mask.length;
    // If the system mask is larger than the entity mask, and the extra bits are set, it can't match.
    // However, we handle resizing on set, so usually entity mask grows larger than system masks.

    for (let i = 0; i < len; i++) {
      const otherChunk = other.mask[i];
      // If other has bits set that this doesn't have:
      if ((this.mask[i] & otherChunk) !== otherChunk) {
        return false;
      }
    }
    return true;
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
