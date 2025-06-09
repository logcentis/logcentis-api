import projectController from '@/api/project/projectController';
import { PostProjectSchema } from '@/api/project/projectModel';
import { validateRequest } from '@/common/utils/httpHandlers';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { Router } from 'express';

export const projectRegistry = new OpenAPIRegistry();
export const projectRouter: Router = Router();

projectRouter.post(
  '/',
  validateRequest(PostProjectSchema),
  projectController.createProject
);

projectRouter.get('/', projectController.getAllProjects);
