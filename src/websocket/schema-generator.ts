import { WebSocketApi, WsEndpointSchema } from './types';

/**
 * Generates schema for WebSocket endpoints
 * @param wsApis - Array of WebSocket APIs
 * @returns Schema object for WebSocket endpoints
 */
export function generateWebSocketSchema(
  wsApis: WebSocketApi[]
): Record<string, WsEndpointSchema> {
  const schema: Record<string, WsEndpointSchema> = {};

  for (const api of wsApis) {
    for (const [endpointName, config] of Object.entries(api.endpoints)) {
      const path = `/api/${api.namespace}/${endpointName}`;

      schema[path] = {
        description: config.description,
        params: config.params ? zodToSimpleSchema(config.params) : undefined,
        events: config.events,
      };
    }
  }

  return schema;
}

/**
 * Converts Zod schema to simple JSON schema representation
 * @param zodSchema - Zod schema
 * @returns Simple schema object
 */
function zodToSimpleSchema(zodSchema: any): any {
  // Simple conversion - just extract field names and types
  // Full implementation would use zod-to-json-schema library
  try {
    const shape = zodSchema._def?.shape?.();
    if (!shape) return {};

    const result: any = {};
    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema: any = value;
      result[key] = {
        type: fieldSchema._def?.typeName?.replace('Zod', '')?.toLowerCase() || 'string',
        required: !fieldSchema.isOptional?.()
      };
    }
    return result;
  } catch {
    return {};
  }
}
