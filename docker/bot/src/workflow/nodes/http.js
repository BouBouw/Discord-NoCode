import { resolve } from '../context.js';

export async function executeAction(type, config, ctx) {
  if (type !== 'httpRequest') return null;

  const url    = resolve(config.url    || '', ctx);
  const method = (config.method || 'GET').toUpperCase();

  // Parse headers
  let headers = {};
  if (config.headers) {
    try {
      headers = typeof config.headers === 'string'
        ? JSON.parse(resolve(config.headers, ctx))
        : config.headers;
    } catch {}
  }
  if (!headers['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  // Body
  let body;
  if (method !== 'GET' && method !== 'HEAD' && config.body) {
    body = resolve(config.body, ctx);
  }

  if (!url) {
    console.warn('[httpRequest] No URL configured');
    return { nextHandle: 'error' };
  }

  try {
    const res  = await fetch(url, { method, headers, body });
    const text = await res.text();

    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (config.responseVariable) ctx.variables[config.responseVariable] = data;
    ctx.variables['__httpStatus__'] = res.status;

    return { nextHandle: res.ok ? 'success' : 'error' };
  } catch (err) {
    console.error('[httpRequest] Error:', err.message);
    ctx.variables['__httpError__'] = err.message;
    return { nextHandle: 'error' };
  }
}
