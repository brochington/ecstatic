/* eslint-disable no-unused-vars */
import World, { ClassConstructor } from './World';
import Entity, { EntityId } from './Entity';

// Waiting for Typescript 4.2 to come out so that Symbols are supporded keys.
export const TrackedCompSymbolKeys = {
  isTracked: Symbol.for('ecs.trackedComponent.isTracked'),
  world: Symbol.for('ecs.trackedComponent.world'),
  entityIDs: Symbol.for('ecs.trackedComponent.entityIDs'),
  getEntities: Symbol.for('ecs.trackedComponent.getEntities'),
  setWorld: Symbol.for('ecs.trackedComponent.setWorld'),
  onAdd: Symbol.for('ecs.trackedComponent.onAdd'),
  onUpdate: Symbol.for('ecs.trackedComponent.onUpdate'),
  onRemove: Symbol.for('ecs.trackedComponent.onRemove'),
} as const;

//@ts-ignore
type TrackedComponent<CT> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): CT;

  //@ts-ignore
  [TrackedCompSymbolKeys.isTracked]: boolean;
  //@ts-ignore
  [TrackedCompSymbolKeys.setWorld]: (world: World<CT>) => void;
  //@ts-ignore
  [TrackedCompSymbolKeys.world]: World<CT>;
  //@ts-ignore
  [TrackedCompSymbolKeys.entityIDs]: Set<EntityId>;
  //@ts-ignore
  [TrackedCompSymbolKeys.getEntities]: () => Map<EntityId, Entity<CT>>;
  //@ts-ignore
  [TrackedCompSymbolKeys.onAdd]: (world: World<CT>, entity: Entity<CT>) => void;
  //@ts-ignore
  [TrackedCompSymbolKeys.onRemove]: (
    world: World<CT>,
    entity: Entity<CT>
  ) => void;
};

interface AddEventArgs<CT> {
  world: World<CT>;
  component: CT;
  entity: Entity<CT>;
  entities: Map<EntityId, Entity<CT>>;
}

interface UpdateEventArgs<CT> {
  entities: Map<EntityId, Entity<CT>>;
  component: CT;
  world: World<CT>;
  previousVal: CT[keyof CT];
  property: keyof CT;
}

interface RemoveEventArgs<CT> {
  world: World<CT>;
  component: CT;
  entity: Entity<CT>;
  entities: Map<EntityId, Entity<CT>>;
}

interface TrackedEventHandlers<CT> {
  onAdd?: (args: AddEventArgs<CT>) => void;
  onUpdate?: (args: UpdateEventArgs<CT>) => void;
  onRemove?: (args: RemoveEventArgs<CT>) => void;
}

// NOTE: Really need to get symbols working as keys in Typescript.
//       Until then will have to cast to keyof CT.
// https://stackoverflow.com/questions/54324323/typescript-type-string-is-not-assignable-to-type-keyof
// https://github.com/microsoft/TypeScript/pull/26797
function createClassInstanceProxyHandlers<CT>(
  trackedEventHandlers: TrackedEventHandlers<CT>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ProxyHandler<any> {
  const updatedProps = new Set();
  return {
    set(component: CT, property: string, value: CT[keyof CT]) {
      updatedProps.add(property);

      //@ts-ignore
      const world = component[TrackedCompSymbolKeys.world] as World<CT>;

      const previousVal = component[property as keyof CT];

      component[property as keyof CT] = value;

      //@ts-ignore
      const entities = component[TrackedCompSymbolKeys.getEntities](
        world
      ) as Map<EntityId, Entity<CT>>;

      for (const entity of entities.values()) {
        entity.onTrackedComponentUpdate({ world, component });
      }

      if (trackedEventHandlers.onUpdate) {
        trackedEventHandlers.onUpdate({
          entities,
          world,
          component,
          previousVal,
          property: property as keyof CT,
        });
      }

      return true;
    },
  };
}

export function trackComponent<CT>(
  CompClass: ClassConstructor<CT>,
  trackedEventHandlers: TrackedEventHandlers<CT>
): TrackedComponent<CT> {
  return new Proxy(CompClass, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    construct(Component: any, args: any) {
      const component = new Component(...args) as CT & TrackedComponent<CT>;

      // For use in identifing a "tracked" class through the proxy.
      //@ts-ignore
      component[TrackedCompSymbolKeys.isTracked] = true;

      //@ts-ignore
      component[TrackedCompSymbolKeys.setWorld] = (world: World<CT>) => {
        //@ts-ignore
        component[TrackedCompSymbolKeys.world] = world;
      };

      // Holds entities that this component has been added to.
      // Added and removed in world.add()/world.remove().
      //@ts-ignore
      component[TrackedCompSymbolKeys.entityIDs] = new Set();

      // Helper function to get the Entities from entityIDs
      //@ts-ignore
      component[TrackedCompSymbolKeys.getEntities] = (
        world: World<CT>
      ): Map<EntityId, Entity<CT>> => {
        const entities = new Map<EntityId, Entity<CT>>();

        //@ts-ignore
        for (const eid of component[TrackedCompSymbolKeys.entityIDs]) {
          const entity = world.entities.get(eid);
          if (entity) {
            entities.set(eid, entity);
          }
        }

        return entities;
      };

      //@ts-ignore
      component[TrackedCompSymbolKeys.onAdd] = (
        world: World<CT>,
        entity: Entity<CT>
      ) => {
        if (trackedEventHandlers.onAdd) {
          //@ts-ignore
          const entities = component[TrackedCompSymbolKeys.getEntities](
            world
          ) as Map<EntityId, Entity<CT>>;

          trackedEventHandlers.onAdd({ component, world, entity, entities });
        }
      };

      //@ts-ignore
      component[TrackedCompSymbolKeys.onRemove] = (
        world: World<CT>,
        entity: Entity<CT>
      ) => {
        if (trackedEventHandlers.onRemove) {
          //@ts-ignore
          const entities = component[TrackedCompSymbolKeys.getEntities](
            world
          ) as Map<EntityId, Entity<CT>>;

          trackedEventHandlers.onRemove({ component, world, entity, entities });
        }
      };

      return new Proxy(
        component,
        createClassInstanceProxyHandlers(trackedEventHandlers)
      );
    },
  });
}
