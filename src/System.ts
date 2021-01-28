// import World from './World';
// import Entity from './Entity';
// import ComponentCollection from './ComponentCollection';

// type Class<T> = { new (...args: any[]): T };

// export type System = () => void;

// /**
//  * Arguments that are passed into a System function on each iteration.
//  * This is how you acces things like the entity that particular entity to act on,
//  * as well as some other helpful params like if the entity is the first or last entity
//  * in the group of entities that being iterated over.
//  */
// export interface SystemFuncArgs<CT extends Class<any>> {
//   /**
//    * The current entity being iterated.
//    */
//   entity: Entity<CT>;
//   /**
//    * The components that belong to the entity
//    */
//   components: ComponentCollection<CT>;
//   /**
//    * The World instance.
//    * Use this to access other entities.
//    */
//   world: World<CT>;
//   index: number;
//   size: number;
//   /**
//    * Is the first entity to be iterated on this run of a system.
//    * Helpful for setting up state that is the same for all entities only once.
//    */
//   isFirst: boolean;
//   /**
//    * Is the last entity to be iterated on this run of a system.
//    * Can be helpful to tear down anything that should be dealt with after all the entites have ran.
//    */
//   isLast: boolean;
// }

// /**
//  * Function that is called when a system is run.
//  */
// export type SystemFunc<CT extends Class<CT>> = (
//   sytemFuncArgs: SystemFuncArgs<CT>,
// ) => void;

// /**
//  * This is how you create a System.
//  * @example
//  * ```
//  * createSystem(world, ['ComponentType'], ({ entity }) => 'Do fun system things here.')
//  * ```
//  */
// export function createSystem<CT extends Class<any>>(
//   world: World<CT>,
//   cTypes: CT[],
//   systemFunc: SystemFunc<CT>,
// ): System {
//   const cNames = cTypes.map(ct => ct.name);
//   world.addSystem(cTypes, systemFunc.name);
//   // world.addSystem(cNames, systemFunc.name);

//   return (): void => {
//     let index = 0;
//     const size = world.entitiesByCTypes.size;

//     // Used for matching the array of ComponentTypes which is the key
//     // of where the ComponentCollection is, with the array of ComponentTypes
//     // that are passes.
//     // Might be nice in the future to go back to a ref check on cTypes, but
//     // for now this doesn't seem to be that much of a perf hit.
//     // for (const ct of world.entitiesByCTypes.keys()) {
//     //   if (cTypes.length === ct.length && cTypes.every(c => ct.includes(c))) {
//     //     for (const eid of world.entitiesByCTypes.get(cTypes)) {
//     //       const args: SystemFuncArgs<CT> = {
//     //         entity: world.entities.get(eid),
//     //         components: world.componentCollections.get(eid),
//     //         world,
//     //         index,
//     //         size,
//     //         isFirst: index === 0,
//     //         isLast: index + 1 === size,
//     //       }
    
//     //       systemFunc(args);
    
//     //       index += 1;
//     //     }
//     //   }
//     // }

//     const cTypeArrs = world.entitiesByCTypes.get(cNames) || new Set();

//     for (const eid of cTypeArrs) {
//       const args: SystemFuncArgs<CT> = {
//         entity: world.entities.get(eid) || new Entity<CT>(world),
//         components: world.componentCollections.get(eid) || new ComponentCollection<CT>(),
//         world,
//         index,
//         size,
//         isFirst: index === 0,
//         isLast: index + 1 === size,
//       }

//       systemFunc(args);

//       index += 1;
//     }
//   }
// }
