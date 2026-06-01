import { Menu, X } from 'lucide-react'

interface MobileHeaderProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
  return (
    <header className="mobile-header" aria-label="Mobile navigation header">
      <button
        className="btn btn-ghost mobile-header__hamburger"
        onClick={onToggle}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        aria-controls="sidebar-nav"
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      <div className="mobile-header__brand">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path d="M8 18 Q10 12 14 13 Q18 14 18 10" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="9" r="1.5" fill="var(--color-primary)" />
          <path d="M10 20 Q12 19 14 20" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
        <span>Shrimp Lab</span>
      </div>
    </header>
  )
}
