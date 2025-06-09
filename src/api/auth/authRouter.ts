import { createApiRequest } from '@/api-docs/openAPIRequestBuilder';
import authController from '@/api/auth/authController';
import { PostLoginSchema } from '@/api/auth/authModel';
import requireAuth from '@/common/middleware/requireAuth';
import { ServiceSuccessResponseSchema } from '@/common/models/serviceResponse';
import { validateRequest } from '@/common/utils/httpHandlers';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Router } from 'express';
import { z } from 'zod';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';

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
        'Login successful. Returns two httpOnly cookies: access_token and refresh_token and starts a session.',
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
  description: 'Login user and starts a session',
});

authRouter.post(
  '/login',
  validateRequest(PostLoginSchema),
  authController.login
);

authRegistry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  security: [{ cookieAuth: [] }],
  responses: createApiResponse(z.null(),'Logout successful. Erases httpOnly cookies: access_token and refresh_token and finishes session.', 200),
  description: 'Logout user and finish session',
});

authRouter.post('/logout', requireAuth, authController.logout);
