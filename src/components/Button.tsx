import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'w-full rounded-xl px-6 py-3 text-base font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4'
  const variantClasses =
    variant === 'primary'
      ? 'bg-coral text-white hover:brightness-95 focus:ring-coral/30'
      : 'bg-white text-text border border-primary/30 hover:bg-primary/10 focus:ring-primary/30'
  const disabledClasses = 'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600'

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '加载中...' : children}
    </button>
  )
}
