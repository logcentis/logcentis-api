import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppHttpError } from '@/common/exceptions/appHttpError';
import { ServiceResponse } from '@/common/models/serviceResponse';
import logger from '@/common/utils/logger';

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).send('Not Found');
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  if (!(err instanceof AppHttpError)) {
    res.locals.err = err;
    next(err);
  } else {
    logger.debug(err.toJSON());
    res.status(err.statusCode).send(ServiceResponse.failure(err.message, null, err.statusCode, err.errorCode));
  }
};

export default (): [RequestHandler, ErrorRequestHandler] => [
  unexpectedRequest,
  addErrorToRequestLog,
];
