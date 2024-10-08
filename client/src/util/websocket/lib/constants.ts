export const DEFAULT_OPTIONS = {};
export const DEFAULT_RECONNECT_LIMIT = 20;
export const DEFAULT_RECONNECT_INTERVAL_MS = 5000;
export const UNPARSABLE_JSON_OBJECT = {};

export enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}
