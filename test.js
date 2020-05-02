const Joi = require("@hapi/joi");
const regex = /^foobar$/i;

const schema = Joi.object({
  fooBar: Joi.string()
}).rename(regex, 'fooBar');

const value = schema.validateAsync({ FooBar: 'a'});
console.log(value);
