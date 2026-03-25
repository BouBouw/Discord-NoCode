/**
 * dbController.js
 * REST API for the built-in database visualizer.
 * All operations target the bot's embedded MySQL (via botDbService).
 * Ownership is verified on every request.
 */
import { z } from 'zod';
import { getBotById } from '../services/botService.js';
import { getBotDbPool, clearBotDbPool, validateIdentifier, validateColumnType } from '../services/botDbService.js';

const botIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Bot ID must be a number').transform(v => parseInt(v, 10)),
});

/** Shared helper: validate ownership + obtain pool, then run callback. */
async function withBotDb(req, res, callback) {
  const parsed = botIdSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });
  }

  const bot = await getBotById(parsed.data.id, req.user.userId);
  if (!bot) return res.status(404).json({ error: 'NOT_FOUND' });

  try {
    const pool = await getBotDbPool(bot.id);
    await callback(pool, bot);
  } catch (err) {
    console.error('[DB Visualizer]', err.message);
    const isConnErr = err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'DB_UNAVAILABLE';
    res.status(isConnErr ? 503 : 500).json({
      error: isConnErr ? 'DB_UNAVAILABLE' : 'DB_ERROR',
      message: err.message,
    });
  }
}

// ─── Tables ───────────────────────────────────────────────────────────────

/** GET /api/bots/:id/db/tables */
export async function listTables(req, res) {
  await withBotDb(req, res, async pool => {
    const [tables] = await pool.query('SHOW TABLE STATUS');
    res.json(
      tables.map(t => ({
        name:       t.Name,
        rows:       t.Rows,
        engine:     t.Engine,
        collation:  t.Collation,
        dataLength: t.Data_length,
        createTime: t.Create_time,
      }))
    );
  });
}

const createTableSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid table name'),
  columns: z.array(z.object({
    name:          z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid column name'),
    type:          z.string().regex(/^[a-zA-Z0-9_\s(),'"]+$/, 'Invalid column type'),
    primaryKey:    z.boolean().optional(),
    autoIncrement: z.boolean().optional(),
    notNull:       z.boolean().optional(),
    defaultValue:  z.string().optional(),
  })).min(1, 'At least one column required'),
});

/** POST /api/bots/:id/db/tables  { name, columns[] } */
export async function createTable(req, res) {
  const parsed = createTableSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });

  await withBotDb(req, res, async pool => {
    const { name, columns } = parsed.data;

    const colDefs = columns.map(col => {
      let def = `\`${col.name}\` ${col.type}`;
      if (col.notNull)       def += ' NOT NULL';
      if (col.autoIncrement) def += ' AUTO_INCREMENT';
      if (col.defaultValue !== undefined && col.defaultValue !== '') {
        def += ` DEFAULT '${col.defaultValue.replace(/'/g, "''")}'`;
      }
      return def;
    });

    const pk = columns.find(c => c.primaryKey);
    if (pk) colDefs.push(`PRIMARY KEY (\`${pk.name}\`)`);

    await pool.query(
      `CREATE TABLE \`${name}\` (${colDefs.join(', ')}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
    res.json({ success: true });
  });
}

/** DELETE /api/bots/:id/db/tables/:table */
export async function dropTable(req, res) {
  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    await pool.query(`DROP TABLE \`${table}\``);
    res.json({ success: true });
  });
}

// ─── Columns ──────────────────────────────────────────────────────────────

/** GET /api/bots/:id/db/tables/:table/structure */
export async function getTableStructure(req, res) {
  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    const [columns] = await pool.query(`DESCRIBE \`${table}\``);
    const [indexes] = await pool.query(`SHOW INDEX FROM \`${table}\``);
    res.json({ columns, indexes });
  });
}

const addColumnSchema = z.object({
  name:         z.string().regex(/^[a-zA-Z0-9_]+$/),
  type:         z.string().regex(/^[a-zA-Z0-9_\s(),'"]+$/),
  notNull:      z.boolean().optional(),
  defaultValue: z.string().optional(),
});

/** POST /api/bots/:id/db/tables/:table/columns  { name, type, notNull?, defaultValue? } */
export async function addColumn(req, res) {
  const parsed = addColumnSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });

  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    const { name, type, notNull, defaultValue } = parsed.data;

    let sql = `ALTER TABLE \`${table}\` ADD COLUMN \`${name}\` ${type}`;
    if (notNull) sql += ' NOT NULL';
    if (defaultValue !== undefined && defaultValue !== '') {
      sql += ` DEFAULT '${defaultValue.replace(/'/g, "''")}'`;
    }
    await pool.query(sql);
    res.json({ success: true });
  });
}

