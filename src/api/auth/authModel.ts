import { passwordSchema } from '@/common/models/commonValidations';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const PostLoginSchema = z.object({
  body: z.object({
    email: z.string().email().openapi({
      description: "User's email address",
    }),
    password: passwordSchema,
  }),
});
