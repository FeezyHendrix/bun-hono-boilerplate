import { z } from "zod";
import { roleZodType } from "./role.validation";

export const createUser = z.object({
  email: z.coerce.string().email(),
  password: z.coerce.string().min(8),
  fullName: z.coerce.string(),
  role: roleZodType,
});

export type CreateUserDto = z.infer<typeof createUser>;

export const getUsers = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(1),
});

export const getUser = z.object({
  id: z.coerce.string(),
});

export const updateUser = z.object({
  params: z.object({ id: z.coerce.string() }),
  body: z.object({
    email: z.string().email().optional(),
    fullName: z.string().optional(),
  })
});

export type UpdateUserDto = | z.infer<typeof updateUser>['body'] | { password: string }

export const deleteUser = z.object({ id: z.coerce.string() })