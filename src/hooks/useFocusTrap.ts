import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Traps keyboard focus inside `containerRef` when `active` is true.
 *
 * - Tab / Shift+Tab cycle within focusable children
 * - Escape calls `onEscape` if provided
 * - On activate: moves focus to first focusable child (or container itself)
 * - On deactivate: returns focus to `returnFocusRef` if provided
 */
export function useFocusTrap({
  active,
  onEscape,
  returnFocusRef,
}: {
  active: boolean
  onEscape?: () => void
  returnFocusRef?: React.RefObject<HTMLElement | null>
}) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current

    // Move focus into the trap
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE)
    ;(firstFocusable ?? container).focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(el => !el.closest('[inert]') && el.offsetParent !== null)

      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus()
      }
    }
  }, [active, onEscape, returnFocusRef])

  return containerRef
}
