import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Notice } from '@/shared/ui/notice'
import { Spinner } from '@/shared/ui/spinner'
import { TextField } from '@/shared/ui/text-field'
import { useAuthStore } from '../model/auth-store'
import { createLoginSchema, type LoginValues } from '../model/login-schema'

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const schema = useMemo(() => createLoginSchema(t.login.errors), [t])

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const { errors, isSubmitting } = form.formState
  const firstError = errors.email?.message ?? errors.password?.message

  async function onSubmit(values: LoginValues) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    login(values.email)
    toast.success(t.login.welcome)
    await navigate({ to: redirectTo ?? '/' })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <TextField label={t.login.email} htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="curador@cinedash.app"
          aria-invalid={Boolean(errors.email)}
          {...form.register('email')}
        />
      </TextField>

      <TextField label={t.login.password} htmlFor="password" hint={t.login.passwordHint}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...form.register('password')}
        />
      </TextField>

      {firstError ? <Notice>{firstError}</Notice> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Spinner className="border-ink-28 border-t-primary-foreground" /> : t.login.submit}
      </Button>
    </form>
  )
}
