import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, createToken, logger, verifyOTP } from '../../utils';
import { verifyOTPSchema } from '../../validation/Auth/verifyOtp';

enum Reason {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

const OTP_DATA = {
  [Reason.VERIFY_EMAIL]: 'email_verification_otp',
  [Reason.RESET_PASSWORD]: 'password_reset_otp',
};

async function verifyOtp(req: Request, res: Response) {
  const { code, reason, email_address } = req.body;

  if (!email_address || !reason || !code) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'email, code and reason are required',
    );
  }

  try {
    await verifyOTPSchema.validateAsync(req.body);

    const otpKey = `${OTP_DATA[reason as Reason]}.code`;
    const expiresAtKey = `${OTP_DATA[reason as Reason]}.expires_at`;

    const user = await User.findOne({ email_address, [otpKey]: code }).select(
      `+${OTP_DATA[reason as Reason]}`,
    );

    if (!user) {
      return AppResponse(req, res, Httpcode.NOT_FOUND, 'Invalid or expired OTP');
    }

    if (
      !verifyOTP({
        code,
        current_code: user[OTP_DATA[reason as Reason]].code,
        expiry: new Date(),
        current_expiry: user[OTP_DATA[reason as Reason]].expires_at,
      })
    ) {
      return AppResponse(req, res, Httpcode.BAD_REQUEST, 'OTP invalid or expired');
    }

    const randomString = randomBytes(32).toString('hex') + user._id;
    const token = await createToken(randomString);

    const otpToken = `${OTP_DATA[reason as Reason]}.token`;

    await User.findByIdAndUpdate(user._id, {
      [otpKey]: null,
      [expiresAtKey]: null,
      [otpToken]: randomString,
    });

    return AppResponse(req, res, Httpcode.CREATED, 'OTP verified successfully', token);
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

export { verifyOtp };
