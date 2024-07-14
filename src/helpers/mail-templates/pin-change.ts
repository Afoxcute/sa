import { sendMail } from '../mailer';
import { getCurrentYear } from '../../utils';
import { format } from 'date-fns';

async function pinChange(firstName: string, email: string, date: number) {
  const currentYear = await getCurrentYear();
  const emailSubject = 'PIN Changed Successfully';
  const formattedDate = format(date, "h:mmaaaa 'on' MMMM d, yyyy");
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
                font-size: 1rem;
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
                <h2>Your PIN has been changed</h2>
            </div>
            <div class="content">
                <p>Hello ${firstName},</p>
                <p>This is a confirmation that your PIN was changed at <strong> ${formattedDate}</strong> </p>
                <p>Didn't change your PIN? Contact <a href='$'> SwiftAboki Support </a> so we can make sure
                no one else is trying to access your account.</p>
                <p>As a security reminder, please remember to keep your PIN confidential and report any suspicious activities.</p>
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

export { pinChange };
