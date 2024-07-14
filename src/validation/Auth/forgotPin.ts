import Joi from 'joi';

export const forgotPinSchema = Joi.object({
  email_address: Joi.string().email().required(),
});

export const setTransactionPinSchema = Joi.object({
  pin: Joi.string().min(4).max(4).required(),
  code: Joi.string().required(),
});
