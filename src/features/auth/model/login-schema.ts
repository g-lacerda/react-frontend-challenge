import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 7

interface LoginMessages {
  invalidEmail: string
  shortPassword: string
}

export function createLoginSchema(messages: LoginMessages) {
  return z.object({
    email: z.email(messages.invalidEmail),
    password: z.string().min(PASSWORD_MIN_LENGTH, messages.shortPassword),
  })
}

export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>
