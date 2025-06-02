import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';

import {
  ServiceErrorResponseSchema,
  ServiceSuccessResponseSchema,
} from '@/common/models/serviceResponse';

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  statusCode = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceSuccessResponseSchema(schema),
        },
      },
    },
  };
}

// Use if you want multiple responses for a single endpoint

import { ResponseConfig } from '@asteasolutions/zod-to-openapi';

export interface ApiResponseConfig {
  schema: z.ZodTypeAny;
  description: string;
  statusCode: StatusCodes;
}

export function createApiResponses(configs: ApiResponseConfig[]) {
  const responses: Record<string, ResponseConfig> = {};
  configs.forEach(({ schema, description, statusCode }) => {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    responses[statusCode] = {
      description,
      content: {
        'application/json': {
          schema: isSuccess
            ? ServiceSuccessResponseSchema(schema)
            : ServiceErrorResponseSchema,
        },
      },
    };
  });

  return responses;
}
