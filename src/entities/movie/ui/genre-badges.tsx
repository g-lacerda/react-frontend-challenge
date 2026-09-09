import { Badge } from '@/shared/ui/badge'
import { WithTooltip } from '@/shared/ui/with-tooltip'

interface GenreBadgesProps {
  genres: string[]
  max?: number
  label: string
}

export function GenreBadges({ genres, max = genres.length, label }: GenreBadgesProps) {
  if (genres.length === 0) return null

  const shown = genres.slice(0, max)
  const hidden = genres.slice(max)

  return (
    <ul className="flex min-w-0 flex-wrap items-center gap-1" aria-label={label}>
      {shown.map((genre) => (
        <li key={genre} className="min-w-0">
          <Badge className="max-w-full">
            <span className="truncate">{genre}</span>
          </Badge>
        </li>
      ))}
      {hidden.length > 0 ? (
        <li>
          <WithTooltip label={hidden.join(' · ')} side="top">
            <Badge tabIndex={-1} aria-label={hidden.join(', ')}>
              +{hidden.length}
            </Badge>
          </WithTooltip>
        </li>
      ) : null}
    </ul>
  )
}
