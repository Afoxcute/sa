import { Request, Response } from 'express';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import { AppResponse, logger } from '../utils';
import { Httpcode } from './response';
import sharp from 'sharp';
import { URL } from 'url';

dotenv.config();

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region: AWS_BUCKET_REGION,
});

interface AwsParam {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
}

interface getUrlParam {
  Bucket: string;
  Key: string;
}

async function UploadImage(
  req: Request,
  res: Response,
  filename: string,
  fileBuffer: Buffer,
  mimeType: string,
) {
  // Resize file buffer
  const buffer: Buffer = await sharp(fileBuffer).resize(200, 200).toBuffer();

  const params: AwsParam = {
    Bucket: AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: mimeType,
  };

  const command: PutObjectCommand = new PutObjectCommand(params);
  try {
    await s3.send(command);
    logger.info('File uploaded successfully');
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

async function getImageUrl(imageName: string) {
  const getObjectParams: getUrlParam = {
    Bucket: AWS_BUCKET_NAME,
    Key: imageName,
  };

  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3, command);
}

async function deleteImage(imageName: string) {
  const deleteObjectParams: getUrlParam = {
    Bucket: AWS_BUCKET_NAME,
    Key: imageName,
  };
  const command = new DeleteObjectCommand(deleteObjectParams);
  await s3.send(command);
  logger.info('File deleted successfully');
}

async function getImageNameFromUrl(signedUrl: string) {
  const url = new URL(signedUrl);
  const urlPath = url.pathname;

  const urlSegment = urlPath.split('/');
  return urlSegment[urlSegment.length - 1];
}

export { UploadImage, getImageUrl, deleteImage, getImageNameFromUrl };
