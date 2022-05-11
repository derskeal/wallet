import { Inject, Service } from '@tsed/di';
import { PrismaClient } from '@prisma/client';
import { PaystackService } from './paystackService';
import { IPaymentInit } from '../types';
import { User, Wallet } from '.prisma/client';
import { BadRequest, InternalServerError, PaymentRequired, UnprocessableEntity } from '@tsed/exceptions';

@Service()
export class WalletService {
  private readonly prismaClient: PrismaClient;
  constructor(@Inject() private paystackService: PaystackService) {
    this.prismaClient = new PrismaClient();
  }

  async initiateFunding(user: User, amount: number): Promise<IPaymentInit> {
    const data = await this.paystackService.initialize(user.email, amount);

    await this.prismaClient.transaction.create({
      data: {
        type: 'CREDIT',
        amount,
        status: 'PENDING',
        source: {
          create: {
            type: 'FUNDING',
            sourceId: data.reference
          }
        },
        // may not be useful if the transactionSource tracks the wallet transactions. Problem is how to fetch all transactions on a wallet
        Wallet: {
          connect: {
            userId: user.id
          }
        }
      }
    });
    return data;
  }

  async finalizeFunding(user: User, paymentReference: string): Promise<Wallet> {
    // todo implement a lock to prevent multiple calls from affecting a user's balance
    const data = await this.paystackService.verify(paymentReference);

    if (data.customer.email !== user.email) {
      throw new BadRequest('Invalid payment reference');
    }

    const transactionSource = await this.prismaClient.transactionSource.findFirst({
      where: {
        type: 'FUNDING',
        sourceId: paymentReference
      },
      select: {
        id: true,
        Transaction: {
          select: { id: true }
        }
      }
    });
    if (!transactionSource || !transactionSource.Transaction) throw new Error('An error occurred while trying to finalize wallet funding');

    if (data.gateway_response === 'Successful' && data.status === 'success' && data.reference === paymentReference) {
      try {
        const wallet = await this.prismaClient.wallet.findFirst({
          where: { userId: user.id },
          select: { balance: true }
        });
        if (!wallet) throw new InternalServerError('An unexpected error occurred while trying to fund wallet');

        // update transaction status
        await this.prismaClient.transaction.update({
          where: { id: transactionSource.Transaction.id },
          data: { status: 'SUCCESS' }
        });

        // fund wallet
        return await this.prismaClient.wallet.update({
          where: { userId: user.id },
          data: { balance: wallet.balance + data.amount }
        });
      } catch (e) {
        throw e;
      }
    } else {
      await this.prismaClient.transaction.update({
        where: { id: transactionSource.Transaction.id },
        data: { status: 'FAILED' }
      });
      // todo implement better error types and failure scenarios (esp payment gateway failure)
      throw new InternalServerError('Could not finalize wallet funding');
    }
  }

  async transferFunds(sourceUser: User, destinationUserId: number, amount: number): Promise<Wallet> {
    if (destinationUserId == sourceUser.id) {
      throw new UnprocessableEntity('You cannot send money to yourself');
    }

    const sourceWallet = await this.prismaClient.wallet.findFirst({
      where: {
        userId: sourceUser.id
      }
    });
    if (!sourceWallet) throw new InternalServerError(`Wallet not found for user with email ${sourceUser.email}`);

    // verify remaining balance is >= the requested amount
    if (sourceWallet.balance < amount) {
      throw new PaymentRequired('Insufficient funds');
    }

    const receivingUser = await this.prismaClient.user.findFirst({
      where: { id: destinationUserId },
      include: {
        Wallet: true
      }
    });

    if (!receivingUser || !receivingUser.Wallet) throw new InternalServerError('Receiving user wallet not found');

    const sourceTransaction = await this.prismaClient.transaction.create({
      data: {
        type: 'DEBIT',
        amount,
        status: 'PENDING',
        source: {
          create: {
            type: 'WALLET',
            sourceId: receivingUser.Wallet.id.toString()
          }
        },
        Wallet: {
          connect: {
            userId: sourceUser.id
          }
        }
      }
    });

    // create the credit transaction
    const destinationTransaction = await this.prismaClient.transaction.create({
      data: {
        type: 'CREDIT',
        amount,
        status: 'PENDING',
        source: {
          create: {
            type: 'WALLET',
            sourceId: sourceWallet.id.toString()
          }
        },
        Wallet: {
          connect: {
            userId: receivingUser.id
          }
        }
      }
    });

    // update wallet balances
    const wallet = await this.prismaClient.wallet.update({
      where: { id: sourceWallet.id },
      data: { balance: sourceWallet.balance - amount }
    });

    await this.prismaClient.wallet.update({
      where: { id: receivingUser.Wallet.id },
      data: { balance: receivingUser.Wallet.balance + amount }
    });

    // update transaction status
    await this.prismaClient.transaction.update({
      where: { id: sourceTransaction.id },
      data: { status: 'SUCCESS' }
    });

    await this.prismaClient.transaction.update({
      where: { id: destinationTransaction.id },
      data: { status: 'SUCCESS' }
    });

    return wallet;
  }
}
