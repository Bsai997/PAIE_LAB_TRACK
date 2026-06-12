// Middleware to eliminate 40+ duplicate try-catch blocks across all routes
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(err);

    // Handle Supabase-specific errors
    if (err.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({ error: 'Record already exists' });
    }
    if (err.code === '23503') {
      // Foreign key violation
      return res.status(400).json({ error: 'Invalid reference or related record not found' });
    }
    if (err.code === '42P01') {
      // Table doesn't exist
      return res.status(500).json({ error: 'Database schema error' });
    }

    // Generic errors
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  });
};
