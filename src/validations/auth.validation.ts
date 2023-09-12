import { z } from 'zod'
import { roleZodType } from './role.validation'


export const register = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
  role: roleZodType
})

export const login = z.object({
  email: z.string(),
  password: z.string()
})

export const refreshTokens = z.object({
  refreshToken: z.string()
})

export const forgotPassword = z.object({
  email: z.string().email()
})

export const resetPassword = z.object({
  query: z.object({
    token: z.string()
  }),
  body: z.object({
    password: z.string().min(8),
  })
})

export const verifyEmail = z.object({
  token: z.string()
})

export const changePassword = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
})
