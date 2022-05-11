import { Description, Min, Required } from '@tsed/schema';

export default class TransferFundsDto {
  @Required()
  @Description('The recipient\'s user ID') // TODO A form of public reference i.e user handle should be used instead. Keeping this for speed
  recipientUserId: number

  @Required()
  @Min(10000) // minimum of 100 NGN
  amount: number
}
