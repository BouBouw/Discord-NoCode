export default function errorHandler(err, req, res, next) {
  console.error(err);

  // Handle all AppError subclasses (ValidationError, LimitExceededError, NotFoundError, etc.)
  if (err.statusCode && err.code) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ error: 'Internal server error' });
}
