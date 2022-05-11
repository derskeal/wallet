import { Email, Required } from '@tsed/schema';

export default class UserCreateDto {

  @Required()
  name: string

  @Email()
  email: string

  @Required()
  password: string
}
