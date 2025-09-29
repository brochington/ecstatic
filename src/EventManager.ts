import World, { ClassConstructor } from './World';

/**
 * Arguments passed to an event listener function.
 */
export interface EventListenerArgs<E, CT> {
  /** The event instance that was emitted. */
  event: E;
  /** A reference to the world. */
  world: World<CT>;
}

/**
 * The function signature for an event listener.
 */
// eslint-disable-next-line no-unused-vars
export type EventListenerFunc<E, CT> = (args: EventListenerArgs<E, CT>) => void;

interface ListenerRecord<CT> {
  func: EventListenerFunc<unknown, CT>;
  phase: string;
}

export class EventManager<CT> {
  private world: World<CT>;
  // Map where key is Event Class Constructor, value is an array of listeners for that event.
  private listeners: Map<ClassConstructor<unknown>, ListenerRecord<CT>[]> =
    new Map();
  // Queue of events emitted during the current frame.
  private queue: object[] = [];

  constructor(world: World<CT>) {
    this.world = world;
  }

  /**
   * Registers a listener function to be called when a specific event type is emitted.
   * @param EventType The class of the event to listen for.
   * @param func The function to execute when the event is emitted.
   * @param phase The execution phase during which this listener should be called.
   */
  addListener<E>(
    EventType: ClassConstructor<E>,
    func: EventListenerFunc<E, CT>,
    phase: string
  ): void {
    if (!this.listeners.has(EventType)) {
      this.listeners.set(EventType, []);
    }
    const listeners = this.listeners.get(EventType);
    if (listeners) {
      listeners.push({ func: func as EventListenerFunc<unknown, CT>, phase });
    }
  }

  /**
   * Queues an event to be processed by listeners in the appropriate phase.
   * @param event An instance of an event class.
   */
  emit(event: object): void {
    this.queue.push(event);
  }

  /**
   * Processes all queued events, firing listeners that are registered for the current execution phase.
   * This is called by the Systems.run() method.
   * @param phase The current execution phase.
   */
  processQueueForPhase(phase: string): void {
    // Process a copy of the queue, as listeners might emit new events.
    const eventsToProcess = [...this.queue];

    for (const event of eventsToProcess) {
      const EventType = event.constructor as ClassConstructor<unknown>;
      const eventListeners = this.listeners.get(EventType) || [];

      for (const listener of eventListeners) {
        if (listener.phase === phase) {
          listener.func({ event: event as unknown, world: this.world });
        }
      }
    }
  }

  /**
   * Clears the event queue. This is called at the end of each frame/tick.
   */
  clearQueue(): void {
    this.queue = [];
  }
}
