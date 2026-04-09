interface BrandLogoProps {
  compact?: boolean
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-primary shadow-soft">
        <span className="text-lg">⛰️</span>
      </div>
      <div className="leading-none">
        <p
          className={`bg-gradient-to-r from-coral to-primary bg-clip-text font-extrabold tracking-tight text-transparent ${
            compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
          }`}
        >
          Start Now
        </p>
        {!compact && <p className="mt-1 text-xs text-primary/90">一步一步，慢慢变厉害</p>}
      </div>
    </div>
  )
}
