import { sendMail } from '../mailer';
import { getCurrentYear } from '../../utils';

async function verifyEmail(firstName: string, email: string, otp: string) {
  const currentYear = await getCurrentYear();
  const emailSubject = 'Your One-Time Password';
  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Calibri, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
            }
            .content {
                margin-top: 20px;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #888888;
                font-size: small;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Verify Your Email Address</h2>
            </div>
            <div class="content">
                <p>Hello ${firstName},</p>
                <p>Your One-Time Password (OTP) for authentication is:</p>
                <h3 style="text-align: center; color: #0066cc;">${otp}</h3>
                <p>This OTP is valid for 3 minutes. Do not share this code with anyone.</p>
                <p>If you didn't request this OTP, please contact us immediately.</p>
            </div>
            <div class="footer">
                <p>You received this email because you signed up to SwiftAboki.</p>
                <p>&copy; ${currentYear} SwiftAboki. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

  await sendMail(email, emailSubject, emailBody);
}

export { verifyEmail };
