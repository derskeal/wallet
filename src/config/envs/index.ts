import dotenv from 'dotenv';

const env = dotenv.config().parsed;
if (!env) throw new Error('failed to parse env');

export const envs = {
  ...process.env,
  JWT_SECRET: env.JWT_SECRET || 'somesecret',
  PAYSTACK_SECRET_KEY: env.PAYSTACK_SECRET_KEY,
};
export const isProduction = process.env.NODE_ENV === 'production';
