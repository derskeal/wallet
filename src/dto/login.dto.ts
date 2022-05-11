import { Email, Required } from '@tsed/schema';

export default class LoginDto {
  @Email()
  email: string

  @Required()
  password: string
}
