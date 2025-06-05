import { passwordSchema } from '@/common/models/commonValidations';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type UserDTO = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).openapi({
    description: 'User name',
    example: 'John Doe',
  }),
  email: z.string().email(),
});

export type NewUserDTO = z.infer<typeof NewUserSchema>;
export const NewUserSchema = UserSchema.omit({ id: true }).extend({
  password: passwordSchema,
});

export const PostUserSchema = z.object({
  body: NewUserSchema,
});
