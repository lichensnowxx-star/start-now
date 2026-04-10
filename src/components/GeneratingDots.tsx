/** 轻量三点跳动，用于生成等待；仅用 Tailwind，不改全局样式表 */
export default function GeneratingDots() {
  const delays = [0, 120, 240] as const
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-hidden>
      {delays.map((ms) => (
        <span
          key={ms}
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral/55 motion-safe:animate-bounce"
          style={{ animationDelay: `${ms}ms` }}
        />
      ))}
    </span>
  )
}
