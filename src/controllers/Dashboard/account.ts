import { Request, Response } from 'express';
import { Httpcode } from '../../helpers';
import { AppResponse, logger } from '../../utils';
import User from '../../models/user.model';

async function account(req: Request, res: Response) {
  const user = await User.findById(req.user._id);
  try {
    if (!user) {
      return AppResponse(req, res, Httpcode.NOT_FOUND, 'User not found');
    }

    return AppResponse(req, res, Httpcode.OK, 'User information', user);
  } catch (err: any) {
    logger.error(err.message);

    return AppResponse(
      req,
      res,
      Httpcode.INTERNAL_SERVER_ERROR,
      'Internal server error',
      err.message,
    );
  }
}

export { account };
