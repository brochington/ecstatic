import World, { Class } from "./World";
import Entity from "./Entity";

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

      const world = component[
        Symbol.for("ecs.trackedComponent.world")
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
): Class<T> {
  return new Proxy(CompClass, {
    construct(Component: any, args: any) {
      const component = new Component(...args) as InstanceType<Class<T>>;

      // For use in identifing a "tracked" class through the proxy.
      component[Symbol.for("ecs.trackedComponent.isTracked")] = true;

      component[Symbol.for("ecs.trackedComponent.setWorld")] = (
        world: World<CT>
      ) => {
        component[Symbol.for("ecs.trackedComponent.world")] = world;
      };

      component[Symbol.for("ecs.trackedComponent.onAdd")] = (
        world: World<CT>,
        entity: Entity<CT>
      ) => {
        if (trackedEventHandlers.onAdd) {
          trackedEventHandlers.onAdd({ component, world, entity });
        }
      };

      component[Symbol.for("ecs.trackedComponent.onRemove")] = (
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
