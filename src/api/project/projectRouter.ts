import { createApiRequest } from '@/api-docs/openAPIRequestBuilder';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import projectController from '@/api/project/projectController';
import { PostProjectSchema, ProjectSchema } from '@/api/project/projectModel';
import { validateRequest } from '@/common/utils/httpHandlers';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { Router } from 'express';
import { z } from 'zod';

export const projectRegistry = new OpenAPIRegistry();
export const projectRouter: Router = Router();

projectRegistry.registerPath({
  method: 'get',
  path: '/project',
  tags: ['Project'],
  security: [{ cookieAuth: [] }],
  responses: createApiResponse(z.array(ProjectSchema), 'All projects', 201),
  description: 'Find all projects related to the logged user',
});

projectRouter.get('/', projectController.getAllProjects);

projectRegistry.registerPath({
  method: 'post',
  path: '/project',
  tags: ['Project'],
  security: [{ cookieAuth: [] }],
  request: createApiRequest(PostProjectSchema),
  responses: createApiResponse(ProjectSchema, 'New Project', 201),
  description: 'Create a new project',
});

projectRouter.post(
  '/',
  validateRequest(PostProjectSchema),
  projectController.createProject
);
