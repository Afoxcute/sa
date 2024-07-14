import { Request, Response } from 'express';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, dehashPayload, logger } from '../../utils';
import { signInWithPinSchema } from '../../validation';
import { ValidationError } from 'joi';

async function signInWithPin(req: Request, res: Response) {
  const { email_address, pin } = req.body;

  if (!email_address || !pin) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing.',
    );
  }

  try {
    await signInWithPinSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address }).select(
      '+is_email_verified +transaction_pin +is_account_deleted +is_account_suspended',
    );

    if (!user) {
      return AppResponse(
        req,
        res,
        Httpcode.NOT_FOUND,
        'The provided email address was not found.',
      );
    }

    if (user.is_account_deleted) {
      return AppResponse(req, res, Httpcode.NOT_FOUND, 'Unauthenticated');
    }

    if (user.is_account_suspended) {
      return AppResponse(
        req,
        res,
        Httpcode.FORBIDDEN,
        'Account suspended, contact swiftaboki for support.',
      );
    }

    const isPinValid = await dehashPayload(pin, user.transaction_pin);

    if (!isPinValid) {
      return AppResponse(req, res, Httpcode.UNAUTHORIZED, 'Email or pin is incorrect.');
    }

    if (!user.is_email_verified) {
      return AppResponse(
        req,
        res,
        Httpcode.UNAUTHORIZED,
        `Email not verified :${user.email_address}`,
      );
    }

    return AppResponse(req, res, Httpcode.OK, 'SignIn Authorized', user);
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

export { signInWithPin };
