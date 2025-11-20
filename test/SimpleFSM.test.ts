import { expect } from 'chai';
import { describe, it } from 'vitest';

import SimpleFSM from '../src/SimpleFSM';

describe('SimpleFSM', () => {
  describe('constructor', () => {
    it('should create FSM with correct initial state', () => {
      const transitions = {
        idle: () => 'running',
        running: () => 'idle',
      };

      const fsm = new SimpleFSM('idle', transitions);

      expect(fsm.current).to.equal('idle');
      expect(fsm.inital).to.equal('idle');
      expect(fsm.transitions).to.equal(transitions);
    });

    it('should work with number states', () => {
      const transitions = {
        0: () => 1,
        1: () => 0,
      };

      const fsm = new SimpleFSM(0, transitions);

      expect(fsm.current).to.equal(0);
      expect(fsm.inital).to.equal(0);
    });

    it('should work with symbol states', () => {
      const idle = Symbol('idle');
      const running = Symbol('running');

      const transitions = {
        [idle]: () => running,
        [running]: () => idle,
      };

      const fsm = new SimpleFSM(idle, transitions);

      expect(fsm.current).to.equal(idle);
      expect(fsm.inital).to.equal(idle);
    });

    it('should handle complex transition functions', () => {
      const transitions = {
        // eslint-disable-next-line no-unused-vars
        state1: (data: string, _current: string) =>
          data === 'next' ? 'state2' : 'state1',
        // eslint-disable-next-line no-unused-vars
        state2: (_data: string, _current: string) => 'state1',
      };

      const fsm = new SimpleFSM('state1', transitions);

      expect(fsm.current).to.equal('state1');
    });
  });

  describe('next', () => {
    it('should transition to next state based on transition function', () => {
      const transitions = {
        idle: () => 'running',
        running: () => 'idle',
      };

      const fsm = new SimpleFSM('idle', transitions);

      fsm.next('any-data' as any);
      expect(fsm.current).to.equal('running');

      fsm.next('any-data' as any);
      expect(fsm.current).to.equal('idle');
    });

    it('should pass data parameter to transition function', () => {
      let receivedData: string | undefined;

      const transitions = {
        state1: (data: string) => {
          receivedData = data;
          return 'state2';
        },
        state2: () => 'state1',
      };

      const fsm = new SimpleFSM('state1', transitions);

      fsm.next('test-data' as any);

      expect(receivedData).to.equal('test-data');
      expect(fsm.current).to.equal('state2');
    });

    it('should pass current state to transition function', () => {
      let receivedCurrent: string | undefined;

      const transitions = {
        state1: (data: string, current: string) => {
          receivedCurrent = current;
          return 'state2';
        },
        state2: () => 'state1',
      };

      const fsm = new SimpleFSM('state1', transitions);

      fsm.next('test-data');

      expect(receivedCurrent).to.equal('state1');
    });

    it('should handle conditional transitions based on data', () => {
      const transitions = {
        idle: (command: string) => (command === 'start' ? 'running' : 'idle'),
        running: (command: string) => (command === 'stop' ? 'idle' : 'running'),
      };

      const fsm = new SimpleFSM('idle', transitions);

      fsm.next('invalid');
      expect(fsm.current).to.equal('idle');

      fsm.next('start');
      expect(fsm.current).to.equal('running');

      fsm.next('invalid');
      expect(fsm.current).to.equal('running');

      fsm.next('stop');
      expect(fsm.current).to.equal('idle');
    });

    it('should not change state if current state has no transition defined', () => {
      const transitions = {
        idle: () => 'running',
        // No transition for 'running'
      };

      const fsm = new SimpleFSM('idle', transitions);

      fsm.next('data' as any);
      expect(fsm.current).to.equal('running');

      // Try to transition from 'running' which has no transition
      fsm.next('data' as any);
      expect(fsm.current).to.equal('running');
    });

    it('should work with complex data types', () => {
      interface GameEvent {
        type: string;
        payload?: any;
      }

      const transitions = {
        menu: (event: GameEvent) =>
          event.type === 'start' ? 'playing' : 'menu',
        playing: (event: GameEvent) =>
          event.type === 'pause' ? 'paused' : 'playing',
        paused: (event: GameEvent) =>
          event.type === 'resume' ? 'playing' : 'paused',
      };

      const fsm = new SimpleFSM('menu', transitions);

      fsm.next({ type: 'start', payload: { level: 1 } });
      expect(fsm.current).to.equal('playing');

      fsm.next({ type: 'pause' });
      expect(fsm.current).to.equal('paused');

      fsm.next({ type: 'resume' });
      expect(fsm.current).to.equal('playing');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const transitions = {
        idle: () => 'running',
        running: () => 'idle',
      };

      const fsm = new SimpleFSM('idle', transitions);

      fsm.next('data' as any);
      expect(fsm.current).to.equal('running');

      fsm.reset();
      expect(fsm.current).to.equal('idle');
    });

    it('should allow transitions again after reset', () => {
      const transitions = {
        idle: () => 'running',
        running: () => 'idle',
      };

      const fsm = new SimpleFSM('idle', transitions);

      fsm.next('data' as any);
      expect(fsm.current).to.equal('running');

      fsm.reset();
      expect(fsm.current).to.equal('idle');

      fsm.next('data' as any);
      expect(fsm.current).to.equal('running');
    });

    it('should work with any initial state type', () => {
      const initialState = Symbol('initial');
      const otherState = Symbol('other');

      const transitions = {
        [initialState]: () => otherState,
        [otherState]: () => initialState,
      };

      const fsm = new SimpleFSM(initialState, transitions);

      fsm.next('data' as any);
      expect(fsm.current).to.equal(otherState);

      fsm.reset();
      expect(fsm.current).to.equal(initialState);
    });
  });

  describe('is', () => {
    it('should return true when current state matches check state', () => {
      const transitions = {
        idle: () => 'running',
        running: () => 'idle',
      };

      const fsm = new SimpleFSM('idle', transitions);

      expect(fsm.is('idle')).to.be.true;
      expect(fsm.is('running')).to.be.false;

      fsm.next('data' as any);

      expect(fsm.is('idle')).to.be.false;
      expect(fsm.is('running')).to.be.true;
    });

    it('should work with number states', () => {
      const transitions = {
        0: () => 1,
        1: () => 0,
      };

      const fsm = new SimpleFSM(0, transitions);

      expect(fsm.is(0)).to.be.true;
      expect(fsm.is(1)).to.be.false;

      fsm.next('data' as any);

      expect(fsm.is(0)).to.be.false;
      expect(fsm.is(1)).to.be.true;
    });

    it('should work with symbol states', () => {
      const idle = Symbol('idle');
      const running = Symbol('running');

      const transitions = {
        [idle]: () => running,
        [running]: () => idle,
      };

      const fsm = new SimpleFSM(idle, transitions);

      expect(fsm.is(idle)).to.be.true;
      expect(fsm.is(running)).to.be.false;

      fsm.next('data' as any);

      expect(fsm.is(idle)).to.be.false;
      expect(fsm.is(running)).to.be.true;
    });

    it('should return false for completely different states', () => {
      const transitions = {
        state1: () => 'state2',
        state2: () => 'state1',
      };

      const fsm = new SimpleFSM('state1', transitions);

      expect(fsm.is('state3')).to.be.false;
      expect(fsm.is(42 as any)).to.be.false;
      expect(fsm.is(Symbol('other') as any)).to.be.false;
    });
  });

  describe('edge cases', () => {
    it('should handle FSM with single state', () => {
      const transitions = {
        onlyState: () => 'onlyState',
      };

      const fsm = new SimpleFSM('onlyState', transitions);

      expect(fsm.current).to.equal('onlyState');
      expect(fsm.is('onlyState')).to.be.true;

      fsm.next('data' as any);
      expect(fsm.current).to.equal('onlyState');

      fsm.reset();
      expect(fsm.current).to.equal('onlyState');
    });

    it('should handle FSM with no transitions', () => {
      const transitions = {
        initial: () => 'initial',
      };

      const fsm = new SimpleFSM('initial', transitions);

      expect(fsm.current).to.equal('initial');

      fsm.next('data' as any);
      expect(fsm.current).to.equal('initial'); // Should not change

      fsm.reset();
      expect(fsm.current).to.equal('initial');
    });

    it('should handle undefined return from transition function', () => {
      const transitions = {
        state1: () => undefined as any,
        undefined: () => 'state1',
      };

      const fsm = new SimpleFSM('state1', transitions);

      fsm.next('data' as any);
      expect(fsm.current).to.be.undefined;

      fsm.next('data' as any);
      expect(fsm.current).to.equal('state1');
    });

    it('should maintain state across multiple operations', () => {
      const transitions = {
        a: () => 'b',
        b: () => 'c',
        c: () => 'a',
      };

      const fsm = new SimpleFSM('a', transitions);

      // Test sequence: a -> b -> c -> a -> b
      expect(fsm.is('a')).to.be.true;

      fsm.next('data' as any);
      expect(fsm.is('b')).to.be.true;

      fsm.next('data' as any);
      expect(fsm.is('c')).to.be.true;

      fsm.next('data' as any);
      expect(fsm.is('a')).to.be.true;

      fsm.reset();
      expect(fsm.is('a')).to.be.true;
    });
  });

  describe('real world usage patterns', () => {
    it('should work as a game state machine', () => {
      type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';
      type GameEvent = 'start' | 'pause' | 'resume' | 'quit' | 'die';

      const gameTransitions: Record<
        GameState,
        // eslint-disable-next-line no-unused-vars
        (event: GameEvent, _current: GameState) => GameState
      > = {
        // eslint-disable-next-line no-unused-vars
        menu: (event, _current) => (event === 'start' ? 'playing' : 'menu'),
        // eslint-disable-next-line no-unused-vars
        playing: (event, _current) => {
          switch (event) {
            case 'pause':
              return 'paused';
            case 'die':
              return 'gameOver';
            case 'quit':
              return 'menu';
            default:
              return 'playing';
          }
        },
        // eslint-disable-next-line no-unused-vars
        paused: (event, _current) =>
          event === 'resume' ? 'playing' : event === 'quit' ? 'menu' : 'paused',
        // eslint-disable-next-line no-unused-vars
        gameOver: (event, _current) =>
          event === 'start' ? 'playing' : 'gameOver',
      };

      const gameFSM = new SimpleFSM<GameState, GameEvent>(
        'menu',
        gameTransitions
      );

      // Start game
      gameFSM.next('start');
      expect(gameFSM.is('playing')).to.be.true;

      // Pause game
      gameFSM.next('pause');
      expect(gameFSM.is('paused')).to.be.true;

      // Resume game
      gameFSM.next('resume');
      expect(gameFSM.is('playing')).to.be.true;

      // Game over
      gameFSM.next('die');
      expect(gameFSM.is('gameOver')).to.be.true;

      // Restart
      gameFSM.next('start');
      expect(gameFSM.is('playing')).to.be.true;
    });

    it('should work as a traffic light controller', () => {
      type LightState = 'red' | 'yellow' | 'green';
      type TimerEvent = { time: number };

      const lightTransitions: Record<
        LightState,
        // eslint-disable-next-line no-unused-vars
        (event: TimerEvent, _current: LightState) => LightState
      > = {
        // eslint-disable-next-line no-unused-vars
        red: (event, _current) => (event.time > 30 ? 'green' : 'red'),
        // eslint-disable-next-line no-unused-vars
        green: (event, _current) => (event.time > 25 ? 'yellow' : 'green'),
        // eslint-disable-next-line no-unused-vars
        yellow: (event, _current) => (event.time > 5 ? 'red' : 'yellow'),
      };

      const trafficLight = new SimpleFSM<LightState, TimerEvent>(
        'red',
        lightTransitions
      );

      expect(trafficLight.is('red')).to.be.true;

      // Short time - stay red
      trafficLight.next({ time: 10 });
      expect(trafficLight.is('red')).to.be.true;

      // Long time - change to green
      trafficLight.next({ time: 35 });
      expect(trafficLight.is('green')).to.be.true;
    });
  });
});
