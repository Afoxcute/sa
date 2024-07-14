import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Httpcode } from '../helpers';
import { Iuser } from '../interface';
import User from '../models/user.model';
import { AppResponse, setCookies } from '../utils';

import { isAfter } from 'date-fns';
import { promisify } from 'util';

declare global {
  namespace Express {
    interface Request {
      // @ts-ignore
      user?: Iuser;
      new_swiftaboki_accesstoken?: string;
      new_swiftaboki_refreshToken?: string;
    }
  }
}

async function protect(req: Request, res: Response, next: NextFunction) {
  const accessToken =
    req.cookies['swiftaboki-access-token'] || req.headers['swiftaboki-access-token'];
  const refreshToken =
    req.cookies['swiftaboki-refresh-token'] || req.headers['swiftaboki-refresh-token'];

  if (!refreshToken) {
    return AppResponse(req, res, Httpcode.UNAUTHORIZED, 'Unauthenticated');
  }

  const validateUser = async (decoded: any) => {
    const user = await User.findOne({ _id: decoded.id })
      .select(
        '+refresh_token +is_account_suspended +is_email_verified +is_account_deleted +password_changed_at',
      )
      .lean();

    if (!user) {
      throw new Error('Unauthenticated');
    }

    // if refresh token matches what is in the DB
    if (refreshToken !== user.refresh_token) {
      throw new Error('Unauthenticated Token is invalid');
    }

    if (user.is_account_deleted) {
      throw new Error('Unauthenticated');
    }

    if (user.is_account_suspended) {
      throw new Error('Unauthenticated Account has been suspended.');
    }

    if (!user.is_email_verified && req.url !== '/verify-email') {
      throw new Error(`Email not verified :${user.email_address}`);
    }

    if (
      user.password_changed_at &&
      isAfter(Math.floor(user.password_changed_at.getTime() / 1000), decoded.iat)
    ) {
      throw new Error('Unauthenticated Password has been changed, please login again.');
    }

    return user;
  };

  const decodeToken = async (token: string, secret: string, refresh?: boolean) => {
    const decode: (token: string, secret: string) => jwt.JwtPayload = await promisify(
      jwt.verify,
    );
    const decoded = await decode(token, secret);
    const currentUser = await validateUser(decoded);
    if (refresh && currentUser) {
      await setCookies(req, res, decoded.id);
    }
    req.user = currentUser as unknown as Iuser;
    next();
  };

  try {
    if (!accessToken) {
      await decodeToken(refreshToken, process.env.JWT_REFRESH_SECRET as string, true);
    } else {
      await decodeToken(accessToken, process.env.JWT_ACCESS_SECRET as string);
    }
  } catch (err: any) {
    if (
      (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) &&
      refreshToken
    ) {
      try {
        await decodeToken(refreshToken, process.env.JWT_REFRESH_SECRET as string, true);
      } catch (err: any) {
        return AppResponse(
          req,
          res,
          Httpcode.UNAUTHORIZED,
          err.message ?? 'Unauthenticated Session expired, please login again.',
        );
      }
    } else {
      return AppResponse(
        req,
        res,
        Httpcode.UNAUTHORIZED,
        err.message ?? 'Unauthenticated',
      );
    }
  }
}

export { protect };
