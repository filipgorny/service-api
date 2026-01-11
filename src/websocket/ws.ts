import { WebSocketApi, WsEndpointConfig } from './types';

/**
 * Creates a WebSocket API definition
 * @param namespace - API namespace (e.g., 'logs')
 * @param endpoints - Map of endpoint names to configurations
 * @returns WebSocket API definition
 */
export function ws(
  namespace: string,
  endpoints: Record<string, WsEndpointConfig>
): WebSocketApi {
  return {
    namespace,
    endpoints,
  };
}
