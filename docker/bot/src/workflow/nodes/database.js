import { resolve } from '../context.js';

// Safely escape a MySQL identifier (table or column name)
function escId(name) {
  return '`' + String(name).replace(/`/g, '``') + '`';
}

// Build WHERE sql + params array from a WhereClause object
function buildWhereClause(whereClause, ctx) {
  if (!whereClause?.conditions?.length) return { sql: '', params: [] };
  const params = [];
  const parts = whereClause.conditions
    .filter(c => c.column)
    .map(c => {
      if (c.operator === 'IS NULL' || c.operator === 'IS NOT NULL') {
        return `${escId(c.column)} ${c.operator}`;
      }
      if (c.operator === 'IN' || c.operator === 'NOT IN') {
        const vals = String(c.value || '').split(',').map(v => resolve(v.trim(), ctx));
        params.push(...vals);
        return `${escId(c.column)} ${c.operator} (${vals.map(() => '?').join(', ')})`;
      }
      params.push(resolve(String(c.value ?? ''), ctx));
      return `${escId(c.column)} ${c.operator} ?`;
    });
  if (!parts.length) return { sql: '', params: [] };
  const conj = whereClause.conjunction === 'OR' ? 'OR' : 'AND';
  return { sql: 'WHERE ' + parts.join(` ${conj} `), params };
}

// Build the full SQL + params from a structured config object
function buildQuery(config, ctx) {
  const { mode, table } = config;

  // Legacy flat-query mode (for backwards compatibility)
  if (!mode) {
    const sql = resolve(config.query || '', ctx);
    return sql.trim() ? { sql, params: [] } : null;
  }

  if (!table && mode !== 'raw') return null;

  if (mode === 'raw') {
    const sql = resolve(config.sql || '', ctx);
    return sql.trim() ? { sql, params: [] } : null;
  }

  if (mode === 'select') {
    const cols = (config.selectColumns || []).length > 0
      ? config.selectColumns.map(escId).join(', ')
      : '*';
    const { sql: w, params: wp } = buildWhereClause(config.whereClauses, ctx);
    const orderParts = (config.orderByClauses || [])
      .filter(o => o.column)
      .map(o => `${escId(o.column)} ${o.dir === 'DESC' ? 'DESC' : 'ASC'}`);
    const order = orderParts.length ? `ORDER BY ${orderParts.join(', ')}` : '';
    const limitNum = parseInt(config.limit);
    const limit = !isNaN(limitNum) && limitNum > 0 ? `LIMIT ${limitNum}` : '';
    const sql = [`SELECT ${cols} FROM ${escId(table)}`, w, order, limit].filter(Boolean).join(' ');
    return { sql, params: wp };
  }

  if (mode === 'insert') {
    const pairs = (config.insertData || []).filter(p => p.column);
    if (!pairs.length) return null;
    const cols = pairs.map(p => escId(p.column)).join(', ');
    const params = pairs.map(p => resolve(String(p.value ?? ''), ctx));
    const sql = `INSERT INTO ${escId(table)} (${cols}) VALUES (${pairs.map(() => '?').join(', ')})`;
    return { sql, params };
  }

  if (mode === 'update') {
    const pairs = (config.updateData || []).filter(p => p.column);
    if (!pairs.length) return null;
    const setParts = pairs.map(p => `${escId(p.column)} = ?`).join(', ');
    const setParams = pairs.map(p => resolve(String(p.value ?? ''), ctx));
    const { sql: w, params: wp } = buildWhereClause(config.updateWhereClauses, ctx);
    const sql = `UPDATE ${escId(table)} SET ${setParts}${w ? ' ' + w : ''}`;
    return { sql, params: [...setParams, ...wp] };
  }

  if (mode === 'delete') {
    const { sql: w, params: wp } = buildWhereClause(config.deleteWhereClauses, ctx);
    const sql = `DELETE FROM ${escId(table)}${w ? ' ' + w : ''}`;
    return { sql, params: wp };
  }

  return null;
}

export async function executeAction(type, config, ctx) {
  if (type !== 'sqlDatabase') return null;

  if (!ctx.db) {
    console.warn('[sqlDatabase] No database connection in context');
    return { nextHandle: 'error' };
  }

  const built = buildQuery(config, ctx);
  if (!built || !built.sql.trim()) {
    console.warn('[sqlDatabase] Empty query');
    return { nextHandle: 'error' };
  }

  try {
    const [rows] = await ctx.db.promise().query(built.sql, built.params);
    const varName = config.resultVar || config.resultVariable;
    if (varName) ctx.variables[varName] = rows;
    return { nextHandle: 'success' };
  } catch (err) {
    console.error('[sqlDatabase] Error:', err.message);
    ctx.variables['__sqlError__'] = err.message;
    return { nextHandle: 'error' };
  }
}
