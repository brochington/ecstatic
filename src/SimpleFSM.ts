export type State = string | number | symbol;

export type Transitions<S extends State, D = undefined> = Record<
  S,
  // eslint-disable-next-line no-unused-vars
  (data: D, current: S) => S
>;

export default class SimpleFSM<S extends State, D = undefined> {
  current: S;

  inital: S;

  transitions: Transitions<S, D>;

  constructor(initialState: S, transitions: Transitions<S, D>) {
    this.inital = initialState;
    this.current = initialState;
    this.transitions = transitions;
  }

  next(data: D): void {
    if (this.transitions[this.current]) {
      this.current = this.transitions[this.current](data, this.current);
    }
  }

  reset(): void {
    this.current = this.inital;
  }

  is(checkState: S): boolean {
    return this.current === checkState;
  }
}
