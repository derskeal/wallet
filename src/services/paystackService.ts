import { Inject, Service } from '@tsed/di';
import axios from 'axios';
import { envs } from '../config/envs';
import { BadRequest, Exception, InternalServerError } from '@tsed/exceptions';
import { Logger } from '@tsed/common';
import { IPaymentInit, IPaymentVerification } from '../types';


@Service()
export class PaystackService {
  private baseUrl: string = 'https://api.paystack.co';
  constructor(@Inject() protected logger: Logger) {
  }

  async initialize(email: string, amount: number): Promise<IPaymentInit> {
    const url = this.baseUrl + '/transaction/initialize';
    try { // TODO 10/05/2022 6:52 PM optimize request code to one function
      const response = await axios.post(
        url,
        {
          email,
          amount,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${envs.PAYSTACK_SECRET_KEY}`
          },
        });

      if (response.status !== 200 || !response.data.status) throw new Exception(500, 'Unable to initialize transaction');

      return response.data.data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerError('An error occurred while trying to verify transaction');
    }
  }

  async verify(paymentReference: string): Promise<IPaymentVerification> {
    const url = this.baseUrl + `/transaction/verify/${paymentReference}`;
    try {
      const response = await axios.get(
        url,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${envs.PAYSTACK_SECRET_KEY}`
          },
        });
      this.logger.info(response);

      if (response.status !== 200 || !response.data.status) throw new Exception(500, 'Unable to verify transaction');

      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 400) throw new BadRequest(error.response.data.message);

      this.logger.error('Paystack verification error: ', error);
      throw new InternalServerError('An error occurred while trying to verify transaction');
    }

  }
}
