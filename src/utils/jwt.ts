import { Types } from 'mongoose';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Httpcode, ResponseHandler } from '../helpers';

const apiResponse: ResponseHandler = new ResponseHandler();
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as string;
const WEB_REFRESH_TOKEN_SECRET = process.env.WEB_SECRET as string;
const MOBIE_REFRESH_TOKEN_SECRET = process.env.MOBILE_SECRET as string;

async function generateAccessToken(
  res: Response,
  tokenArg: { id: Types.ObjectId; email: string },
) {
  if (!ACCESS_TOKEN_SECRET) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `JWT secret not configured. Please check the server configuration.`,
        ),
      );
  }

  const token = jwt.sign(tokenArg, ACCESS_TOKEN_SECRET, { expiresIn: '15min' });
  if (!token) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `Failed to generate access token. Please try again later.`,
        ),
      );
  }
  return token;
}

async function generateWebRefreshToken(
  res: Response,
  tokenArg: { id: Types.ObjectId; email: string },
) {
  if (!WEB_REFRESH_TOKEN_SECRET) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `JWT secret not configured. Please check the server configuration.`,
        ),
      );
  }

  const token = jwt.sign(tokenArg, WEB_REFRESH_TOKEN_SECRET, { expiresIn: '60min' });
  if (!token) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `Failed to generate access token. Please try again later.`,
        ),
      );
  }
  return token;
}

async function generateMobileRefreshToken(
  res: Response,
  tokenArg: { id: Types.ObjectId; email: string },
) {
  if (!MOBIE_REFRESH_TOKEN_SECRET) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `JWT secret not configured. Please check the server configuration.`,
        ),
      );
  }
  const token = jwt.sign(tokenArg, MOBIE_REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
  if (!token) {
    return res
      .status(Httpcode.INTERNAL_SERVER_ERROR)
      .json(
        await apiResponse.InternalServerErrorException(
          'Internal server error',
          `Failed to generate access token. Please try again later.`,
        ),
      );
  }
  return token;
}

async function validateAccessToken(accessToken: string) {
  try {
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    return true;
  } catch (err: any) {
    return false;
  }
}

async function validateRefreshToken(refreshToken: string, isWeb: boolean) {
  try {
    const secret = isWeb ? WEB_REFRESH_TOKEN_SECRET : MOBIE_REFRESH_TOKEN_SECRET;
    jwt.verify(refreshToken, secret);
    return true;
  } catch (err: any) {
    return false;
  }
}

export {
  generateAccessToken,
  generateWebRefreshToken,
  generateMobileRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
