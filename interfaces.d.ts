export type Tag = string | number;

export type Class<T> = { new (...args: any[]): T };

export interface CompTypes<CT> {
  [key: string]: Class<CT>;
}

export type Key<C> = C[keyof C];
