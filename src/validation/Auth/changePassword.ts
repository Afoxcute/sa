import Joi from 'joi';

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().required(),
  confirm_password: Joi.ref('new_password'),
});
