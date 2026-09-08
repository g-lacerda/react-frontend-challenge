import { Bookmark, BookmarkCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'
import type { Movie } from '@/entities/movie'
import { useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { Button } from '@/shared/ui/button'
import { WithTooltip } from '@/shared/ui/with-tooltip'
import { useIsInWatchlist, useWatchlistStore } from '../model/watchlist-store'

interface WatchlistToggleProps {
  movie: Movie
  size?: 'sm' | 'default'
  className?: string
}

export function WatchlistToggle({ movie, size = 'sm', className }: WatchlistToggleProps) {
  const { t } = useTranslation()
  const isSaved = useIsInWatchlist(movie.id)
  const add = useWatchlistStore((state) => state.add)
  const remove = useWatchlistStore((state) => state.remove)
  const label = isSaved ? t.watchlist.remove : t.watchlist.add

  function toggle() {
    if (isSaved) {
      remove(movie.id)
      playSound('remove')
      toast(t.watchlist.removed(movie.title))
    } else {
      add(movie)
      playSound('add')
      toast(t.watchlist.added(movie.title))
    }
  }

  const Icon = isSaved ? BookmarkCheck : Bookmark

  return (
    <WithTooltip label={label}>
      <Button
        variant={isSaved ? 'default' : 'outline'}
        size={size}
        onClick={toggle}
        aria-pressed={isSaved}
        aria-label={label}
        className={cn(size === 'sm' && 'w-full', className)}
      >
        <Icon key={String(isSaved)} className="animate-pop" />
        {isSaved ? t.watchlist.saved : t.watchlist.save}
      </Button>
    </WithTooltip>
  )
}
