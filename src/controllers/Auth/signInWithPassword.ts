import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, dehashPayload, logger, setCookies, toJSON } from '../../utils';
import { signInWithPasswordSchema } from '../../validation';

async function signInWithPassword(req: Request, res: Response) {
  const { email_address, password } = req.body;

  if (!email_address || !password) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'Email or password is missing');
  }
  try {
    await signInWithPasswordSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address }).select(
      '+password +is_email_verified +transaction_pin +is_account_deleted +is_account_suspended',
    );

    if (!user) {
      return AppResponse(req, res, Httpcode.NOT_FOUND, 'Email or password is incorrect');
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

    const isPasswordValid = await dehashPayload(password, user.password);

    if (!isPasswordValid) {
      return AppResponse(
        req,
        res,
        Httpcode.UNAUTHORIZED,
        'Email or password is incorrect',
      );
    }

    if (!user.is_email_verified) {
      return AppResponse(
        req,
        res,
        Httpcode.UNAUTHORIZED,
        `Email not verified :${user.email_address}`,
      );
    }

    await setCookies(req, res, user._id);
    return AppResponse(req, res, Httpcode.OK, 'SignIn Authorized', toJSON({ user }));
  } catch (err: any) {
    logger.error(err);

    if (err instanceof ValidationError) {
      return AppResponse(
        req,
        res,
        Httpcode.VALIDATION_ERROR,
        'Validation Error',
        err.details[0].message,
      );
    }

    return AppResponse(
      req,
      res,
      Httpcode.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      err,
    );
  }
}

export { signInWithPassword };
