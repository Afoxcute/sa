import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, logger, verifyOTP } from '../../utils';
import { verifyEmailSchema } from '../../validation';

async function verifyEmail(req: Request, res: Response) {
  const { email_address } = req.user;
  const { code } = req.body;

  if (!email_address || !code) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'email or code missing');
  }

  try {
    await verifyEmailSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address })
      .select('+email_verification_otp')
      .lean();

    if (!user.email_verification_otp) {
      return AppResponse(
        req,
        res,
        Httpcode.INTERNAL_SERVER_ERROR,
        'An error occured, please try again.',
      );
    }

    if (
      !verifyOTP({
        code,
        current_code: user.email_verification_otp.code,
        expiry: new Date(Date.now()),
        current_expiry: user.email_verification_otp.expires_at,
      })
    ) {
      return AppResponse(req, res, Httpcode.BAD_REQUEST, 'OTP invalid or expired');
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        is_email_verified: true,
        'email_verification_otp.code': null,
        'email_verification_otp.expires_at': null,
      },
      { new: true },
    );

    return AppResponse(req, res, Httpcode.OK, 'Email verified successfully', updatedUser);
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

export { verifyEmail };
