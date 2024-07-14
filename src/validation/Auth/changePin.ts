import Joi from 'joi';

export const changePinSchema = Joi.object({
  current_pin: Joi.string().min(4).max(4).required(),
  new_pin: Joi.string().min(4).max(4).required(),
  confirm_pin: Joi.ref('new_pin'),
});
