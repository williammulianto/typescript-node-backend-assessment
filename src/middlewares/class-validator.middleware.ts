import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'utils/errors';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(dtoClass, req.body);

    const errors = await validate(dtoObj, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const errorDetails = errors.map((error) => ({
        field: error.property,
        message: Object.values(error.constraints || {})[0] as string,
      }));

      const message =
        errorDetails.length === 1
          ? errorDetails[0].message
          : `Validation failed on ${errorDetails.length} field(s)`;

      return next(new ValidationError(message, 'VALIDATION_ERROR', errorDetails));
    }

    req.body = dtoObj;
    next();
  };
};
