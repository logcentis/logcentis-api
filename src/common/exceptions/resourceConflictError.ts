import { AppHttpError } from '@/common/exceptions/appHttpError';
import { StatusCodes } from 'http-status-codes';

export class ResourceConflictError extends AppHttpError {
  constructor(message = 'Resource is causing conflict with others', errorCode = 'RES_CNFLCT') {
    super(message, StatusCodes.CONFLICT, errorCode);
  }
}