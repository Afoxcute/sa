import Joi from 'joi';

export const verifyEmailSchema = Joi.object({
  code: Joi.string().required(),
});
