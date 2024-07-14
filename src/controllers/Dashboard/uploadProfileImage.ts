import { Request, Response } from 'express';
import { AppResponse, logger } from '../../utils';
import {
  Httpcode,
  UploadImage,
  getImageUrl,
  deleteImage,
  getImageNameFromUrl,
} from '../../helpers';
import * as crypto from 'crypto';
import User from '../../models/user.model';

async function uploadProfileImage(req: Request, res: Response) {
  if (!req.file) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'No image uploaded. Please provide an image.',
    );
  }
  const fileBuffer: Buffer = req.file.buffer;
  const mimeType: string = req.file.mimetype;
  const randomImageName: string = crypto.randomBytes(10).toString('hex');
  const allowedImageTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!allowedImageTypes.includes(mimeType)) {
    return AppResponse(
      req,
      res,
      Httpcode.BAD_REQUEST,
      'Invalid file type. Only images (JPEG, JPG, PNG) are allowed.',
    );
  }
  try {
    if (req.user.profile_image !== undefined) {
      const currentImageName = await getImageNameFromUrl(req.user.profile_image);
      await deleteImage(currentImageName);
    }

    await UploadImage(req, res, randomImageName, fileBuffer, mimeType);

    const imageURL = await getImageUrl(randomImageName);

    await User.findByIdAndUpdate(req.user._id, { profile_image: imageURL });

    return AppResponse(req, res, Httpcode.OK, 'Image uploaded successfully');
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

export { uploadProfileImage };
