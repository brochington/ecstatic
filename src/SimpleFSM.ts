export type State = string | number | symbol;

export type Transitions<S extends State> = Record<S, (current: S) => S>;

export default class SimpleFSM<S extends State> {
  current: S;

  initial: S;

  transitions: Transitions<S>;

  constructor(initialState: S, transitions: Transitions<S>) {
    this.initial = initialState;
    this.current = initialState;
    this.transitions = transitions;
  }

  next(): void {
    if (this.transitions[this.current]) {
      this.current = this.transitions[this.current](this.current);
    }
  }

  reset(): void {
    this.current = this.initial;
  }

  is(checkState: S): boolean {
    return this.current === checkState;
  }

  includes(checkStateArr: S[]): boolean {
    return checkStateArr.some(s => this.current === s);
  }
}
