import { Controller, Inject } from '@tsed/di';
import { Post, Returns } from '@tsed/schema';
import { UserService } from '../../services/userService';
import UserCreateDto from '../../dto/userCreate.dto';
import { SuccessResponse } from '../../utils/response';
import { BodyParams } from '@tsed/platform-params';
import LoginDto from '../../dto/login.dto';

@Controller('/users')
export class UserController {

  constructor(@Inject() private userService: UserService) {
  }

  @Returns(201)
  @Post('/register')
  async create(@BodyParams() data: UserCreateDto): Promise<SuccessResponse<any>> {
    await this.userService.createUser(data.name, data.email, data.password);
    return new SuccessResponse({ message: 'User created' });
  }

  @Post('/login')
  async login(@BodyParams() data: LoginDto) {
    return new SuccessResponse(await this.userService.login(data.email, data.password));
  }
}
