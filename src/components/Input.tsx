import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  large?: boolean
}

export default function Input({ large = false, className = '', ...props }: InputProps) {
  const baseClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-text shadow-soft transition-colors focus:border-primary focus:outline-none'
  const sizeClass = large ? 'text-lg md:text-xl' : 'text-base'

  return <input className={`${baseClass} ${sizeClass} ${className}`} {...props} />
}
