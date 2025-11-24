import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'vitest';

import { SystemFuncArgs } from '../src/Systems';
import Entity from '../src/Entity';
import World from '../src/World';
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

class ThirdComponent {}

class CompA {
  val = 0;
}
class CompB {
  val = 0;
}
class CompC {
  val = 0;
}

type CompTypes =
  | FirstComponent
  | SecondComponent
  | ThirdComponent
  | CompA
  | CompB
  | CompC;

function firstSystem() {
  /* */
}

describe('System', () => {
  it('create a system', () => {
    const world = new World<CompTypes>();

    world.addSystem([FirstComponent], firstSystem);

    // @ts-ignore - Accessing private property for testing
    const defaultPhaseSystems = world.systems.phases.get('__DEFAULT__');

    expect(defaultPhaseSystems).to.exist;
    expect(defaultPhaseSystems).to.have.lengthOf(1);

    // System structure now includes a query object instead of key
    const system = defaultPhaseSystems?.[0];
    expect(system?.func).to.equal(firstSystem);
    expect(system?.name).to.equal(firstSystem.name);
    expect(system?.query).to.exist;
    expect(system?.query.key).to.equal('all:FirstComponent');
  });

  it('Run System with Anonymous function', async () => {
    const world = new World<CompTypes>();

    await new Promise<void>(resolve => {
      world.addSystem([FirstComponent], args => {
        const { components } = args;

        const firstComp = components.get(FirstComponent);

        expect(firstComp.id).to.equal('first');
        resolve();
      });

      world.createEntity().add(new FirstComponent('first'));

      world.systems.run();
    });
  });

  it('Correctly calls systems based on created entities', () => {
    const world = new World<CompTypes>();

    const fake1 = sinon.fake();
    const fake2 = sinon.fake();
    const fake3 = sinon.fake();
    const fake4 = sinon.fake();

    world
      .addSystem([FirstComponent], fake1, { name: 'fake1' })
      .addSystem([SecondComponent], fake2, { name: 'fake2' })
      .addSystem([ThirdComponent], fake3, { name: 'fake3' })
      .addSystem([FirstComponent, SecondComponent], fake4, { name: 'fake4' });

    // entity 1;
    world.createEntity().add(new FirstComponent('first'));

    // entity 2;
    world
      .createEntity()
      .add(new FirstComponent('a'))
      .add(new SecondComponent('b'));

    world.systems.run();

    expect(fake1.callCount).to.equal(2); // entity 1 and 2
    expect(fake2.callCount).to.equal(1); // entity 2
    expect(fake3.callCount).to.equal(0); // no entities
    expect(fake4.callCount).to.equal(1); // entity 2
  });

  it('Correct args passed to system function', async () => {
    const world = new World<CompTypes>();

    await new Promise<void>(resolve => {
      world.addSystem([FirstComponent], (args: SystemFuncArgs<CompTypes>) => {
        expect(args.entity).to.be.instanceof(Entity);
        expect(args.components).to.be.instanceof(ComponentCollection);
        expect(args.components.size).to.equal(1);
        expect(args.world).to.be.instanceof(World);
        expect(args.index).to.equal(0);
        expect(args.isFirst).to.equal(true);
        expect(args.isLast).to.equal(true);
        expect(args.dt).to.be.a('number');
        expect(args.time).to.be.a('number');

        resolve();
      });

      world.createEntity().add(new FirstComponent('a'));

      world.systems.run();
    });
  });

  it('passes custom time and dt to system function', async () => {
    const world = new World<CompTypes>();
    const testDt = 33.3;
    const testTime = 123456;

    await new Promise<void>(resolve => {
      world.addSystem([FirstComponent], (args: SystemFuncArgs<CompTypes>) => {
        expect(args.dt).to.equal(testDt);
        expect(args.time).to.equal(testTime);
        resolve();
      });

      world.createEntity().add(new FirstComponent('a'));

      world.systems.run({ dt: testDt, time: testTime });
    });
  });

  it('uses default time values if not provided', async () => {
    const world = new World<CompTypes>();

    await new Promise<void>(resolve => {
      world.addSystem([FirstComponent], (args: SystemFuncArgs<CompTypes>) => {
        // Default dt is 16.666... (60 FPS)
        expect(args.dt).to.be.closeTo(16.666, 0.001);
        // Default time is performance.now(), just check it's a number
        expect(args.time).to.be.a('number');
        resolve();
      });

      world.createEntity().add(new FirstComponent('a'));

      world.systems.run();
    });
  });

  describe('Execution Phases', () => {
    it('adds systems with specific phases', () => {
      const world = new World<CompTypes>();

      const inputSystem = () => {};
      const logicSystem = () => {};
      const renderSystem = () => {};

      world.addSystem([FirstComponent], inputSystem, {
        phase: 'Input',
        name: 'inputSys',
      });
      world.addSystem([FirstComponent], logicSystem, {
        phase: 'Logic',
        name: 'logicSys',
      });
      world.addSystem([FirstComponent], renderSystem, {
        phase: 'Render',
        name: 'renderSys',
      });

      // @ts-ignore - Accessing private property for testing
      const inputPhaseSystems = world.systems.phases.get('Input');
      // @ts-ignore - Accessing private property for testing
      const logicPhaseSystems = world.systems.phases.get('Logic');
      // @ts-ignore - Accessing private property for testing
      const renderPhaseSystems = world.systems.phases.get('Render');

      expect(inputPhaseSystems).to.exist;
      expect(inputPhaseSystems).to.have.lengthOf(1);
      expect(inputPhaseSystems?.[0].func).to.equal(inputSystem);
      expect(inputPhaseSystems?.[0].name).to.equal('inputSys');
      expect(inputPhaseSystems?.[0].query).to.exist;
      expect(inputPhaseSystems?.[0].query.key).to.equal('all:FirstComponent');

      expect(logicPhaseSystems).to.exist;
      expect(logicPhaseSystems).to.have.lengthOf(1);
      expect(logicPhaseSystems?.[0].func).to.equal(logicSystem);
      expect(logicPhaseSystems?.[0].name).to.equal('logicSys');
      expect(logicPhaseSystems?.[0].query).to.exist;
      expect(logicPhaseSystems?.[0].query.key).to.equal('all:FirstComponent');

      expect(renderPhaseSystems).to.exist;
      expect(renderPhaseSystems).to.have.lengthOf(1);
      expect(renderPhaseSystems?.[0].func).to.equal(renderSystem);
      expect(renderPhaseSystems?.[0].name).to.equal('renderSys');
      expect(renderPhaseSystems?.[0].query).to.exist;
      expect(renderPhaseSystems?.[0].query.key).to.equal('all:FirstComponent');
    });

    it('executes systems in default phase order', () => {
      const world = new World<CompTypes>();
      const executionOrder: string[] = [];

      const inputSystem = () => executionOrder.push('Input');
      const logicSystem = () => executionOrder.push('Logic');
      const eventsSystem = () => executionOrder.push('Events');
      const renderSystem = () => executionOrder.push('Render');
      const cleanupSystem = () => executionOrder.push('Cleanup');

      world
        .addSystem([FirstComponent], renderSystem, { phase: 'Render' })
        .addSystem([FirstComponent], inputSystem, { phase: 'Input' })
        .addSystem([FirstComponent], logicSystem, { phase: 'Logic' })
        .addSystem([FirstComponent], eventsSystem, { phase: 'Events' })
        .addSystem([FirstComponent], cleanupSystem, { phase: 'Cleanup' });

      world.createEntity().add(new FirstComponent('test'));
      world.systems.run();

      expect(executionOrder).to.deep.equal([
        'Input',
        'Logic',
        'Events',
        'Render',
        'Cleanup',
      ]);
    });

    it('allows custom phase order', () => {
      const world = new World<CompTypes>();
      const executionOrder: string[] = [];

      const phaseASystem = () => executionOrder.push('A');
      const phaseBSystem = () => executionOrder.push('B');
      const phaseCSystem = () => executionOrder.push('C');

      world.systems.setPhaseOrder(['C', 'A', 'B']);

      world
        .addSystem([FirstComponent], phaseASystem, { phase: 'A' })
        .addSystem([FirstComponent], phaseBSystem, { phase: 'B' })
        .addSystem([FirstComponent], phaseCSystem, { phase: 'C' });

      world.createEntity().add(new FirstComponent('test'));
      world.systems.run();

      expect(executionOrder).to.deep.equal(['C', 'A', 'B']);
    });

    it('prevents mixing phased and non-phased systems', () => {
      const world = new World<CompTypes>();

      const phasedSystem = () => {};
      const nonPhasedSystem = () => {};

      world.addSystem([FirstComponent], phasedSystem, { phase: 'Input' });

      expect(() =>
        world.addSystem([SecondComponent], nonPhasedSystem)
      ).to.throw(
        'Ambiguous system execution order: Some systems are registered with a phase, while others are not. Please assign a phase to all systems if you intend to use execution phases.'
      );
    });

    it('executes custom phases not in default order', () => {
      const world = new World<CompTypes>();
      const executionOrder: string[] = [];

      const inputPhaseSystem = () => executionOrder.push('Input');
      const customPhaseSystem = () => executionOrder.push('Custom');

      world
        .addSystem([FirstComponent], inputPhaseSystem, { phase: 'Input' })
        .addSystem([FirstComponent], customPhaseSystem, {
          phase: 'CustomPhase',
        });

      world.createEntity().add(new FirstComponent('test'));
      world.systems.run();

      // Custom phases should be executed after default phases
      expect(executionOrder).to.deep.equal(['Input', 'Custom']);
    });

    it('executes systems in same phase in addition order', () => {
      const world = new World<CompTypes>();
      const executionOrder: string[] = [];

      const system1 = () => executionOrder.push('system1');
      const system2 = () => executionOrder.push('system2');
      const system3 = () => executionOrder.push('system3');

      world
        .addSystem([FirstComponent], system1, { phase: 'Logic', name: 'sys1' })
        .addSystem([FirstComponent], system2, { phase: 'Logic', name: 'sys2' })
        .addSystem([FirstComponent], system3, { phase: 'Logic', name: 'sys3' });

      world.createEntity().add(new FirstComponent('test'));
      world.systems.run();

      expect(executionOrder).to.deep.equal(['system1', 'system2', 'system3']);
    });

    it('handles multiple entities across phases correctly', () => {
      const world = new World<CompTypes>();
      const executionLog: string[] = [];

      const inputSystem = (args: SystemFuncArgs<CompTypes>) => {
        executionLog.push(`Input-${args.index}`);
      };
      const logicSystem = (args: SystemFuncArgs<CompTypes>) => {
        executionLog.push(`Logic-${args.index}`);
      };

      world
        .addSystem([FirstComponent], inputSystem, {
          phase: 'Input',
          name: 'input',
        })
        .addSystem([FirstComponent], logicSystem, {
          phase: 'Logic',
          name: 'logic',
        });

      // Create multiple entities
      world.createEntity().add(new FirstComponent('ent1'));
      world.createEntity().add(new FirstComponent('ent2'));
      world.createEntity().add(new FirstComponent('ent3'));

      world.systems.run();

      // Should execute all Input systems first (one per entity), then all Logic systems
      const expectedLog = [
        'Input-0',
        'Input-1',
        'Input-2', // Input phase for all entities
        'Logic-0',
        'Logic-1',
        'Logic-2', // Logic phase for all entities
      ];

      expect(executionLog).to.deep.equal(expectedLog);
    });

    it('skips phases with no systems', () => {
      const world = new World<CompTypes>();
      const executionOrder: string[] = [];

      const inputSystem = () => executionOrder.push('Input');
      const renderSystem = () => executionOrder.push('Render');

      // Add systems to Input and Render phases, skipping Logic and Events
      world
        .addSystem([FirstComponent], inputSystem, { phase: 'Input' })
        .addSystem([FirstComponent], renderSystem, { phase: 'Render' });

      world.createEntity().add(new FirstComponent('test'));
      world.systems.run();

      expect(executionOrder).to.deep.equal(['Input', 'Render']);
    });
  });

  it('supports Array definition (backward compatibility)', () => {
    const world = new World<CompTypes>();
    const fake = sinon.fake();

    world.addSystem([CompA], fake);
    world.createEntity().add(new CompA());
    world.systems.run();

    expect(fake.callCount).to.equal(1);
  });

  it('supports Query Definition object', () => {
    const world = new World<CompTypes>();
    const fake = sinon.fake();

    // Pass { all: ... } object directly
    world.addSystem({ all: [CompA], none: [CompB] }, fake);

    world.createEntity().add(new CompA()); // Should match
    world.createEntity().add(new CompA()).add(new CompB()); // Should NOT match

    world.systems.run();

    expect(fake.callCount).to.equal(1);
  });

  it('supports Query Instance', () => {
    const world = new World<CompTypes>();
    const fake = sinon.fake();

    const query = world.query({ any: [CompA, CompB] });
    world.addSystem(query, fake);

    world.createEntity().add(new CompA());
    world.createEntity().add(new CompB());

    world.systems.run();

    expect(fake.callCount).to.equal(2);
  });

  it('passes correct arguments to system function', () => {
    const world = new World<CompTypes>();
    let capturedArgs: SystemFuncArgs<CompTypes> | null = null;

    world.addSystem([CompA], (args: SystemFuncArgs<CompTypes>) => {
      capturedArgs = args;
    });

    const e = world.createEntity().add(new CompA());
    world.systems.run({ dt: 10, time: 100 });

    const ca = capturedArgs as unknown as SystemFuncArgs<CompTypes>;

    expect(ca).to.not.be.null;
    expect(ca.entity).to.equal(e);
    expect(ca.dt).to.equal(10);
    expect(ca.time).to.equal(100);
    expect(ca.index).to.equal(0);
    expect(ca.size).to.equal(1);
  });

  it('handles phases correctly', () => {
    const world = new World<CompTypes>();
    const calls: string[] = [];

    world.addSystem([CompA], () => calls.push('logic'), { phase: 'Logic' });
    world.addSystem([CompA], () => calls.push('render'), { phase: 'Render' });

    world.createEntity().add(new CompA());
    world.systems.run();

    // Logic comes before Render in default phase order
    expect(calls).to.deep.equal(['logic', 'render']);
  });
});
