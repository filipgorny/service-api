import { WebSocket } from 'ws';
import { ZodSchema } from 'zod';

/**
 * WebSocket endpoint configuration
 */
export interface WsEndpointConfig {
  description: string;
  params?: ZodSchema;
  events?: {
    server: string[];
    client?: string[];
  };
  onConnect: (socket: WebSocket, params: any) => void | Promise<void>;
  onMessage?: (socket: WebSocket, data: any) => void;
  onDisconnect?: (socket: WebSocket) => void;
}

/**
 * WebSocket API definition
 */
export interface WebSocketApi {
  namespace: string;
  endpoints: Record<string, WsEndpointConfig>;
}

/**
 * WebSocket endpoint metadata for schema
 */
export interface WsEndpointSchema {
  description: string;
  params?: any;
  events?: {
    server: string[];
    client?: string[];
  };
}
