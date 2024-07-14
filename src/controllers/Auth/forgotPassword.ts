import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode, verifyEmail } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, generateOTP, logger } from '../../utils';
import { forgotPasswordSchema } from '../../validation';

async function forgotPassword(req: Request, res: Response) {
  const { email_address } = req.body;

  if (!email_address) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing',
    );
  }

  try {
    await forgotPasswordSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address });

    if (!user) {
      return AppResponse(
        req,
        res,
        Httpcode.NOT_FOUND,
        'The provided email address was not found.',
      );
    }

    const { otp, otp_expires_at } = await generateOTP();

    await User.findByIdAndUpdate(
      user._id,
      {
        'password_reset_otp.code': otp,
        'password_reset_otp.expires_at': otp_expires_at,
      },
      { new: true },
    );

    await verifyEmail(user.first_name, email_address, otp);

    return AppResponse(req, res, Httpcode.CREATED, 'Email sent', user);
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

export { forgotPassword };
