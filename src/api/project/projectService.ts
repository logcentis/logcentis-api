import { NewProjectDTO } from '@/api/project/projectModel';
import { ProjectRepository } from '@/api/project/projectRepository';

class ProjectService {
  private projectRepository: ProjectRepository;

  constructor(projectRepository = new ProjectRepository()) {
    this.projectRepository = projectRepository;
  }

  public async createProject(projectData: NewProjectDTO, ownerId: string) {
    const newProject = await this.projectRepository.createProject(
      projectData,
      ownerId
    );

    return newProject;
  }
}

export const projectService = new ProjectService();
