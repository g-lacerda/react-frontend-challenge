import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { Button } from './button'

interface BackToTopProps {
  label: string
  threshold?: number
}

function BackToTop({ label, threshold = 600 }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <Button
      variant="outline"
      size="icon-lg"
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-4 bottom-20 z-20 bg-background transition-[opacity,transform] duration-[260ms] ease-out-quint sm:right-6 sm:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUp />
    </Button>
  )
}

export { BackToTop }
