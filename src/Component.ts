export interface Component<CT> {
  type: CT;
  storage: Map<any, any> | Set<any> | object;
}

// type InferValue<Prop extends PropertyKey, Desc> = Desc extends {
//   get(): any;
//   value: any;
// }
//   ? never
//   : Desc extends { value: infer T }
//   ? Record<Prop, T>
//   : Desc extends { get(): infer T }
//   ? Record<Prop, T>
//   : never;

// type DefineProperty<
//   Prop extends PropertyKey,
//   Desc extends PropertyDescriptor
// > = Desc extends { writable: any; set(val: any): any }
//   ? never
//   : Desc extends { writable: any; get(): any }
//   ? never
//   : Desc extends { writable: false }
//   ? Readonly<InferValue<Prop, Desc>>
//   : Desc extends { writable: true }
//   ? InferValue<Prop, Desc>
//   : Readonly<InferValue<Prop, Desc>>;

// function defineProperty<
//   Obj extends object,
//   Key extends PropertyKey,
//   PDesc extends PropertyDescriptor
// >(
//   obj: Obj,
//   prop: Key,
//   val: PDesc
// ): asserts obj is Obj & DefineProperty<Key, PDesc> {
//   Object.defineProperty(obj, prop, val);
// }

// type Storage = {
//   [key: string]: any;
// };

// const typedKeysOf = <T>(obj: T) => Object.keys(obj) as Array<keyof T>

// export abstract class Component<CT, S extends Storage> {
//   type: CT; // overwritten when implemented

//   private storage: S;

//   constructor(storage: S) {
//     this.type = ('AbstractComponent' as unknown) as CT;
//     this.storage = storage;

//     // add accessors for storage.
//     for (const key of typedKeysOf<S>(storage)) {
//       Object.defineProperty(this, key, {
//         enumerable: true,
//         get() {
//           return this.storage[key];
//         },
//         set(newValue) {
//           this.storage[key] = newValue;
//         },
//       });
//     }
//   }
// }

// enum Components {
//   FirstComponent,
//   SecondComponent
// }

// interface TestStorage {
//   something: string;
// }

// class TestComp extends Component<Components, TestStorage> {}

// const a = new TestComp({ something: 'here' });
// const b = a.something;
