import { Request, Response } from 'express';
import { AppResponse, logger } from '../../utils';
import { Httpcode } from '../../helpers';
import { ValidationError } from 'joi';
import User from '../../models/user.model';
import { deleteAccountSchema } from '../../validation';

async function deleteAccount(req: Request, res: Response) {
  const { feedback } = req.body;

  try {
    await deleteAccountSchema.validateAsync(req.body);

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { feedback, is_account_deleted: true } },
      { select: 'is_account_deleted feedback' },
    );

    const deviceId = req.headers['swiftaboki-device-id'];

    if (deviceId) {
      res.removeHeader('swiftaboki_accessToken');
      res.removeHeader('swiftaboki_refreshToken');
    } else {
      res.clearCookie('swiftaboki-access-token');
      res.clearCookie('swiftaboki-refresh-token');
    }

    return AppResponse(req, res, Httpcode.OK, 'Account deleted successfully.');
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

export { deleteAccount };
