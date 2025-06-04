import express, { Router } from 'express';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { PostUserSchema, UserSchema } from '@/api/user/userModel';
import userController from '@/api/user/userController';
import { validateRequest } from '@/common/utils/httpHandlers';

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.registerPath({
  method: 'get',
  path: '/user/me',
  tags: ['User'],
  responses: createApiResponse(UserSchema, 'Current User', 200),
  description: 'Get the current authenticated user',
});

userRouter.get('/me', userController.findCurrentUser);

userRegistry.registerPath({
  method: 'post',
  path: '/user',
  tags: ['User'],
  responses: createApiResponse(UserSchema, 'New User', 200),
  description: 'Create a new user',
});

userRouter.post('/', validateRequest(PostUserSchema), userController.createUser);
