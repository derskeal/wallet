import { Request as OldReq } from '@tsed/common';
import { User } from '.prisma/client';

declare module '@tsed/common' {
  interface Request extends OldReq {
    user: User;
  }
}
