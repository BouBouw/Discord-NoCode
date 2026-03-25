import { resolve } from '../context.js';

// Active rotation timers per botId/guildId  { key: intervalId }
const rotationTimers = new Map();

export async function executeAction(type, config, ctx) {
  const client = ctx.client;

  // ── Set Bot Presence ───────────────────────────────────────────────────────
  if (type === 'setBotPresence') {
    const status   = config.status || 'online';
    const actType  = config.activityType || 'Playing';
    const actText  = resolve(config.activityText || '', ctx);
    const streamUrl = resolve(config.streamUrl || '', ctx);

    // Map text to discord.js ActivityType enum value
    const ACTIVITY_MAP = {
      Playing:    0,
      Streaming:  1,
      Listening:  2,
      Watching:   3,
      Custom:     4,
      Competing:  5,
    };
    const typeVal = ACTIVITY_MAP[actType] ?? 0;

    // Stop any existing rotation for this client
    const timerKey = client.user?.id;
    if (timerKey && rotationTimers.has(timerKey)) {
      clearInterval(rotationTimers.get(timerKey));
      rotationTimers.delete(timerKey);
    }

    // Rotation mode
    const rawLines = (config.rotationActivities || '').split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length > 1) {
      const interval = Math.max(5, Number(config.rotationInterval) || 30) * 1000;
      let idx = 0;
      const applyPresence = (text) => {
        client.user.setPresence({
          status,
          activities: [{ name: text, type: typeVal, url: typeVal === 1 ? streamUrl || undefined : undefined }],
        });
      };
      applyPresence(rawLines[0]);
      const timer = setInterval(() => {
        idx = (idx + 1) % rawLines.length;
        applyPresence(rawLines[idx]);
      }, interval);
      if (timerKey) rotationTimers.set(timerKey, timer);
    } else {
      // Single / static presence
      client.user.setPresence({
        status,
        activities: actText
          ? [{ name: actText, type: typeVal, url: typeVal === 1 ? streamUrl || undefined : undefined }]
          : [],
      });
    }
    return { nextHandle: 'output' };
  }

  // ── Set Bot Nickname ───────────────────────────────────────────────────────
  if (type === 'setBotNickname') {
    const guild = ctx.guild ?? ctx.message?.guild ?? ctx.interaction?.guild;
    if (!guild) throw new Error('setBotNickname: guild context required');
    const nickname = resolve(config.nickname || '', ctx) || null; // null resets it
    const me = await guild.members.fetchMe();
    await me.setNickname(nickname);
    return { nextHandle: 'output' };
  }

  // ── Set Bot Avatar ─────────────────────────────────────────────────────────
  if (type === 'setBotAvatar') {
    let avatar = resolve(config.avatarUrl || '', ctx);
    // If stored as a variable buffer (canvas output), look it up
    const varMatch = avatar.match(/^\{variable\.([^}]+)\}$/);
    if (varMatch) {
      avatar = ctx.variables[varMatch[1]];
      if (!avatar) throw new Error('setBotAvatar: variable not found');
    }
    await client.user.setAvatar(avatar);
    return { nextHandle: 'output' };
  }

  return null;
}
