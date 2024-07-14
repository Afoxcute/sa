import { Request, Response } from 'express';

export function AppResponse(
  req: Request,
  res: Response,
  statusCode: number = 200,
  message: string,
  data?: Record<string, string[]> | unknown | string | null,
) {
  let token;
  const accessToken = req['new_swiftaboki_accessToken'];
  const refreshToken = req['new_swiftaboki_refreshToken'];

  if (accessToken) token = { 'swiftaboki-access-token': accessToken };

  if (refreshToken) token = { ...token, 'swiftaboki-refresh-token': refreshToken };

  let statusMsg: boolean = statusCode === 200 || statusCode === 201 ? true : false;

  return res.status(statusCode).json({
    status: statusMsg,
    data: data ?? null,
    message: message ?? 'Success',
    ...(token && { tokens: token }),
  });
}
