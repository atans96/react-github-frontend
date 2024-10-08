import { MutableRefObject } from 'react';
import { ReadyState } from './constants';

export interface QueryParams {
  [key: string]: string | number;
}

export interface Options {
  queryParams?: QueryParams;
  protocols?: string | string[];
  share?: boolean;
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  onReconnectStop?: (numAttempts: number) => void;
  shouldReconnect?: (event: WebSocketEventMap['close']) => boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  filter?: (message: WebSocketEventMap['message']) => boolean;
  retryOnError?: boolean;
}

export type ReadyStateState = {
  [url: string]: ReadyState;
};

export type WebSocketMessage = string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView;

export type SendMessage = (message: WebSocketMessage) => void;
export type SendJsonMessage = (jsonMessage: any) => void;

export type Subscriber<T = WebSocketEventMap['message']> = {
  setLastMessage: (message: T) => void;
  setReadyState: (readyState: ReadyState) => void;
  optionsRef: MutableRefObject<Options>;
  reconnectCount: MutableRefObject<number>;
  reconnect: MutableRefObject<() => void>;
};

export type WebSocketHook<T = WebSocketEventMap['message']> = {
  sendMessage: SendMessage;
  sendJsonMessage: SendJsonMessage;
  lastMessage: T | null;
  lastJsonMessage: any;
  readyState: ReadyState;
  getWebSocket: () => WebSocketLike | null;
};

export type WebSocketLike = WebSocket;
