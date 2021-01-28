interface TrackedEventHandlers {
  onUpdate?: () => void;
  onAdd?: (classInstance, entity, world) => void;

}

function createClassInstanceProxyHandlers(trackedEventHandlers: TrackedEventHandlers): ProxyHandler<any> { 
  const updatedProps = new Set();
  return {
    set(obj: any, prop: string, value: any) {
      updatedProps.add(prop);

      if (trackedEventHandlers.onUpdate) {
        trackedEventHandlers.onUpdate();
      }
      
      obj[prop] = value;

      return true;
    },
  };
}

export function track<T extends object>(
  CompClass: T,
  trackedEventHandlers: TrackedEventHandlers
): Proxy {
  return new Proxy(CompClass, {
    construct(target: any, args: any) {
      const classInstance = new target(...args);

      // For use in identifing a "tracked" class through the proxy.
      classInstance[Symbol.for("ecs.trackedComponent.isTracked")] = true;

      classInstance[Symbol.for("ecs.trackedComponent.setWorld")] = (
        world: World<any>
      ) => {
        console.log("gonna set the world!", world);
        classInstance[Symbol.for("ecs.trackedComponent.world")] = world;
      };

      classInstance[Symbol.for("ecs.trackedComponent.onAdd")] = (
        world: World<any>,
        entity: Entity<any>
      ) => {
        if (trackedEventHandlers.onAdd) {
          trackedEventHandlers.onAdd(classInstance, entity, world);
        }
      };

      classInstance[Symbol.for('ecs.trackedComponent.onRemove')] = () => {
        console.log('onRemove!');
      }


      return new Proxy(
        classInstance,
        createClassInstanceProxyHandlers(trackedEventHandlers)
      );
    },
  });
}
