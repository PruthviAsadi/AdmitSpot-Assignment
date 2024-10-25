// utils/validation.js
import Joi from 'joi';

export const validateRegistration = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

export const validateContact = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        address: Joi.string(),
        timezone: Joi.string().required(),
    });
    return schema.validate(data);
};
