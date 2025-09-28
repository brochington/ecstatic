import { expect } from 'chai';
import noop from 'lodash/noop';
import { describe, it } from 'vitest';

import World from '../src/World';
import Entity from '../src/Entity';
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

describe('World', () => {
  it('exists', () => {
    const testWorld = new World<CompTypes>();

    expect(testWorld).to.be.instanceof(World);
  });

  describe('instance methods', () => {
    describe('registerSystems', () => {
      it('set correct content in the world instance.', () => {
        const testWorld = new World<CompTypes>();
        const cTypes = [FirstComponent];

        testWorld.addSystem(cTypes, noop);

        const t = [...testWorld.entitiesByCTypes.entries()];

        expect(testWorld.entitiesByCTypes.size).to.equal(1);
        // @ts-ignore
        expect(t[0][0].includes(FirstComponent.name)).to.equal(true);
        expect(t[0][1]).to.be.instanceof(Set);
      });
    });
    describe('registerEntity', () => {
      it('creates ComponentCollection at correct entityId location in entities map', () => {
        const testWorld = new World<CompTypes>();

        const entity = testWorld.createEntity();

        entity.add(new FirstComponent('test-comp-1'));

        const cc = testWorld.componentCollections.get(
          entity.id
        ) as ComponentCollection<CompTypes>;

        expect(cc.size).to.equal(1);

        expect(testWorld.entities.has(entity.id)).to.equal(true);
        expect(testWorld.entities.get(entity.id)).to.be.instanceof(Entity);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.has([FirstComponent, SecondComponent])).to.equal(false);
        expect(cc.get(FirstComponent).id).to.equal('test-comp-1');
      });
    });

    describe('find', () => {
      it('finds correct entity', () => {
        const world = new World<CompTypes>();

        const entity1 = world.createEntity().add(new FirstComponent('a'));

        world.createEntity().add(new FirstComponent('b'));

        const foundEntity = world.find(entity => {
          const comp = entity.components.get(FirstComponent);
          return comp.id === 'a';
        });

        expect(foundEntity).to.be.instanceof(Entity);
        expect(foundEntity?.id).to.equal(entity1.id);
      });
    });

    describe('findAll', () => {
      it('finds all filtered entities', () => {
        const world = new World<CompTypes>();

        const entity1 = world.createEntity().add(new FirstComponent('a'));
        const entity2 = world.createEntity().add(new FirstComponent('a'));
        const entity3 = world.createEntity().add(new FirstComponent('b'));
        world.createEntity().add(new SecondComponent('c'));

        const foundEntities = world.findAll(entity => {
          if (entity.components.has(FirstComponent)) {
            const comp = entity.components.get(FirstComponent);

            return comp.id === 'a';
          }

          return false;
        });

        expect(foundEntities.length).to.equal(2);
        expect(foundEntities.includes(entity1)).to.equal(true);
        expect(foundEntities.includes(entity2)).to.equal(true);
        expect(foundEntities.includes(entity3)).to.equal(false);
      });
    });

    it('locate', () => {
      const world = new World<CompTypes>();

      world.addSystem([FirstComponent], noop);

      const entity1 = world.createEntity().add(new FirstComponent('a'));
      world.createEntity().add(new FirstComponent('b'));
      world.createEntity().add(new FirstComponent('c'));

      const l = world.locate(FirstComponent);

      expect(l?.id).to.equal(entity1.id);
    });

    it('grab', () => {
      const world = new World<CompTypes>();

      world.addSystem([FirstComponent], noop);

      expect(world.grab(FirstComponent)).to.equal(null);

      const entity1 = world.createEntity().add(new FirstComponent('a'));
      world.createEntity().add(new FirstComponent('b'));
      world.createEntity().add(new FirstComponent('c'));

      const { entity, component } = world.grab(FirstComponent) as {
        entity: Entity<CompTypes>;
        component: FirstComponent;
      };

      expect(entity.id).to.equal(entity1.id);
      expect(component.id).to.equal('a');
    });

    it('grabBy', () => {
      const world = new World<CompTypes>();

      const pred = (comp: FirstComponent) => {
        return comp.id === 'b';
      };

      world.addSystem([FirstComponent], noop);

      expect(world.grabBy(FirstComponent, pred)).to.equal(null);

      world.createEntity().add(new FirstComponent('a'));
      const entity2 = world.createEntity().add(new FirstComponent('b'));
      world.createEntity().add(new FirstComponent('c'));

      const { entity, component } = world.grabBy(FirstComponent, pred) as {
        entity: Entity<CompTypes>;
        component: FirstComponent;
      };

      expect(entity.id).to.equal(entity2.id);
      expect(component.id).to.equal('b');
    });

    it('grabAll', () => {
      const world = new World<CompTypes>();

      world.addSystem([FirstComponent], noop);

      expect(world.grabAll(FirstComponent).length).to.equal(0);

      const entity1 = world.createEntity().add(new FirstComponent('a'));
      const entity2 = world.createEntity().add(new FirstComponent('b'));
      const entity3 = world.createEntity().add(new FirstComponent('c'));

      const [first, second, third] = world.grabAll(FirstComponent);

      expect(first.entity.id).to.equal(entity1.id);
      expect(first.component.id).to.equal('a');

      expect(second.entity.id).to.equal(entity2.id);
      expect(second.component.id).to.equal('b');

      expect(third.entity.id).to.equal(entity3.id);
      expect(third.component.id).to.equal('c');
    });

    it('get', () => {
      const world = new World<CompTypes>();

      world.addSystem([FirstComponent], noop);

      const entity1 = world.createEntity().add(new FirstComponent('a'));

      const comp = world.get(entity1.id, FirstComponent);

      expect(comp.id).to.equal('a');
    });

    describe('getComponent', () => {
      it('getComponent no default value', () => {
        const world = new World<CompTypes>();

        world.createEntity().add(new FirstComponent('a'));

        const comp1 = world.getComponent(FirstComponent);
        const comp2 = world.getComponent(SecondComponent);

        expect(comp1?.id).to.equal('a');
        expect(comp2).to.equal(null);
      });

      it('getComponent with default value', () => {
        const world = new World<CompTypes>();

        const comp1 = world.getComponent(
          FirstComponent,
          new FirstComponent('b')
        );

        expect(comp1?.id).to.equal('b');
      });
    });

    describe('set', () => {
      it('sets component in the correct entityId, and updates entitiesByCType', () => {
        const testWorld = new World<CompTypes>();

        const entity = testWorld.createEntity();

        const component = new FirstComponent('test-comp-1');

        testWorld.add(entity.id, component);

        const cc = testWorld.componentCollections.get(
          entity.id
        ) as ComponentCollection<CompTypes>;

        expect(cc).to.be.instanceof(ComponentCollection);
        expect(cc.has(FirstComponent)).to.equal(true);
        expect(cc.size).to.equal(1);

        for (const [key, val] of testWorld.entitiesByCTypes.entries()) {
          expect(key[0]).to.equal('FirstComponent');
          expect(val.has(entity.id)).to.equal(true);
        }
      });
    });

    describe('Resources', () => {
      class GameConfig {
        maxPlayers: number;
        gameMode: string;

        constructor(maxPlayers: number, gameMode: string) {
          this.maxPlayers = maxPlayers;
          this.gameMode = gameMode;
        }
      }

      class AudioManager {
        volume: number;

        constructor(volume: number) {
          this.volume = volume;
        }
      }

      it('setResource stores a singleton resource in the world', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(4, 'multiplayer');

        expect(world.hasResource(GameConfig)).to.equal(false);

        world.setResource(config);

        expect(world.hasResource(GameConfig)).to.equal(true);
      });

      it('getResource retrieves a stored singleton resource', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(8, 'singleplayer');

        world.setResource(config);

        const retrievedConfig = world.getResource(GameConfig);

        expect(retrievedConfig).to.equal(config);
        expect(retrievedConfig?.maxPlayers).to.equal(8);
        expect(retrievedConfig?.gameMode).to.equal('singleplayer');
      });

      it('getResource returns undefined for non-existent resources', () => {
        const world = new World<CompTypes>();

        const retrievedConfig = world.getResource(GameConfig);

        expect(retrievedConfig).to.equal(undefined);
      });

      it('hasResource correctly checks resource existence', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(2, 'local');

        expect(world.hasResource(GameConfig)).to.equal(false);
        expect(world.hasResource(AudioManager)).to.equal(false);

        world.setResource(config);

        expect(world.hasResource(GameConfig)).to.equal(true);
        expect(world.hasResource(AudioManager)).to.equal(false);
      });

      it('removeResource removes a stored resource and returns true', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(6, 'coop');

        world.setResource(config);

        expect(world.hasResource(GameConfig)).to.equal(true);

        const removed = world.removeResource(GameConfig);

        expect(removed).to.equal(true);
        expect(world.hasResource(GameConfig)).to.equal(false);
        expect(world.getResource(GameConfig)).to.equal(undefined);
      });

      it('removeResource returns false for non-existent resources', () => {
        const world = new World<CompTypes>();

        const removed = world.removeResource(GameConfig);

        expect(removed).to.equal(false);
      });

      it('resources are globally unique by type', () => {
        const world = new World<CompTypes>();
        const config1 = new GameConfig(4, 'pvp');
        const config2 = new GameConfig(2, 'pve');

        world.setResource(config1);
        world.setResource(config2); // This should overwrite config1

        const retrieved = world.getResource(GameConfig);

        expect(retrieved).to.equal(config2);
        expect(retrieved).to.not.equal(config1);
      });

      it('setResource is chainable (returns this)', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(10, 'custom');

        const result = world.setResource(config);

        expect(result).to.equal(world);
        expect(world.hasResource(GameConfig)).to.equal(true);
      });

      it('can store and retrieve multiple different resource types', () => {
        const world = new World<CompTypes>();
        const config = new GameConfig(5, 'mixed');
        const audio = new AudioManager(75);

        world.setResource(config);
        world.setResource(audio);

        expect(world.hasResource(GameConfig)).to.equal(true);
        expect(world.hasResource(AudioManager)).to.equal(true);

        const retrievedConfig = world.getResource(GameConfig);
        const retrievedAudio = world.getResource(AudioManager);

        expect(retrievedConfig).to.equal(config);
        expect(retrievedAudio).to.equal(audio);
      });
    });

    describe('Entity Prefabs', () => {
      // Extend existing component types for prefab tests
      class PositionComponent extends FirstComponent {
        x: number;
        y: number;

        constructor(id: string, x: number = 0, y: number = 0) {
          super(id);
          this.x = x;
          this.y = y;
        }
      }

      class VelocityComponent extends FirstComponent {
        vx: number;
        vy: number;

        constructor(id: string, vx: number = 0, vy: number = 0) {
          super(id);
          this.vx = vx;
          this.vy = vy;
        }
      }

      class HealthComponent extends SecondComponent {
        health: number;
        maxHealth: number;

        constructor(otherId?: string, health?: number, maxHealth?: number) {
          super(otherId ?? 'health-comp');
          this.health = health ?? 100;
          this.maxHealth = maxHealth ?? 100;
        }
      }

      it('registerPrefab stores a prefab definition', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [
            new PositionComponent('pos1', 10, 20),
            new VelocityComponent('vel1', 1, 2),
          ],
        };

        expect(() => world.registerPrefab('enemy', prefabDef)).to.not.throw();

        // Internal check - accessing private property for testing
        expect((world as any).prefabs.has('enemy')).to.equal(true);
        expect((world as any).prefabs.get('enemy')).to.equal(prefabDef);
      });

      it('registerPrefab is chainable (returns this)', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [new PositionComponent('pos1', 5, 5)],
        };

        const result = world.registerPrefab('player', prefabDef);

        expect(result).to.equal(world);
      });

      it('registerPrefab can include tags', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          tags: ['enemy', 'hostile'],
          components: [new HealthComponent('health-comp', 50, 50)],
        };

        world.registerPrefab('weakEnemy', prefabDef);

        const storedPrefab = (world as any).prefabs.get('weakEnemy');
        expect(storedPrefab.tags).to.deep.equal(['enemy', 'hostile']);
        expect(storedPrefab.components).to.have.lengthOf(1);
      });

      it('createEntityFromPrefab creates entity with prefab components', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [
            new PositionComponent('pos1', 100, 200),
            new VelocityComponent('vel1', 5, -3),
            new HealthComponent('health-comp', 75, 100),
          ],
        };

        world.registerPrefab('testEntity', prefabDef);

        const entity = world.createEntityFromPrefab('testEntity');

        expect(entity).to.be.instanceof(Entity);
        expect(entity.has(PositionComponent)).to.equal(true);
        expect(entity.has(VelocityComponent)).to.equal(true);
        expect(entity.has(HealthComponent)).to.equal(true);

        const pos = entity.get(PositionComponent);
        const vel = entity.get(VelocityComponent);
        const health = entity.get(HealthComponent);

        expect(pos.x).to.equal(100);
        expect(pos.y).to.equal(200);
        expect(vel.vx).to.equal(5);
        expect(vel.vy).to.equal(-3);
        expect(health.health).to.equal(75);
        expect(health.maxHealth).to.equal(100);
      });

      it('createEntityFromPrefab applies tags from prefab', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          tags: ['player', 'controllable'],
          components: [new PositionComponent('pos1', 0, 0)],
        };

        world.registerPrefab('playerPrefab', prefabDef);

        const entity = world.createEntityFromPrefab('playerPrefab');

        expect(entity.hasTag('player')).to.equal(true);
        expect(entity.hasTag('controllable')).to.equal(true);
        expect(entity.tags.has('player')).to.equal(true);
        expect(entity.tags.has('controllable')).to.equal(true);
      });

      it('createEntityFromPrefab throws error for non-existent prefab', () => {
        const world = new World<CompTypes>();

        expect(() => world.createEntityFromPrefab('nonexistent')).to.throw(
          'Prefab with name "nonexistent" not found.'
        );
      });

      it('createEntityFromPrefab supports component overrides', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [
            new PositionComponent('pos1', 10, 10),
            new HealthComponent('health-comp', 100, 100),
          ],
        };

        world.registerPrefab('baseEntity', prefabDef);

        const overrides = {
          PositionComponent: { x: 50, y: 75 },
          HealthComponent: { health: 50 },
        } as any;

        const entity = world.createEntityFromPrefab('baseEntity', overrides);

        const pos = entity.get(PositionComponent);
        const health = entity.get(HealthComponent);

        // Original values should be overridden
        expect(pos.x).to.equal(50);
        expect(pos.y).to.equal(75);
        expect(health.health).to.equal(50);
        // Non-overridden values should remain from prefab
        expect(health.maxHealth).to.equal(100);
      });

      it('createEntityFromPrefab creates deep clones of components', () => {
        const world = new World<CompTypes>();
        const originalPos = new PositionComponent('pos1', 1, 2);
        const prefabDef = {
          components: [originalPos],
        };

        world.registerPrefab('cloneTest', prefabDef);

        const entity1 = world.createEntityFromPrefab('cloneTest');
        const entity2 = world.createEntityFromPrefab('cloneTest');

        const pos1 = entity1.get(PositionComponent);
        const pos2 = entity2.get(PositionComponent);

        // Components should be different instances
        expect(pos1).to.not.equal(pos2);
        expect(pos1).to.not.equal(originalPos);
        expect(pos2).to.not.equal(originalPos);

        // But should have same values
        expect(pos1.x).to.equal(pos1.x);
        expect(pos1.y).to.equal(pos2.y);

        // Modifying one shouldn't affect others
        pos1.x = 999;
        expect(pos2.x).to.equal(1);
        expect(originalPos.x).to.equal(1);
      });

      it('createEntityFromPrefab works with empty overrides', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [new PositionComponent('pos1', 42, 24)],
        };

        world.registerPrefab('simple', prefabDef);

        const entity = world.createEntityFromPrefab('simple', {});

        const pos = entity.get(PositionComponent);
        expect(pos.x).to.equal(42);
        expect(pos.y).to.equal(24);
      });

      it('createEntityFromPrefab with overrides only affects specified component properties', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [
            new PositionComponent('pos1', 10, 20),
            new VelocityComponent('vel1', 1, 2),
          ],
        };

        world.registerPrefab('selectiveOverride', prefabDef);

        const overrides = {
          PositionComponent: { x: 100 }, // Only override x, not y
        } as any;

        const entity = world.createEntityFromPrefab(
          'selectiveOverride',
          overrides
        );

        const pos = entity.get(PositionComponent);
        const vel = entity.get(VelocityComponent);

        expect(pos.x).to.equal(100); // Should be overridden
        expect(pos.y).to.equal(20); // Should remain from prefab
        expect(vel.vx).to.equal(1); // Should remain from prefab
        expect(vel.vy).to.equal(2); // Should remain from prefab
      });

      it('createEntityFromPrefab can create multiple entities from same prefab', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [new HealthComponent('health-comp', 100, 100)],
        };

        world.registerPrefab('reusable', prefabDef);

        const entity1 = world.createEntityFromPrefab('reusable');
        const entity2 = world.createEntityFromPrefab('reusable');
        const entity3 = world.createEntityFromPrefab('reusable');

        expect(entity1).to.not.equal(entity2);
        expect(entity2).to.not.equal(entity3);
        expect(entity1).to.not.equal(entity3);

        expect(entity1.get(HealthComponent).health).to.equal(100);
        expect(entity2.get(HealthComponent).health).to.equal(100);
        expect(entity3.get(HealthComponent).health).to.equal(100);
      });

      it('prefabs can be registered with empty components array', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          components: [],
        };

        world.registerPrefab('empty', prefabDef);

        const entity = world.createEntityFromPrefab('empty');

        expect(entity).to.be.instanceof(Entity);
        // Entity should exist but have no components
      });

      it('prefabs with only tags work correctly', () => {
        const world = new World<CompTypes>();
        const prefabDef = {
          tags: ['marker', 'flag'],
          components: [],
        };

        world.registerPrefab('tagOnly', prefabDef);

        const entity = world.createEntityFromPrefab('tagOnly');

        expect(entity.hasTag('marker')).to.equal(true);
        expect(entity.hasTag('flag')).to.equal(true);
        expect(entity.tags.size).to.equal(2);
      });
    });
  });
});
