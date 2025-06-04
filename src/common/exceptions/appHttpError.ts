import { StatusCodes } from 'http-status-codes';

export class AppHttpError extends Error {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly errorCode: string;

  constructor(
    message = 'Failure processing request',
    statusCode = StatusCodes.BAD_GATEWAY,
    errorCode = 'REQ_FAIL',
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
    };
  }
}