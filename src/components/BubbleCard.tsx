import type { PathOption } from '../types'

interface BubbleCardProps {
  option: PathOption
  emoji: string
  selected?: boolean
  onClick?: () => void
}

export default function BubbleCard({
  option,
  emoji,
  selected = false,
  onClick,
}: BubbleCardProps) {
  return (
    <button
      className={`relative w-full rounded-[24px] p-5 text-left shadow-soft transition ${
        selected ? 'bg-coral/20 ring-2 ring-coral' : 'bg-white hover:-translate-y-0.5'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="mb-2 block text-2xl">{emoji}</span>
      <h3 className="text-lg font-semibold">{option.title}</h3>
      <p className="mt-1 text-sm text-text/80">{option.desc}</p>
      <p className="mt-2 text-sm font-medium text-primary">预计：{option.duration}</p>
      <span className="absolute -bottom-3 left-8 h-6 w-6 rotate-45 bg-inherit" />
    </button>
  )
}
