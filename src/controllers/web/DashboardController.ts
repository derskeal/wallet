import { Constant, Controller } from '@tsed/di';
import { View } from '@tsed/platform-views';
import { SwaggerSettings } from '@tsed/swagger';
import { Get, Hidden, Returns } from '@tsed/schema';

@Hidden()
@Controller('/dashboard')
export class IndexController {
  @Constant('swagger')
  private swagger: SwaggerSettings[];

  @Get('/')
  @View('dashboard.ejs')
  @(Returns(200, String).ContentType('text/html'))
  get() {
    return {

    };
  }
}
