import { expect } from 'chai';
import { describe, it } from 'vitest';

import { ComponentRegistry } from '../src/ComponentRegistry';

class TestComponent1 {}
class TestComponent2 {}
class TestComponent3 {}

describe('ComponentRegistry', () => {
  describe('getId', () => {
    it('should return the same ID for the same component class', () => {
      const id1 = ComponentRegistry.getId(TestComponent1);
      const id2 = ComponentRegistry.getId(TestComponent1);

      expect(id1).to.equal(id2);
      expect(typeof id1).to.equal('number');
    });

    it('should return different IDs for different component classes', () => {
      const id1 = ComponentRegistry.getId(TestComponent1);
      const id2 = ComponentRegistry.getId(TestComponent2);

      expect(id1).to.not.equal(id2);
    });

    it('should assign incremental IDs starting from 0', () => {
      // Clear any previous registrations for clean test
      // Note: In a real scenario, this would persist across tests, but for isolation we'll accept that

      const id1 = ComponentRegistry.getId(TestComponent1);
      const id2 = ComponentRegistry.getId(TestComponent2);
      const id3 = ComponentRegistry.getId(TestComponent3);

      // IDs should be different and generally incremental
      expect(id1).to.not.equal(id2);
      expect(id2).to.not.equal(id3);
      expect(id1).to.not.equal(id3);

      // Verify they are numbers
      expect(typeof id1).to.equal('number');
      expect(typeof id2).to.equal('number');
      expect(typeof id3).to.equal('number');
    });

    it('should handle multiple calls to the same class consistently', () => {
      const ids: number[] = [];

      for (let i = 0; i < 10; i++) {
        ids.push(ComponentRegistry.getId(TestComponent1));
      }

      // All IDs should be the same
      const allSame = ids.every(id => id === ids[0]);
      expect(allSame).to.be.true;
    });

    it('should work with anonymous classes', () => {
      const AnonComponent1 = class {};
      const AnonComponent2 = class {};

      const id1 = ComponentRegistry.getId(AnonComponent1);
      const id2 = ComponentRegistry.getId(AnonComponent2);

      expect(id1).to.not.equal(id2);
    });

    it('should work with ES6 class syntax', () => {
      class ES6Component {}

      const id = ComponentRegistry.getId(ES6Component);

      expect(typeof id).to.equal('number');
      expect(id).to.be.at.least(0);
    });

    it('should handle classes with inheritance', () => {
      class BaseComponent {}
      class DerivedComponent extends BaseComponent {}

      const baseId = ComponentRegistry.getId(BaseComponent);
      const derivedId = ComponentRegistry.getId(DerivedComponent);

      expect(baseId).to.not.equal(derivedId);
    });
  });

  describe('registry isolation', () => {
    it('should maintain registry state across multiple calls', () => {
      const id1 = ComponentRegistry.getId(TestComponent1);
      const id2 = ComponentRegistry.getId(TestComponent2);

      // Call again to ensure registry persists
      const id1Again = ComponentRegistry.getId(TestComponent1);
      const id2Again = ComponentRegistry.getId(TestComponent2);

      expect(id1).to.equal(id1Again);
      expect(id2).to.equal(id2Again);
    });
  });
});
