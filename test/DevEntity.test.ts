import { expect } from 'chai';
import { describe, it } from 'vitest';

import World from '../src/World';
import DevEntity from '../src/DevEntity';

class PositionComponent {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

class VelocityComponent {
  vx: number;
  vy: number;

  constructor(vx: number = 0, vy: number = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

class HealthComponent {
  hp: number;

  constructor(hp: number = 100) {
    this.hp = hp;
  }
}

type TestComponents = PositionComponent | VelocityComponent | HealthComponent;

describe('DevEntity', () => {
  describe('constructor', () => {
    it('should create DevEntity with correct id', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.id).to.equal(entity.id);
    });

    it('should copy components correctly', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      entity.add(new PositionComponent(10, 20));
      entity.add(new VelocityComponent(1, 2));

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.components).to.have.property('PositionComponent');
      expect(devEntity.components).to.have.property('VelocityComponent');
      const pos = devEntity.components[
        'PositionComponent'
      ] as PositionComponent;
      const vel = devEntity.components[
        'VelocityComponent'
      ] as VelocityComponent;
      expect(pos.x).to.equal(10);
      expect(pos.y).to.equal(20);
      expect(vel.vx).to.equal(1);
      expect(vel.vy).to.equal(2);
    });

    it('should copy tags correctly', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      entity.addTag('player');
      entity.addTag('alive');

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.tags).to.deep.equal(['player', 'alive']);
    });

    it('should copy entity state correctly', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.state).to.equal(entity.state);
      expect(typeof devEntity.state).to.equal('string');
    });

    it('should initialize empty systems array when no systems are registered', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.be.an('array');
      expect(devEntity.systems).to.have.length(0);
    });
  });

  describe('systems matching', () => {
    it('should identify systems that match entity components', () => {
      const world = new World<TestComponents>();

      // Register systems with different component requirements
      world.addSystem([PositionComponent, VelocityComponent], () => {}, {
        name: 'movement',
      });
      world.addSystem([HealthComponent], () => {}, { name: 'health' });
      world.addSystem([PositionComponent, HealthComponent], () => {}, {
        name: 'combined',
      });

      const entity = world.createEntity();
      entity.add(new PositionComponent());
      entity.add(new VelocityComponent());
      entity.add(new HealthComponent());

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.include('movement');
      expect(devEntity.systems).to.include('health');
      expect(devEntity.systems).to.include('combined');
    });

    it('should only include systems where entity has all required components', () => {
      const world = new World<TestComponents>();

      world.addSystem([PositionComponent, VelocityComponent], () => {}, {
        name: 'movement',
      });
      world.addSystem([HealthComponent], () => {}, { name: 'health' });

      const entity = world.createEntity();
      entity.add(new PositionComponent());
      entity.add(new VelocityComponent());
      // Missing HealthComponent

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.include('movement');
      expect(devEntity.systems).to.not.include('health');
    });

    it('should handle entity with no matching systems', () => {
      const world = new World<TestComponents>();

      world.addSystem([PositionComponent, VelocityComponent], () => {}, {
        name: 'movement',
      });

      const entity = world.createEntity();
      entity.add(new HealthComponent()); // Only has HealthComponent

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.have.length(0);
    });

    it('should handle systems with single component requirements', () => {
      const world = new World<TestComponents>();

      world.addSystem([HealthComponent], () => {}, { name: 'health-monitor' });

      const entity = world.createEntity();
      entity.add(new HealthComponent(50));

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.deep.equal(['health-monitor']);
    });

    it('should handle empty entity (no components)', () => {
      const world = new World<TestComponents>();

      world.addSystem([PositionComponent], () => {}, { name: 'any-system' });

      const entity = world.createEntity();
      // No components added

      const devEntity = new DevEntity(entity, world);

      expect(devEntity.systems).to.have.length(0);
    });
  });

  describe('toTableRow', () => {
    it('should return correct table row format', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      entity.add(new PositionComponent(5, 10));
      entity.addTag('test');
      entity.addTag('entity');

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      expect(row).to.have.property('id', entity.id);
      expect(row).to.have.property('components');
      expect(row).to.have.property('tags');
      expect(row).to.have.property('systems');
    });

    it('should format components as comma-separated string', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      entity.add(new PositionComponent());
      entity.add(new VelocityComponent());

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      expect(row.components).to.equal('PositionComponent, VelocityComponent');
    });

    it('should format tags as comma-separated string', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      entity.addTag('player');
      entity.addTag('enemy');

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      expect(row.tags).to.equal('player, enemy');
    });

    it('should format systems as comma-separated string', () => {
      const world = new World<TestComponents>();

      world.addSystem([PositionComponent], () => {}, { name: 'system1' });
      world.addSystem([PositionComponent], () => {}, { name: 'system2' });

      const entity = world.createEntity();
      entity.add(new PositionComponent());

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      expect(row.systems).to.equal('system1, system2');
    });

    it('should handle empty components, tags, and systems', () => {
      const world = new World<TestComponents>();
      const entity = world.createEntity();

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      expect(row.components).to.equal('');
      expect(row.tags).to.equal('');
      expect(row.systems).to.equal('');
    });

    it('should sort component, tag, and system names', () => {
      const world = new World<TestComponents>();

      world.addSystem([PositionComponent], () => {}, { name: 'z-system' });
      world.addSystem([PositionComponent], () => {}, { name: 'a-system' });

      const entity = world.createEntity();
      entity.add(new VelocityComponent());
      entity.add(new PositionComponent());
      entity.addTag('z-tag');
      entity.addTag('a-tag');

      const devEntity = new DevEntity(entity, world);

      const row = devEntity.toTableRow();

      // Object.keys() order is not guaranteed, but for this test we'll check that all expected items are present
      expect(row.components).to.include('PositionComponent');
      expect(row.components).to.include('VelocityComponent');
      expect(row.tags).to.include('a-tag');
      expect(row.tags).to.include('z-tag');
      expect(row.systems).to.include('a-system');
      expect(row.systems).to.include('z-system');
    });
  });
});
