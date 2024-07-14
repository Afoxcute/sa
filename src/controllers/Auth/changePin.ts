import { Request, Response } from 'express';
import {
  AppResponse,
  dehashPayload,
  extractYearFromDate,
  hashPayload,
  isSequentialOrRepeating,
  logger,
} from '../../utils';
import { ValidationError } from 'joi';
import { Httpcode, pinChange } from '../../helpers';
import User from '../../models/user.model';
import { changePinSchema } from '../../validation';

async function changePin(req: Request, res: Response) {
  const user = await User.findOne({ _id: req.user._id }).select('+transaction_pin');

  const { current_pin, new_pin, confirm_pin } = req.body;

  if (!current_pin || !new_pin || !confirm_pin) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing',
    );
  }

  if (new_pin !== confirm_pin) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'Pin does not match.');
  }

  try {
    await changePinSchema.validateAsync(req.body);

    const dehashPin = await dehashPayload(current_pin, user.transaction_pin);

    if (!dehashPin) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'The current pin you entered is incorrect. Please double-check and try again.',
      );
    }

    if (new_pin === current_pin) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'The new pin must be different from your current pin.',
      );
    }

    const user_dob_year = extractYearFromDate(user.date_of_birth).toString();

    if (
      isSequentialOrRepeating(new_pin) ||
      new_pin === user_dob_year ||
      new_pin === '1234'
    ) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'PIN contains repeating digits or date of birth',
      );
    }

    const hashedNewPin = await hashPayload(new_pin);

    await User.findOneAndUpdate(user._id, {
      transaction_pin: hashedNewPin,
      pin_changed_at: Date.now(),
    });

    await pinChange(user.first_name, user.email_address, Date.now());
    return AppResponse(req, res, Httpcode.OK, 'Pin Changed Successfully');
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

export { changePin };
