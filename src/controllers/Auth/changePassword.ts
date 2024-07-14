import { Request, Response } from 'express';
import { AppResponse, dehashPayload, hashPayload, logger } from '../../utils';
import { Httpcode, passwordChange } from '../../helpers';
import { ValidationError } from 'joi';
import { changePasswordSchema } from '../../validation';
import User from '../../models/user.model';

async function changePassword(req: Request, res: Response) {
  const user = await User.findOne({ _id: req.user._id }).select('+password');

  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || !confirm_password) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing',
    );
  }

  if (new_password !== confirm_password) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'Password does not match.');
  }

  try {
    await changePasswordSchema.validateAsync(req.body);

    const dehashPassword = await dehashPayload(current_password, user.password);

    if (!dehashPassword) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'The current password you entered is incorrect. Please double-check and try again.',
      );
    }

    if (new_password === current_password) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'The new password must be different from your current password.',
      );
    }

    const hashedNewPassword = await hashPayload(new_password);

    await User.findOneAndUpdate(user._id, {
      password: hashedNewPassword,
      password_changed_at: Date.now(),
    });

    await passwordChange(user.first_name, user.email_address, Date.now());
    return AppResponse(req, res, Httpcode.OK, 'Password Change Successfully');
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

export { changePassword };
