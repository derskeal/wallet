import { Req } from '@tsed/common';
import { Middleware, MiddlewareMethods } from '@tsed/platform-middlewares';
import { Unauthorized } from '@tsed/exceptions';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { envs } from '../config/envs';
import { PrismaClient } from '@prisma/client';

@Middleware()
export class JWTAuth implements MiddlewareMethods {
  public async use(@Req() request: Req) {
    try {
      const authorizationHeader = request.header('Authorization');

      if (!authorizationHeader) throw new Unauthorized('Unauthenticated');

      const headerArray = authorizationHeader.split(' ');
      if (headerArray.length < 2) throw new Unauthorized('Unauthenticated');

      const token = headerArray[1];

      const payload = jwt.verify(token, envs.JWT_SECRET);
      if (!payload) {
        throw new Unauthorized('Unauthenticated');
      }

      let email = payload.sub;
      if (!email) {
        throw new Unauthorized('Unauthenticated');
      } else if (typeof email === 'function') {
        email = email();
      }

      const prisma = new PrismaClient();
      const user = await prisma.user.findFirst({
        where: {
          email
        }
      });

      if (!user) {
        throw new Unauthorized('Unauthenticated');
      }

      request.user = user;
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new Unauthorized('Unauthenticated');
      }
    }
  }
}
