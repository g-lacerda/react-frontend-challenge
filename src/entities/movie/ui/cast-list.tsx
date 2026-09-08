import { tmdbImageUrl } from '@/shared/api/tmdb-client'
import { useTranslation } from '@/shared/i18n'
import { Carousel } from '@/shared/ui/carousel'
import type { CastMember } from '../model/types'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

interface CastListProps {
  cast: CastMember[]
}

export function CastList({ cast }: CastListProps) {
  const { t } = useTranslation()

  return (
    <Carousel label={t.movie.cast} previousLabel={t.common.previous} nextLabel={t.common.next}>
      {cast.map((member) => {
        const photo = tmdbImageUrl(member.profilePath, 'w185')
        return (
          <div key={member.id} className="w-28 shrink-0 snap-start animate-rise sm:w-32">
            <div className="mb-2 grid aspect-[2/3] w-full place-items-center overflow-hidden rounded-md border border-border bg-ink-03 font-mono text-sm text-ink-70">
              {photo ? (
                <img src={photo} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <span aria-hidden="true">{initials(member.name)}</span>
              )}
            </div>
            <p className="truncate text-xs font-medium" title={member.name}>
              {member.name}
            </p>
            <p className="truncate text-[11px] text-ink-45" title={member.character}>
              {member.character}
            </p>
          </div>
        )
      })}
    </Carousel>
  )
}
