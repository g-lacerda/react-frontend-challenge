import { Film } from 'lucide-react'
import { cn } from 'cn'
import { useCallback, useState } from 'react'
import { tmdbImageUrl, type ImageSize } from '@/shared/api/tmdb-client'
import { Skeleton } from '@/shared/ui/skeleton'

interface MoviePosterProps {
  path: string | null
  alt: string
  size?: ImageSize
  className?: string
}

export function MoviePoster({ path, alt, size = 'w342', className }: MoviePosterProps) {
  const src = tmdbImageUrl(path, size)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const showImage = src !== null && status !== 'error'

  const imageRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setStatus('loaded')
  }, [])

  return (
    <div className={cn('relative aspect-[2/3] overflow-hidden bg-ink-06', className)}>
      {showImage ? (
        <>
          {status === 'loading' ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            className={cn(
              'size-full object-cover transition-opacity duration-[460ms] ease-out-quint',
              status === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      ) : (
        <div
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          className="grid size-full place-items-center text-ink-45"
        >
          <Film className="size-8" strokeWidth={1.4} aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
