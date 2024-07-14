import Joi from 'joi';

enum Reason {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export const verifyOTPSchema = Joi.object({
  email_address: Joi.string().email().required(),
  code: Joi.string().required(),
  reason: Joi.string().valid(...Object.values(Reason)),
});
