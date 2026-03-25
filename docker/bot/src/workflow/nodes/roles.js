import { resolve } from '../context.js';

export async function executeAction(type, config, ctx) {
  const guild = ctx.interaction?.guild ?? ctx.event?.[0]?.guild ?? ctx.event?.[1]?.guild;
  if (!guild) { console.warn(`[${type}] No guild in context`); return { nextHandle: 'output' }; }

  // ── addRole / removeRole ───────────────────────────────────────────────────
  if (type === 'addRole' || type === 'removeRole') {
    const userId = resolve(config.userId || '', ctx);
    const roleId = resolve(config.roleId  || '', ctx);
    if (!userId || !roleId) return { nextHandle: 'output' };

    const [member, role] = await Promise.all([
      guild.members.fetch(userId).catch(() => null),
      guild.roles.fetch(roleId).catch(() => null),
    ]);
    if (!member || !role) return { nextHandle: 'output' };

    const reason = config.reason ? resolve(config.reason, ctx) : undefined;
    if (type === 'addRole') await member.roles.add(role, reason);
    else                    await member.roles.remove(role, reason);
    return { nextHandle: 'output' };
  }

  // ── createRole ─────────────────────────────────────────────────────────────
  if (type === 'createRole') {
    const name = resolve(config.name || 'new role', ctx);
    await guild.roles.create({
      name,
      color:       config.color       || undefined,
      hoist:       !!config.hoist,
      mentionable: !!config.mentionable,
    });
    return { nextHandle: 'output' };
  }

  return null;
}
