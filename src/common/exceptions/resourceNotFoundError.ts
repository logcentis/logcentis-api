import { AppHttpError } from '@/common/exceptions/appHttpError';
import { StatusCodes } from 'http-status-codes';

export default class ResourceNotFoundError extends AppHttpError {
  constructor(resource?: string, id?: string | number) {
    let formattedMessage: string;

    if (resource && id) {
      formattedMessage = `${resource} with ID ${id} not found`;
    } else if (resource) {
      formattedMessage = `${resource} not found`;
    } else {
      formattedMessage = 'Resource not found';
    }

    super(formattedMessage, StatusCodes.NOT_FOUND, 'RES_NOT_FND');
  }
}
