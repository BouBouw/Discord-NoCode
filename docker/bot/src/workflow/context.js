/**
 * Template resolver for workflow node config values.
 *
 * Supported placeholders:
 *   {interaction.user.id}   — slash command author
 *   {user.id}               — user (command or event)
 *   {member.id}             — guild member
 *   {guild.id}              — guild
 *   {channel.id}            — channel
 *   {message.content}       — message (messageCreate etc.)
 *   {args.paramName}        — slash command option value
 *   {variable.myVar}        — runtime variable stored by a Variable node
 *   {bot.id}                — bot user id
 */
export function resolve(value, ctx) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{([^}]+)\}/g, (match, path) => {
    const result = getPath(ctx, path.trim());
    return result !== undefined && result !== null ? String(result) : match;
  });
}

function getPath(ctx, path) {
  const parts = path.split('.');
  const [root, ...rest] = parts;
  let obj;

  switch (root) {
    case 'interaction': obj = ctx.interaction; break;
    case 'user':    obj = ctx.interaction?.user   ?? ctx.event?.[0]?.user   ?? ctx.event?.[0]?.author; break;
    case 'member':  obj = ctx.interaction?.member ?? ctx.event?.[0]?.member; break;
    case 'guild':   obj = ctx.interaction?.guild  ?? ctx.event?.[0]?.guild  ?? ctx.event?.[1]?.guild;  break;
    case 'channel': obj = ctx.interaction?.channel ?? ctx.event?.[0]?.channel; break;
    case 'message': obj = (ctx.event || [])[0]; break;
    case 'args':    return ctx.interaction?.options?.get(rest[0])?.value ?? '';
    case 'variable': return ctx.variables?.[rest[0]] ?? '';
    case 'bot':     obj = ctx.client?.user; break;
    default:        return undefined;
  }

  if (!obj || !rest.length) return obj;
  return rest.reduce((o, k) => o?.[k], obj);
}

/**
 * Resolve the target channel from a node's channel config + execution context.
 *
 * channelSourceMode: 'current' | 'custom'
 * channelCustomMode: 'id' | 'db'
 */
export async function resolveChannel(config, ctx) {
  const mode = config.channelSourceMode ?? 'current';

  if (mode === 'current') {
    return ctx.interaction?.channel ?? (ctx.event || [])[0]?.channel ?? null;
  }

  if (config.channelCustomMode === 'db') {
    const table  = resolve(config.channelDbTable  || '', ctx);
    const column = resolve(config.channelDbColumn || 'channel_id', ctx);
    const where  = resolve(config.channelDbWhere  || '', ctx);
    if (!table) return null;

    const sql = `SELECT \`${column}\` FROM \`${table}\`${where ? ` WHERE ${where}` : ''} LIMIT 1`;
    try {
      const [rows] = await ctx.db.promise().query(sql);
      const channelId = rows[0]?.[column];
      if (!channelId) return null;
      return ctx.client.channels.fetch(String(channelId)).catch(() => null);
    } catch {
      return null;
    }
  }

  // id mode
  const channelId = resolve(config.channelId || '', ctx);
  if (!channelId) return null;
  return ctx.client.channels.fetch(channelId).catch(() => null);
}
