import World, { Class } from "./World";
import Entity from "./Entity";

// Waiting for Typescript 4.2 to come out so that Symbols are supporded keys.
export const TrackedCompSymbolKeys = {
  isTracked: Symbol.for("ecs.trackedComponent.isTracked"),
  world: Symbol.for("ecs.trackedComponent.world"),
  setWorld: Symbol.for("ecs.trackedComponent.setWorld"),
  onAdd: Symbol.for("ecs.trackedComponent.onAdd"),
  onUpdate: Symbol.for("ecs.trackedComponent.onUpdate"),
  onRemove: Symbol.for("ecs.trackedComponent.onRemove"),
} as const;

//@ts-ignore
type TrackedComponent<CT extends Class> = {
  //@ts-ignore
  [TrackedCompSymbolKeys.isTracked]: boolean;
  //@ts-ignore
  [TrackedCompSymbolKeys.setWorld]: (world: World<CT>) => void;
  //@ts-ignore
  [TrackedCompSymbolKeys.world]: World<CT>;
  //@ts-ignore
  [TrackedCompSymbolKeys.onAdd]: (
    world: World<CT>,
    entity: Entity<CT>
  ) => void;
  //@ts-ignore
  [TrackedCompSymbolKeys.onRemove]: (
    world: World<CT>,
    entity: Entity<CT>
  ) => void;
};

interface AddEventArgs<T, CT extends Class> {
  component: InstanceType<Class<T>>;
  entity: Entity<CT>;
  world: World<CT>;
}

interface UpdateEventArgs<T, CT extends Class> {
  component: InstanceType<Class<T>>;
  world: World<CT>;
  previousVal: T[keyof T];
  property: keyof T;
}

interface RemoveEventArgs<T, CT extends Class> {
  component: InstanceType<Class<T>>;
  entity: Entity<CT>;
  world: World<CT>;
}

interface TrackedEventHandlers<T, CT extends Class> {
  onAdd?: (args: AddEventArgs<T, CT>) => void;
  onUpdate?: (args: UpdateEventArgs<T, CT>) => void;
  onRemove?: (args: RemoveEventArgs<T, CT>) => void;
}

function createClassInstanceProxyHandlers<T, CT extends Class>(
  trackedEventHandlers: TrackedEventHandlers<T, CT>
): ProxyHandler<any> {
  const updatedProps = new Set();
  return {
    set(
      component: InstanceType<Class<T>>,
      property: keyof T,
      value: T[keyof T]
    ) {
      updatedProps.add(property);

      //@ts-ignore
      const world = component[
        TrackedCompSymbolKeys.world
      ] as World<CT>;

      const previousVal = component[property];

      component[property] = value;

      if (trackedEventHandlers.onUpdate) {
        trackedEventHandlers.onUpdate({
          world,
          component,
          previousVal,
          property,
        });
      }

      return true;
    },
  };
}

export function trackComponent<CT extends Class<any>, T>(
  CompClass: Class<T>,
  trackedEventHandlers: TrackedEventHandlers<T, CT>
): Class<T> & TrackedComponent<CT> {
  return new Proxy(CompClass, {
    construct(Component: any, args: any) {
      const component = new Component(...args) as T & TrackedComponent<CT>;
      // const component = new Component(...args) as InstanceType<Class<T>>;

      // For use in identifing a "tracked" class through the proxy.
      //@ts-ignore
      component[TrackedCompSymbolKeys.isTracked] = true;

      //@ts-ignore
      component[TrackedCompSymbolKeys.setWorld] = (
        world: World<CT>
      ) => {
        //@ts-ignore
        component[TrackedCompSymbolKeys.world] = world;
      };

      //@ts-ignore
      component[TrackedCompSymbolKeys.onAdd] = (
        world: World<CT>,
        entity: Entity<CT>
      ) => {
        if (trackedEventHandlers.onAdd) {
          trackedEventHandlers.onAdd({ component, world, entity });
        }
      };

      //@ts-ignore
      component[TrackedCompSymbolKeys.onRemove] = (
        world: World<CT>,
        entity: Entity<CT>
      ) => {
        if (trackedEventHandlers.onRemove) {
          trackedEventHandlers.onRemove({ component, world, entity });
        }
      };

      return new Proxy(
        component,
        createClassInstanceProxyHandlers(trackedEventHandlers)
      );
    },
  });
}
