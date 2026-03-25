import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/jwt.js';

const COLLAB_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#F7DC6F', '#DDA0DD', '#FF8C42', '#6C5CE7',
];

// workflowId → Map<WebSocket, { userId, email, color } | null>
const rooms = new Map();

function getRoom(wfId) {
  const id = Number(wfId);
  if (!rooms.has(id)) rooms.set(id, new Map());
  return rooms.get(id);
}

function assignColor(wfId) {
  const room = getRoom(wfId);
  const used = new Set([...room.values()].filter(Boolean).map(u => u.color));
  return COLLAB_COLORS.find(c => !used.has(c)) || COLLAB_COLORS[room.size % COLLAB_COLORS.length];
}

function broadcastToRoom(wfId, msg, excludeWs = null) {
  const room = getRoom(wfId);
  const payload = JSON.stringify(msg);
  for (const [ws] of room) {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(payload);
  }
}

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    let watchedId = null;
    let userInfo = null;

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'subscribe' && data.workflowId) {
          // Leave previous room
          if (watchedId !== null) {
            const prev = getRoom(watchedId);
            prev.delete(ws);
            if (userInfo) broadcastToRoom(watchedId, { type: 'user_left', userId: userInfo.userId });
            if (prev.size === 0) rooms.delete(Number(watchedId));
          }

          watchedId = Number(data.workflowId);

          // Authenticate via JWT
          if (data.token) {
            try {
              const decoded = verifyToken(data.token);
              userInfo = { userId: decoded.userId, email: decoded.email || `User ${decoded.userId}`, color: assignColor(watchedId) };
            } catch { userInfo = null; }
          }

          const room = getRoom(watchedId);
          room.set(ws, userInfo);

          if (userInfo) {
            // Send list of current collaborators to the new user
            const users = [...room.values()].filter(u => u && u.userId !== userInfo.userId);
            ws.send(JSON.stringify({ type: 'users_list', users }));
            // Notify others
            broadcastToRoom(watchedId, { type: 'user_joined', userId: userInfo.userId, email: userInfo.email, color: userInfo.color }, ws);
          }
        }

        else if (data.type === 'unsubscribe') {
          if (watchedId !== null) {
            const room = getRoom(watchedId);
            room.delete(ws);
            if (userInfo) broadcastToRoom(watchedId, { type: 'user_left', userId: userInfo.userId });
            if (room.size === 0) rooms.delete(Number(watchedId));
          }
          watchedId = null;
          userInfo = null;
        }

        // Collaboration events — relay to others in the room
        else if (watchedId !== null && userInfo) {
          const relay = (type, extra = {}) =>
            broadcastToRoom(watchedId, { type, userId: userInfo.userId, color: userInfo.color, email: userInfo.email, ...extra }, ws);

          switch (data.type) {
            case 'cursor_move':    relay('cursor_update', { x: data.x, y: data.y }); break;
            case 'node_drag':      relay('node_dragged', { nodeId: data.nodeId, x: data.x, y: data.y }); break;
            case 'node_drag_end':  relay('node_drag_ended', { nodeId: data.nodeId, x: data.x, y: data.y }); break;
            case 'node_add':       relay('node_added', { node: data.node }); break;
            case 'node_remove':    relay('node_removed', { nodeId: data.nodeId }); break;
            case 'edge_add':       relay('edge_added', { edge: data.edge }); break;
            case 'edge_remove':    relay('edge_removed', { edgeId: data.edgeId }); break;
            case 'node_config_update': relay('node_config_updated', { nodeId: data.nodeId, config: data.config }); break;
            case 'node_select':    relay('node_selected', { nodeId: data.nodeId }); break;
            case 'nodes_edges_sync': relay('nodes_edges_synced', { nodes: data.nodes, edges: data.edges }); break;
            case 'workflow_saved': relay('workflow_saved'); break;
          }
        }
      } catch { /* ignore malformed messages */ }
    });

    ws.on('close', () => {
      if (watchedId !== null) {
        const room = rooms.get(Number(watchedId));
        if (room) {
          room.delete(ws);
          if (userInfo) broadcastToRoom(watchedId, { type: 'user_left', userId: userInfo.userId });
          if (room.size === 0) rooms.delete(Number(watchedId));
        }
      }
    });
  });

  return wss;
}

export function broadcastExecutionEvent(workflowId, event) {
  const room = rooms.get(Number(workflowId));
  if (!room?.size) return;
  const payload = JSON.stringify(event);
  for (const [ws] of room) {
    if (ws.readyState === 1) ws.send(payload);
  }
}
