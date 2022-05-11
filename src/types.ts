export type ResponseStatus = 'success' | 'error'

export interface IPaymentInit {
  authorization_url: string,
  access_code: string,
  reference: string
}

export interface IPaymentVerification {
  amount: number,
  status: string,
  reference: string,
  gateway_response: string,
  customer: {
    email: string
  }
}
