import Joi from 'joi';

export const lookUpSchema = Joi.object({
  email_address: Joi.string().email().required(),
});
