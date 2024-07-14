import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { logger } from '../utils';

dotenv.config();

const RESEND_KEY = process.env.RESEND_KEY as string;
const resend = new Resend(RESEND_KEY);

async function sendMail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: 'SwiftAboki <no-reply@swiftaboki.com>',
    to,
    subject,
    html,
  };

  try {
    const email = await resend.emails.send(mailOptions);
    console.log(email);
  } catch (err: any) {
    console.log(err);
    logger.error(err);
  }
}

export { sendMail };
