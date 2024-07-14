import { Request, Response } from 'express';
import { AppResponse, logger } from '../../utils';
import { Httpcode } from '../../helpers';
import User from '../../models/user.model';

async function logOut(req: Request, res: Response) {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { refresh_token: null } },
      { select: 'refresh_token' },
    );

    const deviceId = req.headers['swiftaboki-device-id'];

    if (deviceId) {
      res.removeHeader('swiftaboki_accessToken');
      res.removeHeader('swiftaboki_refreshToken');
    } else {
      res.clearCookie('swiftaboki-access-token');
      res.clearCookie('swiftaboki-refresh-token');
    }

    return AppResponse(req, res, Httpcode.OK, 'Logout successful');
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

export { logOut };
