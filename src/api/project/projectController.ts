import projectRepository from '@/api/project/projectRepository';
import projectService from '@/api/project/projectService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class ProjectController {
  async createProject(req: Request, res: Response) {
    const newProject = await projectService.createProject(
      req.body, // req.body is already checked by httpHandler
      req.user.id
    );

    res
      .status(StatusCodes.CREATED)
      .json(
        ServiceResponse.success(
          'Project created successfully',
          newProject,
          StatusCodes.CREATED
        )
      );
  }

  async getAllProjects(req: Request, res: Response) {
    const projects = await projectRepository.getProjectsByOwnerId(req.user.id);

    res
      .status(StatusCodes.OK)
      .json(
        ServiceResponse.success(
          'Projects retrieved successfully',
          projects,
          StatusCodes.OK
        )
      );
  }
}

export default new ProjectController();
