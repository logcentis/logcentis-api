import { AppHttpError } from '@/common/exceptions/appHttpError';

export class InvalidCredentialsError extends AppHttpError {
  constructor(
    message = 'Invalid credentials provided',
    errorCode = 'INVLD_CREDNT'
  ) {
    super(message, 401, errorCode);
  }
}
