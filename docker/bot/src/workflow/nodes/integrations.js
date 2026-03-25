import { resolve } from '../context.js';

/**
 * Phase 3 — Integration triggers:
 *   twitchLive, youtubeNewVideo
 *
 * These nodes are *trigger* nodes (no input handles). They are registered
 * in workflowHandler.js and poll external services at intervals.
 * This file provides helper registration functions called from the handler.
 */

// ─── Twitch Live Polling ─────────────────────────────────────────────────────

/**
 * Register a Twitch live poller for a trigger node.
 * @param {object} node     - The workflow node
 * @param {object} handler  - The WorkflowHandler instance
 */
export function registerTwitchLive(node, handler) {
  const config         = node.config || {};
  const twitchUsername = config.twitchUsername || '';
  const clientId       = config.twitchClientId || process.env.TWITCH_CLIENT_ID || '';
  const clientSecret   = config.twitchClientSecret || process.env.TWITCH_CLIENT_SECRET || '';
  const intervalSec    = Math.max(60, Number(config.pollInterval) || 120); // min 60s

  if (!twitchUsername) {
    console.warn('[twitchLive] No Twitch username configured, skipping');
    return;
  }

  let accessToken = null;
  let tokenExpiresAt = 0;
  let wasLive = false;

  async function getToken() {
    if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
    if (!clientId || !clientSecret) return null;

    const res = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`,
    });

    if (!res.ok) return null;
    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    return accessToken;
  }

  async function poll() {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(twitchUsername)}`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) return;
      const data = await res.json();
      const stream = data.data?.[0];
      const isLive = !!stream;

      if (isLive && !wasLive) {
        // Streamer just went live — trigger workflow
        const ctx = handler._makeCtx({});
        ctx.variables['twitch.username']   = twitchUsername;
        ctx.variables['twitch.title']      = stream.title || '';
        ctx.variables['twitch.game']       = stream.game_name || '';
        ctx.variables['twitch.viewers']    = String(stream.viewer_count || 0);
        ctx.variables['twitch.thumbnail']  = (stream.thumbnail_url || '')
          .replace('{width}', '440')
          .replace('{height}', '248');
        ctx.variables['twitch.url']        = `https://twitch.tv/${twitchUsername}`;
        ctx.variables['twitch.startedAt']  = stream.started_at || '';

        handler._emit('node_start', { nodeId: String(node.id) });
        try {
          await handler._executeFrom(node, ctx, 'output');
          handler._emit('node_done', { nodeId: String(node.id) });
        } catch (err) {
          console.error('[twitchLive] Workflow error:', err);
          handler._emit('node_error', { nodeId: String(node.id), error: err.message });
        }
      }

      wasLive = isLive;
    } catch (err) {
      console.error('[twitchLive] Poll error:', err.message);
    }
  }

  setInterval(poll, intervalSec * 1000);
  poll(); // Initial check
  console.log(`[twitchLive] Polling ${twitchUsername} every ${intervalSec}s`);
}

// ─── YouTube New Video Polling (RSS) ─────────────────────────────────────────

/**
 * Register a YouTube video poller for a trigger node.
 * @param {object} node     - The workflow node
 * @param {object} handler  - The WorkflowHandler instance
 */
export function registerYoutubeNewVideo(node, handler) {
  const config      = node.config || {};
  const channelId   = config.youtubeChannelId || '';
  const intervalSec = Math.max(120, Number(config.pollInterval) || 300); // min 2min

  if (!channelId) {
    console.warn('[youtubeNewVideo] No YouTube channel ID configured, skipping');
    return;
  }

  let lastVideoId = null;

  async function poll() {
    try {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
      const res = await fetch(feedUrl);
      if (!res.ok) return;

      const xml = await res.text();

      // Simple XML parsing for <entry> blocks
      const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
      if (!entryMatch) return;

      const entry     = entryMatch[1];
      const videoId   = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
      const title     = entry.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
      const author    = entry.match(/<name>(.*?)<\/name>/)?.[1] || '';

      if (!videoId) return;

      if (lastVideoId === null) {
        // First poll — just record, don't trigger
        lastVideoId = videoId;
        return;
      }

      if (videoId !== lastVideoId) {
        lastVideoId = videoId;

        // New video — trigger workflow
        const ctx = handler._makeCtx({});
        ctx.variables['youtube.videoId']    = videoId;
        ctx.variables['youtube.title']      = title;
        ctx.variables['youtube.url']        = `https://www.youtube.com/watch?v=${videoId}`;
        ctx.variables['youtube.channelId']  = channelId;
        ctx.variables['youtube.author']     = author;
        ctx.variables['youtube.publishedAt'] = published;

        handler._emit('node_start', { nodeId: String(node.id) });
        try {
          await handler._executeFrom(node, ctx, 'output');
          handler._emit('node_done', { nodeId: String(node.id) });
        } catch (err) {
          console.error('[youtubeNewVideo] Workflow error:', err);
          handler._emit('node_error', { nodeId: String(node.id), error: err.message });
        }
      }
    } catch (err) {
      console.error('[youtubeNewVideo] Poll error:', err.message);
    }
  }

  setInterval(poll, intervalSec * 1000);
  poll(); // Initial check
  console.log(`[youtubeNewVideo] Polling channel ${channelId} every ${intervalSec}s`);
}
