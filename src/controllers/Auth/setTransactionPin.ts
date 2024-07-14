import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';
import {
  AppResponse,
  extractYearFromDate,
  hashPayload,
  isSequentialOrRepeating,
  logger,
} from '../../utils';
import { transactionPinSchema } from '../../validation';

async function setTransactionPin(req: Request, res: Response) {
  const { user } = req;
  const { pin } = req.body;

  if (!user || !pin) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Kindly confirm no attribute is missing',
    );
  }

  if (user.is_pin_set) {
    return AppResponse(req, res, Httpcode.BAD_REQUEST, 'Transaction Pin already set');
  }
  try {
    const user_dob_year = extractYearFromDate(user.date_of_birth).toString();

    if (isSequentialOrRepeating(pin) || req.body.pin === user_dob_year) {
      return AppResponse(
        req,
        res,
        Httpcode.BAD_REQUEST,
        'PIN contains repeating digits or date of birth',
      );
    }

    await transactionPinSchema.validateAsync(req.body);

    const hashedTransactionPin = await hashPayload(pin);

    await User.findByIdAndUpdate(user._id, {
      transaction_pin: hashedTransactionPin,
      is_pin_set: true,
      pin_changed_at: Date.now(),
    });

    return AppResponse(
      req,
      res,
      Httpcode.CREATED,
      'Transaction Pin added successfully',
      user,
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

export { setTransactionPin };
