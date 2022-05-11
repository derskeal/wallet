import { ResponseStatus } from '../types';

export class SuccessResponse<T> {
  status: ResponseStatus = 'success'

  constructor (private data: T) {
  }
}
