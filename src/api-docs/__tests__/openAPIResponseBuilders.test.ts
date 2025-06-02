import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  ApiResponseConfig,
  createApiResponse,
  createApiResponses,
} from '../openAPIResponseBuilders';

jest.mock('@/common/models/serviceResponse', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ServiceSuccessResponseSchema: (schema: any) => ({
    success: true,
    responseObject: schema,
  }),
  ServiceErrorResponseSchema: { success: false, errorCode: 'ERROR' },
}));

describe('createApiResponse', () => {
  it('should return a response object with the correct schema and description', () => {
    const schema = z.object({ foo: z.string() });
    const description = 'A successful response';
    const result = createApiResponse(schema, description);

    expect(result).toHaveProperty(String(StatusCodes.OK));
    expect(result[StatusCodes.OK].description).toBe(description);
    expect(result[StatusCodes.OK].content['application/json'].schema).toEqual({
      success: true,
      responseObject: schema,
    });
  });

  it('should use the provided status code', () => {
    const schema = z.object({ bar: z.number() });
    const description = 'Created';
    const statusCode = StatusCodes.CREATED;
    const result = createApiResponse(schema, description, statusCode);

    expect(result).toHaveProperty(`${statusCode}`);
    expect(result[statusCode].description).toBe(description);
    expect(result[statusCode].content['application/json'].schema).toEqual({
      success: true,
      responseObject: schema,
    });
  });
});

describe('createApiResponses', () => {
  it('should return multiple responses with correct schemas', () => {
    const successSchema = z.object({ id: z.string() });
    const errorSchema = z.object({ message: z.string() }); // not used, just for clarity

    const configs: ApiResponseConfig[] = [
      {
        schema: successSchema,
        description: 'Success',
        statusCode: StatusCodes.OK,
      },
      {
        schema: errorSchema,
        description: 'Bad Request',
        statusCode: StatusCodes.BAD_REQUEST,
      },
    ];

    const result = createApiResponses(configs);

    expect(result[StatusCodes.OK].description).toBe('Success');
    expect(
      result[StatusCodes.OK]?.content?.['application/json']?.schema
    ).toEqual({
      success: true,
      responseObject: successSchema,
    });

    expect(result[StatusCodes.BAD_REQUEST]?.description).toBe('Bad Request');
    expect(
      result[StatusCodes.BAD_REQUEST]?.content?.['application/json']?.schema
    ).toEqual({
      success: false,
      errorCode: 'ERROR',
    });
  });

  it('should handle empty configs array', () => {
    const result = createApiResponses([]);
    expect(result).toEqual({});
  });
});
