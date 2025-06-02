import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  ServiceErrorResponseSchema,
  ServiceResponse,
  ServiceSuccessResponseSchema,
} from '../serviceResponse';

describe('ServiceResponse', () => {
  describe('success', () => {
    it('should create a success response with default status code', () => {
      const resp = ServiceResponse.success('OK', { foo: 'bar' });
      expect(resp.success).toBe(true);
      expect(resp.message).toBe('OK');
      expect(resp.responseObject).toEqual({ foo: 'bar' });
      expect(resp.statusCode).toBe(StatusCodes.OK);
      expect(resp.errorCode).toBeUndefined();
    });

    it('should create a success response with custom status code', () => {
      const resp = ServiceResponse.success(
        'Created',
        { id: 1 },
        StatusCodes.CREATED
      );
      expect(resp.statusCode).toBe(StatusCodes.CREATED);
    });

    it('should throw if errorCode is provided for success', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => new (ServiceResponse as any)(true, 'msg', {}, 200, 'ERR')
      ).toThrow('errorCode must not be present for success responses');
    });
  });

  describe('failure', () => {
    it('should create a failure response with default status code', () => {
      const resp = ServiceResponse.failure(
        'Bad',
        { error: true },
        undefined,
        'ERR_CODE'
      );
      expect(resp.success).toBe(false);
      expect(resp.message).toBe('Bad');
      expect(resp.responseObject).toEqual({ error: true });
      expect(resp.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(resp.errorCode).toBe('ERR_CODE');
    });

    it('should create a failure response with custom status code', () => {
      const resp = ServiceResponse.failure(
        'Not Found',
        null,
        StatusCodes.NOT_FOUND,
        'NOT_FOUND'
      );
      expect(resp.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(resp.errorCode).toBe('NOT_FOUND');
    });

    it('should throw if errorCode is missing for failure', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => new (ServiceResponse as any)(false, 'fail', {}, 400)
      ).toThrow('errorCode is required for failure responses');
    });
  });
});

describe('ServiceSuccessResponseSchema', () => {
  it('should validate a correct success response', () => {
    const schema = ServiceSuccessResponseSchema(z.object({ foo: z.string() }));
    const result = schema.safeParse({
      success: true,
      message: 'ok',
      responseObject: { foo: 'bar' },
      statusCode: 200,
    });
    expect(result.success).toBe(true);
  });

  it('should fail validation if success is not true', () => {
    const schema = ServiceSuccessResponseSchema(z.object({}));
    const result = schema.safeParse({
      success: false,
      message: 'fail',
      statusCode: 400,
    });
    expect(result.success).toBe(false);
  });
});

describe('ServiceErrorResponseSchema', () => {
  it('should validate a correct error response', () => {
    const result = ServiceErrorResponseSchema.safeParse({
      success: false,
      message: 'fail',
      responseObject: { error: true },
      statusCode: 400,
      errorCode: 'ERR',
    });
    expect(result.success).toBe(true);
  });

  it('should fail validation if errorCode is missing', () => {
    const result = ServiceErrorResponseSchema.safeParse({
      success: false,
      message: 'fail',
      statusCode: 400,
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation if success is not false', () => {
    const result = ServiceErrorResponseSchema.safeParse({
      success: true,
      message: 'ok',
      statusCode: 200,
      errorCode: 'ERR',
    });
    expect(result.success).toBe(false);
  });
});
