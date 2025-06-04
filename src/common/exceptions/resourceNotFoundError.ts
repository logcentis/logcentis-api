import { AppHttpError } from '@/common/exceptions/appHttpError';
import { StatusCodes } from 'http-status-codes';

export default class ResourceNotFoundError extends AppHttpError {
  constructor(resource?: string, id?: string | number) {
    if (resource && id) {
      super(`Resource not found: ${resource} with ID ${id}`, StatusCodes.NOT_FOUND, 'RES_NOT_FND');
    } else if (resource) {
      super(`Resource not found: ${resource}`);
    } else {
      super('Resource not found');
    }
  }
}
