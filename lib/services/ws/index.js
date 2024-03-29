import WebSocket, { WebSocketServer } from 'ws';
import pino from '../log.js';

export default {
  broadcastToAll(type, payload) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  },
  start(server) {
    this.wss = new WebSocketServer({
      server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024, // Size (in bytes) below which messages
        // should not be compressed.
      },
    });
    this.wss.on('connection', (ws) => {
      pino.debug(' [WS] 💬 Client connected');
      ws.send(JSON.stringify({
        type: 'authenticated',
      }));
    });
    this.wss.on('message', (message) => {
      pino.debug(`[WS] 💬 message received ${message}`);
    });
    this.wss.on('close', () => {
      pino.debug('[WS] 💬 WS Closed');
    });
    this.wss.on('error', (error) => {
      pino.debug(`[WS] 💬 WS Error ${error}`);
    });
  },
};
