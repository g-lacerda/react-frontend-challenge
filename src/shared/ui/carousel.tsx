import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "cn"
import { playWhoosh } from "@/shared/lib/sounds"
import { Button } from "./button"
import { WithTooltip } from "./with-tooltip"

interface CarouselProps {
  label: string
  previousLabel: string
  nextLabel: string
  className?: string
  children: React.ReactNode
}

function Carousel({ label, previousLabel, nextLabel, className, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ previous: false, next: false })

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScroll({ previous: track.scrollLeft > 4, next: track.scrollLeft < maxScroll - 4 })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    update()
    track.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(track)
    return () => {
      track.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [update])

  function scrollBy(direction: -1 | 1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" })
    playWhoosh(direction === 1 ? 0.8 : 0.2)
  }

  const arrowClass =
    "inline-flex h-auto w-9 shrink-0 self-stretch sm:w-11 [&_svg:not([class*='size-'])]:size-5"

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("flex w-full min-w-0 items-stretch gap-3", className)}
    >
      <WithTooltip label={previousLabel}>
        <Button
          variant="outline"
          onClick={() => scrollBy(-1)}
          disabled={!canScroll.previous}
          aria-label={previousLabel}
          className={arrowClass}
        >
          <ChevronLeft />
        </Button>
      </WithTooltip>

      <div
        ref={trackRef}
        className="scrollbar-none flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth"
      >
        {children}
      </div>

      <WithTooltip label={nextLabel}>
        <Button
          variant="outline"
          onClick={() => scrollBy(1)}
          disabled={!canScroll.next}
          aria-label={nextLabel}
          className={arrowClass}
        >
          <ChevronRight />
        </Button>
      </WithTooltip>
    </div>
  )
}

export { Carousel }
