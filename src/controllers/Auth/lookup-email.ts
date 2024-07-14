import { Request, Response } from 'express';
import { AppResponse, logger } from '../../utils';
import { Httpcode } from '../../helpers';
import { ValidationError } from 'joi';
import User from '../../models/user.model';
import { lookUpSchema } from '../../validation';

/* 
This endpoint looks up the provided email address early in the 
registration flow to ensure its uniqueness.
*/

async function lookUpEmail(req: Request, res: Response) {
  const { email_address } = req.body;
  if (!email_address) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing.',
    );
  }
  try {
    await lookUpSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address });

    if (user) {
      return AppResponse(
        req,
        res,
        Httpcode.CONFLICT,
        'The provided email address is already associated with an existing account.',
      );
    }

    return AppResponse(
      req,
      res,
      Httpcode.OK,
      'Email address confirmed as unique. Please proceed.',
    );
  } catch (err: any) {
    logger.error(err.message);

    if (err instanceof ValidationError) {
      return AppResponse(
        req,
        res,
        Httpcode.VALIDATION_ERROR,
        'Validation error',
        err.details[0].message,
      );
    }

    return AppResponse(
      req,
      res,
      Httpcode.INTERNAL_SERVER_ERROR,
      'Internal server error',
      err.message,
    );
  }
}

export { lookUpEmail };
