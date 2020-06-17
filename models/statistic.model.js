// @ts-check
const Joi = require("@hapi/joi");

const StatisticQuerySchema = Joi.object({
  start: Joi.date(),
  end: Joi.date(),
  order: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .required(),
});

module.exports = {
  StatisticQuerySchema,
};
