import dotenv from 'dotenv';

dotenv.config();

export const envs = {
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET || 'somesecret',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
};
export const isProduction = process.env.NODE_ENV === 'production';
