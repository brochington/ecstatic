import { expect } from 'chai';
import { describe, it } from 'vitest';

import { isComponentInstance } from '../src/guards';

class TestComponent1 {
  value: number;

  constructor(value: number = 0) {
    this.value = value;
  }
}

class TestComponent2 {
  name: string;

  constructor(name: string = 'test') {
    this.name = name;
  }
}

class DerivedComponent extends TestComponent1 {
  extra: string;

  constructor(value: number = 0, extra: string = 'extra') {
    super(value);
    this.extra = extra;
  }
}

describe('guards', () => {
  describe('isComponentInstance', () => {
    it('should return true for instances of the correct class', () => {
      const instance = new TestComponent1(42);

      const result = isComponentInstance(TestComponent1, instance);

      expect(result).to.be.true;
    });

    it('should return false for instances of different classes', () => {
      const instance = new TestComponent2('test');

      const result = isComponentInstance(TestComponent1, instance);

      expect(result).to.be.false;
    });

    it('should return false for null values', () => {
      const result = isComponentInstance(TestComponent1, null);

      expect(result).to.be.false;
    });

    it('should return false for undefined values', () => {
      const result = isComponentInstance(TestComponent1, undefined);

      expect(result).to.be.false;
    });

    it('should return false for primitive values', () => {
      expect(isComponentInstance(TestComponent1, 42)).to.be.false;
      expect(isComponentInstance(TestComponent1, 'string')).to.be.false;
      expect(isComponentInstance(TestComponent1, true)).to.be.false;
      expect(isComponentInstance(TestComponent1, Symbol())).to.be.false;
    });

    it('should return false for plain objects', () => {
      const plainObject = { value: 42 };

      const result = isComponentInstance(TestComponent1, plainObject);

      expect(result).to.be.false;
    });

    it('should return false for arrays', () => {
      const array = [1, 2, 3];

      const result = isComponentInstance(TestComponent1, array);

      expect(result).to.be.false;
    });

    it('should return true for instances of derived classes when checking base class', () => {
      const derivedInstance = new DerivedComponent(100, 'test');

      const result = isComponentInstance(TestComponent1, derivedInstance);

      expect(result).to.be.true;
    });

    it('should return false for base class instances when checking derived class', () => {
      const baseInstance = new TestComponent1(50);

      const result = isComponentInstance(DerivedComponent, baseInstance);

      expect(result).to.be.false;
    });

    it('should work with anonymous classes', () => {
      const AnonComponent = class {
        data: string;
        constructor(data: string) {
          this.data = data;
        }
      };

      const instance = new AnonComponent('test');

      expect(isComponentInstance(AnonComponent, instance)).to.be.true;
      expect(isComponentInstance(TestComponent1, instance)).to.be.false;
    });

    it('should work with ES6 class syntax', () => {
      class ES6Component {
        id: number;
        constructor(id: number) {
          this.id = id;
        }
      }

      const instance = new ES6Component(123);

      expect(isComponentInstance(ES6Component, instance)).to.be.true;
    });

    // Type guard functionality tests (compile-time type narrowing)
    it('should enable TypeScript type narrowing', () => {
      const components: unknown[] = [
        new TestComponent1(1),
        new TestComponent2('test'),
        null,
        42,
      ];

      const validComponents = components.filter(
        (comp): comp is TestComponent1 => {
          return isComponentInstance(TestComponent1, comp);
        }
      );

      expect(validComponents).to.have.length(1);
      expect(validComponents[0]).to.be.instanceof(TestComponent1);
      expect(validComponents[0].value).to.equal(1);
    });

    it('should handle multiple component types in a collection', () => {
      const mixedComponents: unknown[] = [
        new TestComponent1(10),
        new TestComponent2('hello'),
        new TestComponent1(20),
        'not a component',
      ];

      const component1s = mixedComponents.filter(
        (comp): comp is TestComponent1 => {
          return isComponentInstance(TestComponent1, comp);
        }
      );

      const component2s = mixedComponents.filter(
        (comp): comp is TestComponent2 => {
          return isComponentInstance(TestComponent2, comp);
        }
      );

      expect(component1s).to.have.length(2);
      expect(component2s).to.have.length(1);

      component1s.forEach(comp => {
        expect(comp).to.be.instanceof(TestComponent1);
      });

      component2s.forEach(comp => {
        expect(comp).to.be.instanceof(TestComponent2);
      });
    });
  });
});
