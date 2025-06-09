import { NewProjectDTO } from '@/api/project/projectModel';
import projectRepository from '@/api/project/projectRepository';

class ProjectService {
  public async createProject(projectData: NewProjectDTO, ownerId: string) {
    const newProject = await projectRepository.createProject(
      projectData,
      ownerId
    );

    return newProject;
  }
}

export default new ProjectService();
