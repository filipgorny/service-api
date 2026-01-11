import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketApi } from './types';
import { URL } from 'url';

/**
 * Sets up WebSocket server and registers API endpoints
 * @param server - HTTP server instance
 * @param wsApis - Array of WebSocket APIs to register
 */
export function setupWebSocketServer(
  server: HttpServer,
  wsApis: WebSocketApi[]
): void {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket: WebSocket, req) => {
    handleConnection(socket, req, wsApis);
  });
}

/**
 * Handles incoming WebSocket connection
 * @param socket - WebSocket client
 * @param req - HTTP request
 * @param wsApis - Registered WebSocket APIs
 */
function handleConnection(
  socket: WebSocket,
  req: any,
  wsApis: WebSocketApi[]
): void {
  const url = new URL(req.url || '', 'ws://localhost');
  const pathname = url.pathname;

  // Find matching endpoint
  for (const api of wsApis) {
    for (const [endpointName, config] of Object.entries(api.endpoints)) {
      const expectedPath = `/api/${api.namespace}/${endpointName}`;

      const pathParams = matchPath(pathname, expectedPath);
      if (pathParams !== null) {
        // Merge path params with query params
        const params: any = { ...pathParams };
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Validate params if schema provided
        if (config.params) {
          try {
            const validated = config.params.parse(params);
            handleEndpoint(socket, config, validated);
          } catch (error) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Invalid parameters'
            }));
            socket.close();
          }
        } else {
          handleEndpoint(socket, config, params);
        }
        return;
      }
    }
  }

  // No matching endpoint
  socket.send(JSON.stringify({
    type: 'error',
    message: 'Endpoint not found'
  }));
  socket.close();
}

/**
 * Match URL path against pattern with :param support
 * @param pathname - Actual URL path
 * @param pattern - Pattern with :param placeholders
 * @returns Extracted params or null if no match
 */
function matchPath(pathname: string, pattern: string): Record<string, string> | null {
  const pathParts = pathname.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // Extract param value
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      // Exact match required for non-param parts
      return null;
    }
  }

  return params;
}

/**
 * Handles WebSocket endpoint lifecycle
 * @param socket - WebSocket client
 * @param config - Endpoint configuration
 * @param params - Validated parameters
 */
function handleEndpoint(
  socket: WebSocket,
  config: any,
  params: any
): void {
  // Call onConnect handler
  try {
    config.onConnect(socket, params);
  } catch (error) {
    socket.send(JSON.stringify({ 
      type: 'error', 
      message: 'Connection handler failed' 
    }));
    socket.close();
    return;
  }

  // Setup message handler if provided
  if (config.onMessage) {
    socket.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        config.onMessage(socket, parsed);
      } catch (error) {
        // Ignore invalid messages
      }
    });
  }

  // Setup disconnect handler if provided
  if (config.onDisconnect) {
    socket.on('close', () => {
      config.onDisconnect(socket);
    });
  }
}
