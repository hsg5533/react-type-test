export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type PromiseCreator<T, K extends any[]> = (...params: K) => Promise<T>;

export type UseRequestReturnType<T, K extends any[]> = [
  (...params: K) => Promise<void>,
  boolean,
  T | null,
  Error | null,
  () => void
];
