import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

extendZodWithOpenApi(z);

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly responseObject: T;
  readonly statusCode: number;
  readonly errorCode?: string;

  private constructor(
    success: boolean,
    message: string,
    responseObject: T,
    statusCode: number,
    errorCode?: string
  ) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
    if (!success && !errorCode) {
      throw new Error('errorCode is required for failure responses');
    }
    if (success && errorCode) {
      throw new Error('errorCode must not be present for success responses');
    }
    this.errorCode = errorCode;
  }

  static success<T>(
    message: string,
    responseObject: T,
    statusCode: number = StatusCodes.OK
  ) {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }

  static failure<T>(
    message: string,
    responseObject: T,
    statusCode: number = StatusCodes.BAD_REQUEST,
    errorCode: string // Agora obrigatório
  ) {
    return new ServiceResponse(
      false,
      message,
      responseObject,
      statusCode,
      errorCode
    );
  }
}

export const ServiceSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    responseObject: dataSchema.optional(),
    statusCode: z.number().openapi({ example: StatusCodes.OK }),
  });

export const ServiceErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  responseObject: z.any().optional(),
  statusCode: z.number().openapi({ example: StatusCodes.BAD_REQUEST }),
  errorCode: z.string().openapi({ example: 'ERR_INVALID_REQ' }),
});
