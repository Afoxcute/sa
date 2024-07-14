import Joi from 'joi';

export const forgotPasswordSchema = Joi.object({
  email_address: Joi.string().email().required(),
});

export const setNewPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
  confirm_password: Joi.ref('password'),
});
