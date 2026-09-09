import { Play } from 'lucide-react'
import { useState } from 'react'
import { tmdbImageUrl } from '@/shared/api/tmdb-client'
import { WithTooltip } from '@/shared/ui/with-tooltip'

interface TrailerEmbedProps {
  videoKey: string
  title: string
  backdropPath: string | null
  playLabel: string
}

export function TrailerEmbed({ videoKey, title, backdropPath, playLabel }: TrailerEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const cover = tmdbImageUrl(backdropPath, 'w780')

  return (
    <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-ink-06">
      {playing ? (
        <iframe
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <WithTooltip label={playLabel} side="top">
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={playLabel}
            className="group grid size-full place-items-center outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground"
          >
            {cover ? (
              <img
                src={cover}
                alt=""
                className="absolute inset-0 size-full object-cover opacity-60 transition-opacity duration-[260ms] group-hover:opacity-80"
              />
            ) : null}
            <span className="relative grid size-14 place-items-center rounded-full border border-foreground bg-background/80 text-foreground transition-transform duration-[260ms] ease-out-quint group-hover:scale-110">
              <Play className="ml-0.5 size-5" aria-hidden="true" />
            </span>
          </button>
        </WithTooltip>
      )}
    </div>
  )
}
