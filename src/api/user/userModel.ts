import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export type UserDTO = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

export type NewUserDTO = z.infer<typeof NewUserSchema>;
export const NewUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must not exceed 64 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export const PostUserSchema = z.object({
  body: NewUserSchema,
});
