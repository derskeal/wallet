import { User } from '.prisma/client';

declare module '@tsed/common' {
  interface Request {
    user: User;
  }
}
