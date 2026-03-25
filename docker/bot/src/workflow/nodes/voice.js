import { resolve } from '../context.js';
// @napi-rs/canvas is already available; voice requires @discordjs/voice + ytdl-core (optional)
// We import them lazily so the bot starts even if they are not installed.

// Resolve the target voice channel ID based on config mode:
// - 'user'   → channel where the triggering user is currently connected
// - 'custom' (default) → config.voiceChannelId (supports variables)
function resolveVcId(config, ctx) {
  if ((config.voiceChannelMode ?? 'user') === 'user') {
    const member = ctx.member ?? ctx.message?.member ?? ctx.interaction?.member;
    const vcId = member?.voice?.channelId;
    if (!vcId) throw new Error('L\'utilisateur n\'est pas connecté à un salon vocal.');
    return vcId;
  }
  return resolve(config.voiceChannelId || '', ctx);
}

let voiceModule = null;
async function getVoice() {
  if (!voiceModule) {
    const { joinVoiceChannel: jvc, createAudioPlayer, createAudioResource,
            AudioPlayerStatus, VoiceConnectionStatus, entersState,
            getVoiceConnection } = await import('@discordjs/voice');
    voiceModule = { jvc, createAudioPlayer, createAudioResource,
                    AudioPlayerStatus, VoiceConnectionStatus,
                    entersState, getVoiceConnection };
  }
  return voiceModule;
}

// Active players per guild  { guildId: AudioPlayer }
const activePlayers = new Map();

export async function executeAction(type, config, ctx) {
  const guild = ctx.guild ?? ctx.message?.guild ?? ctx.interaction?.guild;

  // ── Join Voice ─────────────────────────────────────────────────────────────
  if (type === 'joinVoiceChannel') {
    const v = await getVoice();
    const channelId = resolveVcId(config, ctx);
    if (!guild || !channelId) throw new Error('joinVoiceChannel: guild and voiceChannelId required');
    const channel = await ctx.client.channels.fetch(channelId);
    const connection = v.jvc({
      channelId:      channel.id,
      guildId:        guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute:       !!config.selfMute,
      selfDeaf:       config.selfDeaf !== false,
    });
    await v.entersState(connection, v.VoiceConnectionStatus.Ready, 15_000);
    return { nextHandle: 'output' };
  }

  // ── Leave Voice ────────────────────────────────────────────────────────────
  if (type === 'leaveVoiceChannel') {
    const v = await getVoice();
    if (!guild) throw new Error('leaveVoiceChannel: guild not available');
    const connection = v.getVoiceConnection(guild.id);
    if (connection) connection.destroy();
    activePlayers.delete(guild.id);
    return { nextHandle: 'output' };
  }

  // ── Play Audio ─────────────────────────────────────────────────────────────
  if (type === 'playAudio') {
    const v = await getVoice();
    if (!guild) throw new Error('playAudio: guild not available');
    const connection = v.getVoiceConnection(guild.id);
    if (!connection) throw new Error('playAudio: bot is not in a voice channel (use Join Voice first)');

    const source = config.audioSource || 'url';
    const rawUrl  = resolve(config.audioUrl || '', ctx);
    let resource;

    if (source === 'youtube') {
      // lazy import ytdl-core / play-dl
      let stream;
      try {
        const ytdl = (await import('@distube/ytdl-core')).default;
        stream = ytdl(rawUrl, { filter: 'audioonly', quality: 'highestaudio' });
      } catch {
        const play = await import('play-dl');
        const info = await play.stream(rawUrl);
        stream = info.stream;
      }
      resource = v.createAudioResource(stream, { inlineVolume: true });
    } else if (source === 'variable') {
      const buf = ctx.variables[rawUrl.replace(/^\{variable\./, '').replace(/\}$/, '')];
      if (!buf) throw new Error('playAudio: variable not found or empty');
      const { Readable } = await import('stream');
      resource = v.createAudioResource(Readable.from(buf), { inlineVolume: true });
    } else {
      // direct URL or local file path
      resource = v.createAudioResource(rawUrl, { inlineVolume: true });
    }

    const volume = Number(config.volume ?? 100) / 100;
    resource.volume?.setVolume(volume);

    const player = v.createAudioPlayer();
    activePlayers.set(guild.id, player);
    connection.subscribe(player);
    player.play(resource);

    if (config.waitForEnd !== false) {
      await v.entersState(player, v.AudioPlayerStatus.Idle, 10 * 60 * 1000);
    }
    return { nextHandle: 'success' };
  }

  // ── Stop Audio ─────────────────────────────────────────────────────────────
  if (type === 'stopAudio') {
    if (!guild) throw new Error('stopAudio: guild not available');
    const player = activePlayers.get(guild.id);
    if (player) { player.stop(); activePlayers.delete(guild.id); }
    return { nextHandle: 'output' };
  }

  // ── Move Member to Voice ───────────────────────────────────────────────────
  if (type === 'moveToVoice') {
    const userId    = resolve(config.userId || '', ctx);
    const channelId = resolveVcId(config, ctx);
    if (!guild) throw new Error('moveToVoice: guild not available');
    const member  = await guild.members.fetch(userId);
    const channel = await ctx.client.channels.fetch(channelId);
    await member.voice.setChannel(channel);
    return { nextHandle: 'output' };
  }

  // ── Disconnect Member from Voice ───────────────────────────────────────────
  if (type === 'disconnectFromVoice') {
    const userId = resolve(config.userId || '', ctx);
    if (!guild) throw new Error('disconnectFromVoice: guild not available');
    const member = await guild.members.fetch(userId);
    await member.voice.disconnect();
    return { nextHandle: 'output' };
  }

  return null;
}
