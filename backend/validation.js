import Joi from "joi";

const Validation = Joi.object({

    name: Joi.string()
        .min(3)
        .max(20)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(6)
        .required()

});

export default Validation;