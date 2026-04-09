import lottie from 'lottie-web'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

interface LottiePlayerProps {
  animationData: object
  loop?: boolean
  className?: string
  style?: CSSProperties
}

export default function LottiePlayer({
  animationData,
  loop = true,
  className,
  style,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData,
    })

    return () => {
      instance.destroy()
    }
  }, [animationData, loop])

  return <div ref={containerRef} className={className} style={style} />
}
