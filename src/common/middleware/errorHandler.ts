import { AppHttpError } from '@/common/exceptions/appHttpError';
import { ServiceResponse } from '@/common/models/serviceResponse';
import logger from '@/common/utils/logger';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).send('Not Found');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppHttpError) {
    logger.debug(err.toJSON());
    res
      .status(err.statusCode)
      .send(
        ServiceResponse.failure(
          err.message,
          null,
          err.statusCode,
          err.errorCode
        )
      );
  } else {
    logger.error(err);
    const errorResponse = ServiceResponse.failure(
      'An unexpected error occurred',
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'SERVER_ERR'
    );
    res.status(errorResponse.statusCode).send(errorResponse);
  }
};

export default (): [RequestHandler, ErrorRequestHandler] => [
  unexpectedRequest,
  addErrorToRequestLog,
];
