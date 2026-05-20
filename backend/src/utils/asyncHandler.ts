import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler so any thrown/rejected error
 * is forwarded to Express's global error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
