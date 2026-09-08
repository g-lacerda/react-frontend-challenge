import { useCallback, useRef, useState } from 'react'

function countColumns(node: HTMLElement) {
  const template = getComputedStyle(node).gridTemplateColumns
  return template === 'none' ? 0 : template.split(' ').length
}

export function useGridColumns<T extends HTMLElement>() {
  const [columns, setColumns] = useState(0)
  const observerRef = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return

    setColumns(countColumns(node))
    observerRef.current = new ResizeObserver(() => setColumns(countColumns(node)))
    observerRef.current.observe(node)
  }, [])

  return { ref, columns }
}
