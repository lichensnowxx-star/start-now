import { useEffect, useRef } from 'react'

const DEMO_VIDEO_SRC = '/demo/startnow_ys.mp4'

interface VideoDemoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoDemoModal({ open, onClose }: VideoDemoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      videoRef.current?.pause()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out animate-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-[24px] bg-cream p-5 shadow-soft md:p-8 animate-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-demo-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 pr-1">
          <div>
            <h2 id="video-demo-title" className="text-xl font-bold text-text md:text-2xl">
              查看演示
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-text/75 md:text-base">
              先用几十秒，看看它会怎样陪你开始
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold text-text/70 transition hover:bg-primary/15 hover:text-text"
            onClick={onClose}
            aria-label="关闭"
          >
            关闭
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10">
          <video
            ref={videoRef}
            className="aspect-video max-h-[min(70vh,560px)] w-full object-contain bg-text/5"
            controls
            playsInline
            preload="metadata"
            src={DEMO_VIDEO_SRC}
          >
            您的浏览器不支持视频播放。请将视频放到 <code className="text-xs">public/demo/startnow_ys.mp4</code> 后刷新。
          </video>
        </div>
      </div>
    </div>
  )
}