/** DELETE /api/bots/:id/db/tables/:table/columns/:column */
export async function dropColumn(req, res) {
  await withBotDb(req, res, async pool => {
    const table  = validateIdentifier(req.params.table);
    const column = validateIdentifier(req.params.column);
    await pool.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
    res.json({ success: true });
  });
}

// ─── Rows ─────────────────────────────────────────────────────────────────

/** GET /api/bots/:id/db/tables/:table/rows?page=1&limit=25 */
export async function getTableRows(req, res) {
  await withBotDb(req, res, async pool => {
    const table  = validateIdentifier(req.params.table);
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
    const [rows]        = await pool.query(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [limit, offset]);

    res.json({ rows, total, page, limit, pages: Math.ceil(total / limit) });
  });
}

/** POST /api/bots/:id/db/tables/:table/rows  { col: val, ... } */
export async function insertRow(req, res) {
  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    const data  = req.body;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Body must be a plain object' });
    }

    const cols = Object.keys(data).map(validateIdentifier);
    const vals = Object.values(data);
    const [result] = await pool.query(
      `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      vals
    );
    res.json({ success: true, insertId: result.insertId });
  });
}

/** PUT /api/bots/:id/db/tables/:table/rows  { where: {col: val}, data: {col: val} } */
export async function updateRow(req, res) {
  const schema = z.object({
    where: z.record(z.unknown()).refine(o => Object.keys(o).length > 0, 'where must not be empty'),
    data:  z.record(z.unknown()).refine(o => Object.keys(o).length > 0, 'data must not be empty'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });

  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    const { where, data } = parsed.data;

    const setClause   = Object.keys(data).map(k  => `\`${validateIdentifier(k)}\` = ?`).join(', ');
    const whereClause = Object.keys(where).map(k  => `\`${validateIdentifier(k)}\` = ?`).join(' AND ');

    await pool.query(
      `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause} LIMIT 1`,
      [...Object.values(data), ...Object.values(where)]
    );
    res.json({ success: true });
  });
}

/** DELETE /api/bots/:id/db/tables/:table/rows  { where: {col: val, ...} } */
export async function deleteRow(req, res) {
  const schema = z.object({
    where: z.record(z.unknown()).refine(o => Object.keys(o).length > 0, 'where must not be empty'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });

  await withBotDb(req, res, async pool => {
    const table = validateIdentifier(req.params.table);
    const { where } = parsed.data;

    const whereClause = Object.keys(where).map(k => `\`${validateIdentifier(k)}\` = ?`).join(' AND ');
    await pool.query(
      `DELETE FROM \`${table}\` WHERE ${whereClause} LIMIT 1`,
      Object.values(where)
    );
    res.json({ success: true });
  });
}

// ─── SQL runner ───────────────────────────────────────────────────────────

/** POST /api/bots/:id/db/query  { sql: "SELECT ..." } */
export async function executeQuery(req, res) {
  const schema = z.object({ sql: z.string().min(1).max(10000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.errors });

  await withBotDb(req, res, async pool => {
    const start = Date.now();
    const [rows, fields] = await pool.query(parsed.data.sql);
    const duration = Date.now() - start;

    if (Array.isArray(rows)) {
      res.json({
        type:     'SELECT',
        rows,
        fields:   fields?.map(f => f.name) ?? [],
        duration,
      });
    } else {
      res.json({
        type:         'MODIFY',
        affectedRows: rows.affectedRows,
        insertId:     rows.insertId,
        duration,
      });
    }
  });
}

// ─── Purge ────────────────────────────────────────────────────────────────

/** POST /api/bots/:id/db/purge  — drop + recreate the database */
export async function purgeDb(req, res) {
  await withBotDb(req, res, async (pool, bot) => {
    const dbName = `bot_${bot.id}`;
    await pool.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await pool.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await pool.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO 'botuser'@'%'`);
    await pool.query('FLUSH PRIVILEGES');
    // Invalidate pool — next request will reconnect to the fresh database
    clearBotDbPool(bot.id);
    res.json({ success: true });
  });
}
