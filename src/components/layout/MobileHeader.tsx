/**
 * MobileHeader — visible only on small viewports (≤768px).
 * Renders the brand logo + hamburger toggle for the slide-over sidebar.
 */
import { Menu, X } from 'lucide-react'

interface MobileHeaderProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="mobile-header" aria-label="Mobile navigation header">
      {/* Brand */}
      <div className="sidebar-logo" style={{ border: 'none', margin: 0, padding: 0 }}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-label="Shrimp Lab logo">
          <circle cx="14" cy="14" r="13" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path
            d="M8 18 Q10 12 14 13 Q18 14 18 10"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="18" cy="9" r="1.5" fill="var(--color-primary)" />
          <path
            d="M10 20 Q12 19 14 20"
            stroke="var(--color-primary)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="sidebar-brand">Shrimp Lab</span>
      </div>

      {/* Hamburger */}
      <button
        className="btn btn-ghost mobile-header__toggle"
        onClick={onToggle}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        aria-controls="sidebar-nav"
      >
        {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>
    </header>
  )
}
