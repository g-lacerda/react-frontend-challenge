import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Notice } from '@/shared/ui/notice'

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const queryErrorBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorBoundary.reset()
  }, [queryErrorBoundary])

  function retry() {
    reset()
    void router.invalidate()
  }

  return (
    <div className="mx-auto flex w-full max-w-md animate-rise flex-col gap-6 py-16">
      <div className="grid gap-2">
        <p className="label-mono text-ink-45">{t.error.eyebrow}</p>
        <h1 className="text-2xl">{t.error.title}</h1>
        <p className="text-sm text-ink-70">{t.error.description}</p>
      </div>

      <Notice className="font-mono text-xs break-words">{error instanceof Error ? error.message : String(error)}</Notice>

      <div className="flex gap-2">
        <Button onClick={retry}>{t.common.retry}</Button>
        <Button variant="ghost" onClick={() => router.navigate({ to: '/' })}>
          {t.notFound.backHome}
        </Button>
      </div>
    </div>
  )
}
