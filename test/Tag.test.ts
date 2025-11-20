import { expect } from 'chai';
import { describe, it } from 'vitest';

import { Tag } from '../src/Tag';
import World from '../src/World';

class TestComponent {
  value: number = 0;
}

type TestComponents = TestComponent;

// Test that the Tag type works correctly in practice
describe('Tag', () => {
  it('should allow string tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const stringTag: Tag = 'player';

    entity.addTag(stringTag);
    expect(entity.hasTag(stringTag)).to.be.true;
    expect(entity.hasTag('player')).to.be.true;
  });

  it('should allow number tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const numberTag: Tag = 42;

    entity.addTag(numberTag);
    expect(entity.hasTag(numberTag)).to.be.true;
    expect(entity.hasTag(42)).to.be.true;
  });

  it('should distinguish between string and number tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    entity.addTag('42'); // string
    entity.addTag(42); // number

    expect(entity.hasTag('42')).to.be.true;
    expect(entity.hasTag(42)).to.be.true;
    expect(entity.tags.size).to.equal(2);
  });

  it('should work with tag operations', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const tags: Tag[] = ['player', 'enemy', 1, 2, 'special'];

    // Add all tags
    tags.forEach(tag => entity.addTag(tag));

    // Check all tags exist
    tags.forEach(tag => {
      expect(entity.hasTag(tag)).to.be.true;
    });

    // Remove some tags
    entity.removeTag('enemy');
    entity.removeTag(2);

    expect(entity.hasTag('enemy')).to.be.false;
    expect(entity.hasTag(2)).to.be.false;
    expect(entity.hasTag('player')).to.be.true;
    expect(entity.hasTag(1)).to.be.true;
    expect(entity.hasTag('special')).to.be.true;
  });

  it('should work with tag iteration', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const expectedTags: Tag[] = ['tag1', 100, 'tag2'];

    expectedTags.forEach(tag => entity.addTag(tag));

    const actualTags = Array.from(entity.tags);
    expect(actualTags).to.have.length(expectedTags.length);

    expectedTags.forEach(expectedTag => {
      expect(actualTags).to.include(expectedTag);
    });
  });

  it('should work with clearTags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    entity.addTag('tag1');
    entity.addTag(42);
    entity.addTag('tag2');

    expect(entity.tags.size).to.equal(3);

    entity.clearTags();

    expect(entity.tags.size).to.equal(0);
    expect(entity.hasTag('tag1')).to.be.false;
    expect(entity.hasTag(42)).to.be.false;
    expect(entity.hasTag('tag2')).to.be.false;
  });

  it('should handle empty string tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const emptyStringTag: Tag = '';

    entity.addTag(emptyStringTag);
    expect(entity.hasTag(emptyStringTag)).to.be.true;
    expect(entity.hasTag('')).to.be.true;
  });

  it('should handle zero number tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const zeroTag: Tag = 0;

    entity.addTag(zeroTag);
    expect(entity.hasTag(zeroTag)).to.be.true;
    expect(entity.hasTag(0)).to.be.true;
  });

  it('should handle negative number tags', () => {
    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const negativeTag: Tag = -5;

    entity.addTag(negativeTag);
    expect(entity.hasTag(negativeTag)).to.be.true;
    expect(entity.hasTag(-5)).to.be.true;
  });

  it('should work with Symbol as Tag (TypeScript restricts but runtime allows)', () => {
    // Note: The Tag type is defined as string | number, but JavaScript allows
    // other types like Symbol in Maps/Sets. This test documents the runtime behavior.

    const world = new World<TestComponents>();
    const entity = world.createEntity();

    const symbolTag = Symbol('test');

    // TypeScript will show an error, but runtime allows it
    entity.addTag(symbolTag as any);

    expect(entity.hasTag(symbolTag as any)).to.be.true;
    expect(entity.tags.size).to.equal(1);
    expect(Array.from(entity.tags)).to.deep.equal([symbolTag]);
  });
});
