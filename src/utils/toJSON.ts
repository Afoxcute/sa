import { Iuser } from 'src/interface';

export const toJSON = ({ user, fields }: { user: Iuser; fields?: string[] }) => {
  const parsedUser = JSON.parse(JSON.stringify(user));

  if (fields && fields.length === 0) {
    return parsedUser;
  }

  if (fields && fields.length > 0) {
    fields.forEach((field) => {
      delete parsedUser[field];
    });
    return parsedUser;
  }

  return (({
    password,
    email_verification_otp,
    refresh_token,
    transaction_pin,
    ...rest
  }) => rest)(parsedUser);
};
