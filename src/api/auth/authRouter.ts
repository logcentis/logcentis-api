import { createApiRequest } from '@/api-docs/openAPIRequestBuilder';
import authController from '@/api/auth/authController';
import { PostLoginSchema } from '@/api/auth/authModel';
import requireAuth from '@/common/middleware/requireAuth';
import { ServiceSuccessResponseSchema } from '@/common/models/serviceResponse';
import { validateRequest } from '@/common/utils/httpHandlers';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Router } from 'express';
import { z } from 'zod';

export const authRouter: Router = express.Router();
export const authRegistry = new OpenAPIRegistry();

authRegistry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: createApiRequest(PostLoginSchema),
  responses: {
    200: {
      description:
        'Login successful. Returns two httpOnly cookies: access_token and refresh_token.',
      headers: {
        'Set-Cookie': {
          schema: { type: 'string' },
          description: 'HTTPOnly cookies: access_token and refresh_token',
        },
      },
      content: {
        'application/json': {
          schema: ServiceSuccessResponseSchema(z.null()),
        },
      },
    },
  },
  description: 'Login user and set auth cookies',
});

authRouter.post(
  '/login',
  validateRequest(PostLoginSchema),
  authController.login
);

authRouter.post('/logout', requireAuth, authController.logout);
