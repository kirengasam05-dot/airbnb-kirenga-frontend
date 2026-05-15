export function SavedBadge({ count }: { count: number }) { return <span className="saved-badge">{count} {count === 1 ? 'saved' : 'saved'}</span>; }
