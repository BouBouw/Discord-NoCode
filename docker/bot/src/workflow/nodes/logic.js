import { resolve } from '../context.js';

const UNIT_MS = { ms: 1, s: 1_000, minutes: 60_000, hours: 3_600_000 };

function compare(left, op, right) {
  switch (op) {
    case '==':         return String(left) === String(right);
    case '!=':         return String(left) !== String(right);
    case '>':          return Number(left) > Number(right);
    case '<':          return Number(left) < Number(right);
    case '>=':         return Number(left) >= Number(right);
    case '<=':         return Number(left) <= Number(right);
    case 'contains':   return String(left).includes(String(right));
    case 'startsWith': return String(left).startsWith(String(right));
    case 'endsWith':   return String(left).endsWith(String(right));
    case 'match':      try { return new RegExp(String(right)).test(String(left)); } catch { return false; }
    default:           return false;
  }
}

export async function executeAction(type, config, ctx) {

  // ── condition ──────────────────────────────────────────────────────────────
  if (type === 'condition') {
    const left   = resolve(config.leftValue  || '', ctx);
    const right  = resolve(config.rightValue || '', ctx);
    const result = compare(left, config.operator || '==', right);
    return { nextHandle: result ? 'true' : 'false' };
  }

  // ── delay ──────────────────────────────────────────────────────────────────
  if (type === 'delay') {
    const ms = (Number(config.duration) || 1000) * (UNIT_MS[config.unit || 'ms'] || 1);
    await new Promise(r => setTimeout(r, Math.min(ms, 300_000))); // cap at 5 min
    return { nextHandle: 'output' };
  }

  // ── variable ───────────────────────────────────────────────────────────────
  if (type === 'variable') {
    const name = config.name || '__unnamed__';
    if (config.operation === 'delete') {
      delete ctx.variables[name];
    } else {
      ctx.variables[name] = resolve(config.value ?? '', ctx);
    }
    return { nextHandle: 'output' };
  }

  // ── mathOperation ──────────────────────────────────────────────────────────
  if (type === 'mathOperation') {
    const a = Number(resolve(config.a || '0', ctx));
    const b = Number(resolve(config.b || '0', ctx));
    let result;
    switch (config.operator) {
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 0; break;
      case '%': result = b !== 0 ? a % b : 0; break;
      default:  result = a + b; // '+'
    }
    if (config.resultVariable) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── random ─────────────────────────────────────────────────────────────────
  if (type === 'random') {
    const min    = Number(config.min || 0);
    const max    = Number(config.max || 100);
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    if (config.resultVariable) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── counter ────────────────────────────────────────────────────────────────
  if (type === 'counter') {
    const name    = config.variable || '__counter__';
    const amount  = Number(config.amount || 1);
    const current = Number(ctx.variables[name] || 0);
    switch (config.operation) {
      case 'decrement': ctx.variables[name] = current - amount; break;
      case 'reset':     ctx.variables[name] = 0; break;
      default:          ctx.variables[name] = current + amount; // increment
    }
    return { nextHandle: 'output' };
  }

  // ── switchCase ─────────────────────────────────────────────────────────────
  if (type === 'switchCase') {
    const val   = resolve(config.value || '', ctx);
    const match = (config.cases || []).find(c => String(c.value) === String(val));
    return { nextHandle: match?.handle || 'default' };
  }

  // ── forEach / filter  ────────────────────────────────────────────────────
  if (type === 'forEach') {
    const listVar  = config.listVariable || '';
    const itemVar  = config.itemVariable || 'item';
    const raw      = ctx.variables[listVar] ?? '';
    let items;
    try { items = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { /* not JSON */ }
    if (!Array.isArray(items)) {
      // Treat as comma-separated list
      items = String(raw).split(',').map(s => s.trim()).filter(Boolean);
    }
    return { nextHandle: 'done', _forEach: { items, itemVar } };
  }

  if (type === 'filter') {
    const listVar  = config.listVariable || '';
    const raw      = ctx.variables[listVar] ?? '';
    let items;
    try { items = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { /* not JSON */ }
    if (!Array.isArray(items)) {
      items = String(raw).split(',').map(s => s.trim()).filter(Boolean);
    }
    const field    = config.field;
    const op       = config.operator || '==';
    const expected = resolve(config.filterValue || '', ctx);
    const matched  = items.filter(item => {
      const actual = field ? (item?.[field] ?? '') : item;
      return compare(String(actual), op, expected);
    });
    if (config.resultVariable) ctx.variables[config.resultVariable] = JSON.stringify(matched);
    return { nextHandle: matched.length > 0 ? 'match' : 'noMatch' };
  }

  // ── stringOperation ─────────────────────────────────────────────────────────
  if (type === 'stringOperation') {
    const input = String(resolve(config.input || '', ctx));
    const op = config.operation || 'uppercase';
    const search = String(resolve(config.search || '', ctx));
    const replacement = String(resolve(config.replacement || '', ctx));
    let result;
    switch (op) {
      case 'uppercase':    result = input.toUpperCase(); break;
      case 'lowercase':    result = input.toLowerCase(); break;
      case 'trim':         result = input.trim(); break;
      case 'trimStart':    result = input.trimStart(); break;
      case 'trimEnd':      result = input.trimEnd(); break;
      case 'length':       result = input.length; break;
      case 'replace':      result = input.replaceAll(search, replacement); break;
      case 'replaceFirst': result = input.replace(search, replacement); break;
      case 'split':        result = JSON.stringify(input.split(String(resolve(config.separator ?? ',', ctx)))); break;
      case 'includes':     result = String(input.includes(search)); break;
      case 'startsWith':   result = String(input.startsWith(search)); break;
      case 'endsWith':     result = String(input.endsWith(search)); break;
      case 'indexOf':      result = input.indexOf(search); break;
      case 'slice':        result = input.slice(Number(config.start || 0), config.end !== '' && config.end != null ? Number(config.end) : undefined); break;
      case 'reverse':      result = input.split('').reverse().join(''); break;
      case 'repeat':       result = input.repeat(Math.min(Number(config.count || 1), 100)); break;
      case 'padStart':     result = input.padStart(Number(config.count || 0), String(config.padChar || ' ')); break;
      case 'padEnd':       result = input.padEnd(Number(config.count || 0), String(config.padChar || ' ')); break;
      default:             result = input;
    }
    if (config.resultVariable) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── arrayOperation ───────────────────────────────────────────────────────────
  if (type === 'arrayOperation') {
    const listVar = config.listVariable || '__arr__';
    const raw = ctx.variables[listVar] ?? '[]';
    let arr;
    try { arr = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { arr = []; }
    if (!Array.isArray(arr)) arr = [];
    const value = resolve(config.value || '', ctx);
    const op = config.operation || 'length';
    let result;
    switch (op) {
      case 'push':    arr.push(value); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'pop':     result = arr.pop(); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'shift':   result = arr.shift(); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'unshift': arr.unshift(value); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'includes': result = String(arr.includes(value)); break;
      case 'indexOf':  result = arr.indexOf(value); break;
      case 'length':   result = arr.length; break;
      case 'join':     result = arr.join(String(config.separator ?? ',')); break;
      case 'reverse':  arr.reverse(); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'sort':     arr.sort(); ctx.variables[listVar] = JSON.stringify(arr); break;
      case 'slice':    result = JSON.stringify(arr.slice(Number(config.start || 0), config.end !== '' && config.end != null ? Number(config.end) : undefined)); break;
      case 'clear':    ctx.variables[listVar] = '[]'; break;
    }
    if (config.resultVariable && result !== undefined) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── jsonParse ────────────────────────────────────────────────────────────────
  if (type === 'jsonParse') {
    const input = String(resolve(config.input || '', ctx));
    try {
      const parsed = JSON.parse(input);
      const varName = config.resultVariable || '__json__';
      ctx.variables[varName] = parsed;
      if (config.flattenKeys && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        for (const [k, v] of Object.entries(parsed)) {
          ctx.variables[`${varName}.${k}`] = v;
        }
      }
      return { nextHandle: 'output' };
    } catch {
      return { nextHandle: 'error' };
    }
  }

  // ── jsonStringify ────────────────────────────────────────────────────────────
  if (type === 'jsonStringify') {
    const varName = config.sourceVariable || '';
    const value = varName ? (ctx.variables[varName] ?? null) : resolve(config.input || '', ctx);
    const indent = Number(config.indent || 0);
    const result = JSON.stringify(value, null, indent || undefined);
    if (config.resultVariable) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── typeConvert ──────────────────────────────────────────────────────────────
  if (type === 'typeConvert') {
    const input = resolve(config.input || '', ctx);
    let result;
    switch (config.targetType || 'string') {
      case 'string':  result = String(input); break;
      case 'number':  result = Number(input); break;
      case 'integer': result = Math.trunc(Number(input)); break;
      case 'boolean': result = (input === 'true' || input === '1' || input === true || Number(input) > 0); break;
      default:        result = input;
    }
    if (config.resultVariable) ctx.variables[config.resultVariable] = result;
    return { nextHandle: 'output' };
  }

  // ── getDate ───────────────────────────────────────────────────────────────────
  if (type === 'getDate') {
    const now = new Date();
    const tz = config.timezone || 'UTC';
    const locale = config.locale || 'fr-FR';
    const vars = config.resultVariable || 'date';
    const intl = (opts) => {
      try { return new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts }).format(now); }
      catch { return new Intl.DateTimeFormat('fr-FR', opts).format(now); }
    };
    ctx.variables[vars]                    = intl({ dateStyle: 'short', timeStyle: 'short' });
    ctx.variables[`${vars}.timestamp`]     = now.getTime();
    ctx.variables[`${vars}.iso`]           = now.toISOString();
    ctx.variables[`${vars}.year`]          = now.getFullYear();
    ctx.variables[`${vars}.month`]         = now.getMonth() + 1;
    ctx.variables[`${vars}.day`]           = now.getDate();
    ctx.variables[`${vars}.hour`]          = now.getHours();
    ctx.variables[`${vars}.minute`]        = now.getMinutes();
    ctx.variables[`${vars}.second`]        = now.getSeconds();
    if (config.customFormat) {
      ctx.variables[`${vars}.formatted`] = config.customFormat
        .replace('YYYY', String(now.getFullYear()))
        .replace('MM',   String(now.getMonth() + 1).padStart(2, '0'))
        .replace('DD',   String(now.getDate()).padStart(2, '0'))
        .replace('HH',   String(now.getHours()).padStart(2, '0'))
        .replace('mm',   String(now.getMinutes()).padStart(2, '0'))
        .replace('ss',   String(now.getSeconds()).padStart(2, '0'));
    }
    return { nextHandle: 'output' };
  }

  // ── loopWhile ─────────────────────────────────────────────────────────────────
  if (type === 'loopWhile') {
    const left   = resolve(config.leftValue  || '', ctx);
    const right  = resolve(config.rightValue || '', ctx);
    const result = compare(left, config.operator || '<', right);
    const max    = Number(config.maxIterations || 100);
    // Use a stable key derived from the condition fields to track iterations
    const iterKey = `__while_${config.leftValue}_${config.operator}_${config.rightValue}__`;
    if (result) {
      const iter = Number(ctx.variables[iterKey] || 0) + 1;
      if (iter <= max) {
        ctx.variables[iterKey] = iter;
        return { nextHandle: 'loop' };
      }
    }
    delete ctx.variables[iterKey];
    return { nextHandle: 'done' };
  }

  // ── codeExec ──────────────────────────────────────────────────────────────
  if (type === 'codeExec') {
    const { createContext, Script } = await import('node:vm');
    const code       = config.code || '';
    const timeoutMs  = Math.min(parseInt(config.timeout) || 3000, 10000);
    const sandbox = {
      variables: ctx.variables,
      guild:       ctx.interaction?.guild  ?? ctx.event?.[0]?.guild  ?? null,
      channel:     ctx.interaction?.channel ?? ctx.event?.[0]?.channel ?? null,
      message:     (ctx.event || [])[0] ?? null,
      interaction: ctx.interaction ?? null,
      log: (...a) => console.log('[codeExec]', ...a),
    };
    createContext(sandbox);
    try {
      const script  = new Script(`(async()=>{ ${code} })()`);
      const promise = script.runInContext(sandbox, { timeout: timeoutMs });
      await Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('Code timeout')), timeoutMs)),
      ]);
      return { nextHandle: 'success' };
    } catch (err) {
      ctx.variables[config.errorVar || '_codeError'] = String(err.message ?? err);
      return { nextHandle: 'error' };
    }
  }

  return null;
}
