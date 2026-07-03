export default function ReviewStars({
  rating,
  count,
}: {
  rating: number
  count?: number
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex text-honey-500" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="15" height="15" viewBox="0 0 20 20" fill={i <= Math.round(rating) ? 'currentColor' : '#E7E5E4'}>
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
          </svg>
        ))}
      </span>
      <span className="text-sm font-semibold text-hive-800">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-hive-500">({count})</span>
      )}
    </span>
  )
}
