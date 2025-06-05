import { ZodRequestBody } from '@asteasolutions/zod-to-openapi';
import { RouteParameter } from '@asteasolutions/zod-to-openapi/dist/openapi-registry';
import { z } from 'zod';

export function createApiRequest(requestSchema: z.AnyZodObject): {
  body?: ZodRequestBody;
  params?: RouteParameter;
  query?: RouteParameter;
  headers?: z.ZodTypeAny[];
} {
  // const openApiSchema =
  return {
    body: {
      content: {
        'application/json': {
          schema: requestSchema.shape.body,
        },
      },
      required: true,
    },
    params: requestSchema.shape.params,
    query: requestSchema.shape.query,
    headers: requestSchema.shape.headers,
  };
}
