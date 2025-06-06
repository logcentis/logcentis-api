import { AppHttpError } from '@/common/exceptions/appHttpError';

export class AuthenticationError extends AppHttpError {
  constructor(message = 'Authentication failed', errorCode = 'AUTH_FAILD') {
    super(message, 401, errorCode);
  }
}
