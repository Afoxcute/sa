import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import { AppResponse, dehashPayload, hashPayload, logger } from '../../utils';
import { setNewPasswordSchema } from '../../validation';

async function setNewPassword(req: Request, res: Response) {
  const { password, confirm_password, token } = req.body;

  if (!password || !confirm_password || !token) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'password, confirm_password and token required',
    );
  }

  if (password !== confirm_password) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'Passwords do not match');
  }

  if (!process.env.TOKEN_SECRET) {
    throw new Error('Missing required environment variable: TOKEN_SECRET');
  }

  try {
    await setNewPasswordSchema.validateAsync(req.body);

    const decode: (token: string, secret: string) => jwt.JwtPayload = await promisify(
      jwt.verify,
    );

    const decoded = await decode(token, process.env.TOKEN_SECRET);

    const user = await User.findOne({ 'password_reset_otp.token': decoded.token }).select(
      '+password_reset_otp +password',
    );

    if (!user) {
      return AppResponse(req, res, Httpcode.NOT_FOUND, 'No user found.');
    }

    const hashedPassword = await hashPayload(password);
    const dehahedPassword = await dehashPayload(password, user.password);

    // Check if the new password is the same as the old one
    if (dehahedPassword) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'New password cannot be the same as the old password',
      );
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        password_changed_at: Date.now(),
        'password_reset_otp.token': null,
      },
      { new: true },
    );

    return AppResponse(req, res, Httpcode.OK, 'Password updated successfully');
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
      'An error occurred, Please try again',
      err.message,
    );
  }
}

export { setNewPassword };
