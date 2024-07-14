import Joi from 'joi';

export const signInWithPasswordSchema = Joi.object({
    email_address: Joi.string().email().required(),
    password: Joi.string().required(),
});


export const signInWithPinSchema = Joi.object({
    email_address: Joi.string().email().required(),
    pin: Joi.string().required(),
});