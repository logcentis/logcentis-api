import { UserSchema } from '@/api/user/userModel';
import { passwordSchema } from '@/common/models/commonValidations';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
export const SessionPayloadSchema = z.object({
  sessionId: z.string().uuid(),
  user: UserSchema,
});

export const PostLoginSchema = z.object({
  body: z.object({
    email: z.string().email().openapi({
      description: "User's email address",
    }),
    password: passwordSchema,
  }),
});
