import dotenv from 'dotenv';

let env;

if (process.env.NODE_ENV !== 'staging' && process.env.NODE_ENV !== 'production') {
  env = dotenv.config().parsed;
  if (!env) throw new Error('failed to parse env');
} else {
  env = process.env;
}

export const envs = {
  ...process.env,
  JWT_SECRET: env.JWT_SECRET || 'somesecret',
  PAYSTACK_SECRET_KEY: env.PAYSTACK_SECRET_KEY,
};
export const isProduction = process.env.NODE_ENV === 'production';
