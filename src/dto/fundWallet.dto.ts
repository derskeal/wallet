import { Min, Required } from '@tsed/schema';

export default class FundWalletDto {
  @Required()
  @Min(10000) // minimum of 100 NGN
  amount: number
}
