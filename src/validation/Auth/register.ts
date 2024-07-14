import Joi from 'joi';

export const registerSchema = Joi.object({
  first_name: Joi.string().max(20).required(),
  middle_name: Joi.string().max(20),
  last_name: Joi.string().max(20).required(),
  date_of_birth: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  email_address: Joi.string().email().required(),
  password: Joi.string().required(),
  confirm_password: Joi.ref('password'),
});

export const setPasswordSchema = Joi.object({
  email_address: Joi.string().email().required(),
  password: Joi.string().required(),
  confirm_password: Joi.ref('password'),
});

export const transactionPinSchema = Joi.object({
  pin: Joi.string().min(4).max(4).required(),
});
