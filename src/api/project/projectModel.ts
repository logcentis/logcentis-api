import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const name = z
  .string()
  .min(1, { message: 'Project name is required' })
  .openapi({
    description: 'The name of the project',
    example: 'My Project',
  });

const description = z.string().optional().openapi({
  description: 'A brief description of the project',
  example: 'This is a sample project description.',
});

export type NewProjectDTO = z.infer<typeof NewProjectSchema>;
export const NewProjectSchema = z.object({
  name,
  description,
});

export type ProjectDTO = z.infer<typeof ProjectSchema>;
export const ProjectSchema = z.object({
  id: z.string().uuid().openapi({
    description: 'The unique identifier of the project',
  }),
  name,
  description,
  ownerId: z.string().uuid().openapi({
    description: 'The unique identifier of the user who owns the project',
  }),
  createdAt: z.string().datetime().openapi({
    description: 'The date and time when the project was created',
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'The date and time when the project was last updated',
  }),
});

export const PostProjectSchema = z.object({
  body: NewProjectSchema,
});
