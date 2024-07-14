import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode, verifyEmail } from '../../helpers';
import User from '../../models/user.model';
import {
  AppResponse,
  generateOTP,
  hashPayload,
  logger,
  setCookies,
  toJSON,
} from '../../utils';
import { registerSchema } from '../../validation/Auth/register';

async function register(req: Request, res: Response) {
  const {
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    email_address,
    password,
    confirm_password,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !date_of_birth ||
    !email_address ||
    !password ||
    !confirm_password
  ) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing.',
    );
  }

  try {
    await registerSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address });

    if (user) {
      return AppResponse(
        req,
        res,
        Httpcode.CONFLICT,
        'The provided email address is already associated with an existing account.',
      );
    }

    const { otp, otp_expires_at } = await generateOTP();
    const hashedPassword = await hashPayload(password);

    const newUser = await User.create({
      first_name,
      middle_name: middle_name || null,
      last_name,
      date_of_birth,
      email_address,
      password: hashedPassword,
      'email_verification_otp.code': otp,
      'email_verification_otp.expires_at': otp_expires_at,
    });

    await setCookies(req, res, newUser._id);

    await verifyEmail(first_name, email_address, otp);

    return AppResponse(
      req,
      res,
      Httpcode.CREATED,
      'Account created',
      toJSON({ user: newUser }),
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

export { register };
