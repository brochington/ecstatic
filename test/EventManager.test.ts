import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'vitest';

// Helper function to create sinon fakes that work like the existing tests
function createFake(): sinon.SinonSpy {
  return sinon.fake() as any;
}

import {
  EventManager,
  EventListenerFunc,
  EventListenerArgs,
} from '../src/EventManager';
import World from '../src/World';

// Test event classes
class TestEvent {
  value: string;

  constructor(value: string) {
    this.value = value;
  }
}

class AnotherTestEvent {
  number: number;

  constructor(number: number) {
    this.number = number;
  }
}

type CompTypes = any;

describe('EventManager', () => {
  it('exists and can be instantiated', () => {
    const world = new World<CompTypes>();
    const eventManager = new EventManager(world);

    expect(eventManager).to.be.instanceof(EventManager);
  });

  describe('addListener', () => {
    it('adds listeners for specific event types', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();

      eventManager.addListener(TestEvent, listener, 'test-phase');

      // Access private listeners map for testing
      const listeners = (eventManager as any).listeners.get(TestEvent);
      expect(listeners).to.have.lengthOf(1);
      expect(listeners[0].func).to.equal(listener);
      expect(listeners[0].phase).to.equal('test-phase');
    });

    it('creates new array for first listener of event type', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();

      eventManager.addListener(TestEvent, listener, 'test-phase');

      expect((eventManager as any).listeners.has(TestEvent)).to.be.true;
      expect((eventManager as any).listeners.get(TestEvent)).to.be.an('array');
    });

    it('adds multiple listeners for the same event type', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener1 = createFake();
      const listener2 = createFake();

      eventManager.addListener(TestEvent, listener1, 'phase1');
      eventManager.addListener(TestEvent, listener2, 'phase2');

      const listeners = (eventManager as any).listeners.get(TestEvent);
      expect(listeners).to.have.lengthOf(2);
      expect(listeners[0].func).to.equal(listener1);
      expect(listeners[0].phase).to.equal('phase1');
      expect(listeners[1].func).to.equal(listener2);
      expect(listeners[1].phase).to.equal('phase2');
    });

    it('adds listeners for different event types', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const testEventListener = createFake();
      const anotherEventListener = createFake();

      eventManager.addListener(TestEvent, testEventListener, 'test-phase');
      eventManager.addListener(
        AnotherTestEvent,
        anotherEventListener,
        'another-phase'
      );

      expect((eventManager as any).listeners.has(TestEvent)).to.be.true;
      expect((eventManager as any).listeners.has(AnotherTestEvent)).to.be.true;
      expect((eventManager as any).listeners.get(TestEvent)[0].func).to.equal(
        testEventListener
      );
      expect(
        (eventManager as any).listeners.get(AnotherTestEvent)[0].func
      ).to.equal(anotherEventListener);
    });
  });

  describe('emit', () => {
    it('queues events for processing', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const event = new TestEvent('test-value');

      eventManager.emit(event);

      expect((eventManager as any).queue).to.have.lengthOf(1);
      expect((eventManager as any).queue[0]).to.equal(event);
    });

    it('queues multiple events', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const event1 = new TestEvent('test1');
      const event2 = new AnotherTestEvent(42);

      eventManager.emit(event1);
      eventManager.emit(event2);

      expect((eventManager as any).queue).to.have.lengthOf(2);
      expect((eventManager as any).queue[0]).to.equal(event1);
      expect((eventManager as any).queue[1]).to.equal(event2);
    });
  });

  describe('processQueueForPhase', () => {
    it('calls listeners for events in the specified phase', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();
      const event = new TestEvent('test-value');

      eventManager.addListener(TestEvent, listener, 'test-phase');
      eventManager.emit(event);
      eventManager.processQueueForPhase('test-phase');

      expect(listener.callCount).to.equal(1);
      const callArgs = listener.args[0][0] as EventListenerArgs<
        TestEvent,
        CompTypes
      >;
      expect(callArgs.event).to.equal(event);
      expect(callArgs.world).to.equal(world);
    });

    it('does not call listeners for different phases', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();
      const event = new TestEvent('test-value');

      eventManager.addListener(TestEvent, listener, 'test-phase');
      eventManager.emit(event);
      eventManager.processQueueForPhase('different-phase');

      expect(listener.callCount).to.equal(0);
    });

    it('calls multiple listeners for the same event and phase', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener1 = createFake();
      const listener2 = createFake();
      const event = new TestEvent('test-value');

      eventManager.addListener(TestEvent, listener1, 'test-phase');
      eventManager.addListener(TestEvent, listener2, 'test-phase');
      eventManager.emit(event);
      eventManager.processQueueForPhase('test-phase');

      expect(listener1.callCount).to.equal(1);
      expect(listener2.callCount).to.equal(1);
    });

    it('processes multiple events in the queue', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();
      const event1 = new TestEvent('test1');
      const event2 = new TestEvent('test2');

      eventManager.addListener(TestEvent, listener, 'test-phase');
      eventManager.emit(event1);
      eventManager.emit(event2);
      eventManager.processQueueForPhase('test-phase');

      expect(listener.callCount).to.equal(2);
      expect(listener.args[0][0].event).to.equal(event1);
      expect(listener.args[1][0].event).to.equal(event2);
    });

    it('processes events of different types in the same phase', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const testEventListener = createFake();
      const anotherEventListener = createFake();
      const testEvent = new TestEvent('test');
      const anotherEvent = new AnotherTestEvent(42);

      eventManager.addListener(TestEvent, testEventListener, 'test-phase');
      eventManager.addListener(
        AnotherTestEvent,
        anotherEventListener,
        'test-phase'
      );
      eventManager.emit(testEvent);
      eventManager.emit(anotherEvent);
      eventManager.processQueueForPhase('test-phase');

      expect(testEventListener.callCount).to.equal(1);
      expect(anotherEventListener.callCount).to.equal(1);
      expect(testEventListener.args[0][0].event).to.equal(testEvent);
      expect(anotherEventListener.args[0][0].event).to.equal(anotherEvent);
    });

    it('does not process events that have no listeners', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const event = new TestEvent('test-value');

      eventManager.emit(event);
      // Should not throw or cause issues
      eventManager.processQueueForPhase('test-phase');
    });

    it('processes a copy of the queue so new events can be emitted during processing', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const listener = createFake();
      const event1 = new TestEvent('test1');
      const event2 = new AnotherTestEvent(42);

      // Listener that emits another event when called
      const emittingListener: EventListenerFunc<
        TestEvent,
        CompTypes
      > = args => {
        listener(args);
        eventManager.emit(event2);
      };

      eventManager.addListener(TestEvent, emittingListener, 'test-phase');
      eventManager.emit(event1);
      eventManager.processQueueForPhase('test-phase');

      // Original event should be processed
      expect(listener.callCount).to.equal(1);
      // New event should be in queue but not processed in this phase
      // The queue still contains both events since processQueueForPhase processes a copy
      expect((eventManager as any).queue).to.have.lengthOf(2);
      expect((eventManager as any).queue[0]).to.equal(event1);
      expect((eventManager as any).queue[1]).to.equal(event2);
    });
  });

  describe('clearQueue', () => {
    it('clears the event queue', () => {
      const world = new World<CompTypes>();
      const eventManager = new EventManager(world);
      const event = new TestEvent('test-value');

      eventManager.emit(event);
      expect((eventManager as any).queue).to.have.lengthOf(1);

      eventManager.clearQueue();
      expect((eventManager as any).queue).to.have.lengthOf(0);
    });
  });

  describe('integration with World', () => {
    it('World has events property that is an EventManager instance', () => {
      const world = new World<CompTypes>();

      expect(world.events).to.be.instanceof(EventManager);
    });

    describe('World.addSystemListener', () => {
      it('adds listener with default Events phase', () => {
        const world = new World<CompTypes>();
        const listener = createFake();

        world.addSystemListener(TestEvent, listener);

        const listeners = (world.events as any).listeners.get(TestEvent);
        expect(listeners).to.have.lengthOf(1);
        expect(listeners[0].func).to.equal(listener);
        expect(listeners[0].phase).to.equal('Events');
      });

      it('adds listener with custom phase', () => {
        const world = new World<CompTypes>();
        const listener = createFake();

        world.addSystemListener(TestEvent, listener, { phase: 'custom-phase' });

        const listeners = (world.events as any).listeners.get(TestEvent);
        expect(listeners).to.have.lengthOf(1);
        expect(listeners[0].func).to.equal(listener);
        expect(listeners[0].phase).to.equal('custom-phase');
      });

      it('returns the world instance for chaining', () => {
        const world = new World<CompTypes>();
        const listener = createFake();

        const result = world.addSystemListener(TestEvent, listener);

        expect(result).to.equal(world);
      });
    });
  });

  describe('end-to-end event flow', () => {
    it('world.events integration works correctly', () => {
      const world = new World<CompTypes>();
      const listener = createFake();
      const event = new TestEvent('test-value');

      // Add a system listener (defaults to 'Events' phase)
      world.addSystemListener(TestEvent, listener);

      // Emit event and process queue
      world.events.emit(event);
      world.events.processQueueForPhase('Events');

      // Listener should have been called
      expect(listener.callCount).to.equal(1);
      expect(listener.args[0][0].event).to.equal(event);
      expect(listener.args[0][0].world).to.equal(world);
    });

    it('events are processed by phase', () => {
      const world = new World<CompTypes>();
      const phase1Listener = createFake();
      const phase2Listener = createFake();
      const event1 = new TestEvent('test1');
      const event2 = new AnotherTestEvent(42);

      // Add listeners for different phases
      world.events.addListener(TestEvent, phase1Listener, 'phase1');
      world.events.addListener(AnotherTestEvent, phase2Listener, 'phase2');

      // Emit events
      world.events.emit(event1);
      world.events.emit(event2);

      // Process phase1 - should call phase1Listener
      world.events.processQueueForPhase('phase1');
      expect(phase1Listener.callCount).to.equal(1);
      expect(phase1Listener.args[0][0].event).to.equal(event1);
      expect(phase2Listener.callCount).to.equal(0);

      // Process phase2 - should call phase2Listener
      world.events.processQueueForPhase('phase2');
      expect(phase1Listener.callCount).to.equal(1); // Still 1
      expect(phase2Listener.callCount).to.equal(1);
      expect(phase2Listener.args[0][0].event).to.equal(event2);
    });
  });
});
