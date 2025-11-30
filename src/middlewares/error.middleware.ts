// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { applicationConfig } from 'utils/config';
import { AppError } from 'utils/errors';
import { Logger } from 'utils/logger';

const logger = new Logger('RouteErrorHandler');

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (err instanceof Error) {
    logger.error(`Unhandled error: ${err?.message}`, {
      stack: err?.stack,
      path: req?.path,
      method: req?.method,
    });
  } else {
    logger.error('Unknown error thrown', {
      err,
      path: req?.path,
      method: req?.method,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      errorCode: err.errorCode,
      message: err.message,
    });
  }

  return res.status(500).json({
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong.',
    // message: applicationConfig.server.environment == 'development' ? err : 'Something went wrong',
  });
};
