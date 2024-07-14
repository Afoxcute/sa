import { Request, Response } from 'express';
import { Httpcode } from '../../helpers';
import { AppResponse } from '../../utils';

function session(req: Request, res: Response) {
  if (req.user) {
    return AppResponse(req, res, Httpcode.OK, 'authenticated', req.user);
  } else {
    return AppResponse(req, res, Httpcode.UNAUTHORIZED, 'Unauthenticated');
  }
}

export { session };
