import { Controller, Inject } from '@tsed/di';
import { Post } from '@tsed/schema';
import { SuccessResponse } from '../../utils/response';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { WalletService } from '../../services/walletService';
import FundWalletDto from '../../dto/fundWallet.dto';
import { Req, UseAuth } from '@tsed/common';
import TransferFundsDto from '../../dto/transferFunds.dto';
import { JWTAuth } from '../../middlewares/JWTAuth';

@UseAuth(JWTAuth)
@Controller('/wallet')
export class WalletController {

  constructor(@Inject() private walletService: WalletService) {
  }

  @Post('/fund')
  async fund(@Req() request: Req, @BodyParams() data: FundWalletDto) {
    return new SuccessResponse(await this.walletService.initiateFunding(request.user, data.amount));
  }

  @Post('/finalize/:paymentReference')
  async finalize(@Req() request: Req, @PathParams('paymentReference') paymentReference: string) {
    return new SuccessResponse(await this.walletService.finalizeFunding(request.user, paymentReference));
  }

  @Post('/transfer')
  async transferFunds(@Req() request: Req, @BodyParams() data: TransferFundsDto) {
    const wallet = await this.walletService.transferFunds(request.user, data.recipientUserId, data.amount);
    return new SuccessResponse(wallet);
  }
}
