import { NewProjectDTO } from '@/api/project/projectModel';
import db from '@/common/db';

export class ProjectRepository {
  async createProject(newProject: NewProjectDTO, ownerId: string) {
    return await db
      .insertInto('project')
      .values({
        name: newProject.name,
        description: newProject.description,
        ownerId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getProjectsByOwnerId(ownerId: string) {
    return await db
      .selectFrom('project')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .execute();
  }
}

export const projectRepository = new ProjectRepository();