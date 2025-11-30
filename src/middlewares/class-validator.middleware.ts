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
      const message = Object.values(errors[0].constraints)[0];
      return next(new ValidationError(message));
    }

    req.body = dtoObj;
    next();
  };
};
