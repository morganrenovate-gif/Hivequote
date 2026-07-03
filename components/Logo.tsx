export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <polygon
          points="16,2 28,9 28,23 16,30 4,23 4,9"
          fill="#F59F0B"
        />
        <polygon
          points="16,7 23.5,11.3 23.5,19.7 16,24 8.5,19.7 8.5,11.3"
          fill={dark ? '#1C1917' : '#FFFFFF'}
        />
        <polygon points="16,11 19.8,13.2 19.8,17.8 16,20 12.2,17.8 12.2,13.2" fill="#F59F0B" />
      </svg>
      <span
        className={`text-xl font-extrabold tracking-tight ${
          dark ? 'text-white' : 'text-hive-950'
        }`}
      >
        Hive<span className="text-honey-500">Quote</span>
      </span>
    </span>
  )
}
