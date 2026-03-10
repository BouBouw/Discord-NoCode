import { WebSocketServer } from 'ws';

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return wss;
}
