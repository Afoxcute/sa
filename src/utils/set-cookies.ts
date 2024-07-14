import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import User from '../models/user.model';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN as string;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as string;

async function setCookies(req: Request, res: Response, id: Types.ObjectId) {
  if (!id) {
    return false;
  }

  const accessToken = await jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = await jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  await User.findByIdAndUpdate(id, { refresh_token: refreshToken });

  const deviceId = req.headers['swiftaboki-device-id'];

  if (deviceId) {
    req['new_swiftaboki_accessToken'] = accessToken;
    req['new_swiftaboki_refreshToken'] = refreshToken;
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('swiftaboki-access-token', accessToken, {
    httpOnly: isProduction ? true : false,
    secure: isProduction ? true : false,
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 Minutes
  });

  res.cookie('swiftaboki-refresh-token', refreshToken, {
    httpOnly: isProduction ? true : false,
    secure: isProduction ? true : false,
    path: '/',
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });

  return;
}

export { setCookies };
