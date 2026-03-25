/**
 * Middleware to authenticate requests from bot containers.
 * Expects: Authorization: Bearer <INTERNAL_SECRET>
 */
export function internalAuth(req, res, next) {
  const secret = process.env.INTERNAL_SECRET;

  // If no secret is configured, skip auth in dev mode
  if (!secret) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== secret) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  next();
}
