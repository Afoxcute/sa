import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode, verifyEmail } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, generateOTP, logger } from '../../utils';
import { resendOTPSchema } from '../../validation';

enum Reason {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

const OTP_DATA = {
  [Reason.VERIFY_EMAIL]: 'email_verification_otp',
  [Reason.RESET_PASSWORD]: 'password_reset_otp',
};

async function resentOTP(req: Request, res: Response) {
  const { reason, email_address } = req.body;

  if (!email_address || !reason) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'reason and email required');
  }

  const { otp, otp_expires_at } = await generateOTP();

  const otpData = {
    [`${OTP_DATA[reason as Reason]}.code`]: otp,
    [`${OTP_DATA[reason as Reason]}.expires_at`]: otp_expires_at,
  };

  try {
    await resendOTPSchema.validateAsync(req.body);

    const user = await User.findOne({ email_address });

    if (!user) {
      return AppResponse(
        req,
        res,
        Httpcode.NOT_FOUND,
        'The provided email address was not found.',
      );
    }

    await User.findByIdAndUpdate(user._id, otpData);

    await verifyEmail(user.first_name, email_address, otp);

    return AppResponse(req, res, Httpcode.CREATED, 'OTP sent successfully', user);
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
      'Internal error',
      err.message,
    );
  }
}

export { resentOTP };
