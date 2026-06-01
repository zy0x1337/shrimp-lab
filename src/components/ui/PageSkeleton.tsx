/**
 * PageSkeleton — shimmer placeholder shown via React.Suspense
 * while lazy-loaded page chunks are fetching.
 * Mirrors the typical card-grid layout used across Shrimp Lab pages.
 */
export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading page…">
      {/* Page header */}
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '1.5rem' }} />

      {/* Stat row */}
      <div className="grid-4" style={{ marginBottom: '1rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />
            <div className="skeleton" style={{ height: '2rem', marginTop: '0.4rem', borderRadius: 'var(--radius)' }} />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="card">
            <div className="skeleton skeleton-text" style={{ width: '35%', marginBottom: '0.75rem' }} />
            {[0, 1, 2, 3].map(j => (
              <div
                key={j}
                className="skeleton skeleton-text"
                style={{ width: `${80 - j * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
