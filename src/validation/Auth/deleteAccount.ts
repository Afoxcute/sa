import Joi from 'joi';

export const deleteAccountSchema = Joi.object({
  feedback: Joi.string().max(500).optional(),
});
