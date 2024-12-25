import * as dotenv from 'dotenv';
import * as Joi from 'joi';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    PAGE_LOAD_TIME: Joi.number().default(10000),
    TIME_WINDOW: Joi.number().default(500),
    TIME_DELAY: Joi.number().default(200),
    LINK_PER_GEN: Joi.number().default(10),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error != null) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  port: envVars.PORT,
  time: envVars.PAGE_LOAD_TIME,
  timeWindow: envVars.TIME_WINDOW,
  timeDelay: envVars.TIME_DELAY,
  perGen: envVars.LINK_PER_GEN,
};