
import { ApiError } from '../utils/error.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      });
      req.validated = parsed;
      next();
    } catch (e) {
      next(new ApiError(400, 'Validation error', e.issues || e.errors));
    }
  };
}
