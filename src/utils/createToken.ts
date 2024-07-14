import jwt from 'jsonwebtoken';

export async function createToken(payload: string) {
  if (!process.env.TOKEN_SECRET || !process.env.ACCESS_TOKEN_EXPIRES_IN) {
    throw new Error('Missing required environment variables');
  }

  return jwt.sign({ token: payload }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
}
