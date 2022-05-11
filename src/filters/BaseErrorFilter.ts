import { PlatformContext } from '@tsed/common';
import { Catch, ExceptionFilterMethods } from '@tsed/platform-exceptions';
import { Exception } from '@tsed/exceptions';

@Catch(Error, Exception)
export class BaseErrorFilter implements ExceptionFilterMethods {
  catch (exception: Exception, ctx: PlatformContext) {
    const {
      response,
      logger
    } = ctx;
    const message = exception.message.replace(/['"]+/g, '');
    const error = {
      status: 'error',
      message: message,
      data: exception.body
    };

    logger.error({
      error
    });

    response
      .status(exception.status || 500)
      .body(error);
  }
}
