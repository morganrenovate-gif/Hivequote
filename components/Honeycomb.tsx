/** Subtle honeycomb background pattern used behind hero sections. */
export default function Honeycomb({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="hex"
          width="56"
          height="98"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.2)"
        >
          <polygon
            points="28,2 54,17 54,47 28,62 2,47 2,17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <polygon
            points="28,51 54,66 54,96 28,111 2,96 2,66"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            transform="translate(28,0)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  )
}
