import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import LottiePlayer from '../components/LottiePlayer'
import walkerAnimation from '../assets/animations/walker.json'
import type { GoalArchiveItem, WorkflowState } from '../types'

function readWorkflow(): WorkflowState | null {
  const raw = localStorage.getItem('start-now-workflow')
  if (!raw) return null
  try {
    return JSON.parse(raw) as WorkflowState
  } catch {
    return null
  }
}

function readGoalHistory(): GoalArchiveItem[] {
  const raw = localStorage.getItem('start-now-goal-history')
  if (!raw) return []
  try {
    return JSON.parse(raw) as GoalArchiveItem[]
  } catch {
    return []
  }
}

function cubicBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  const a = mt2 * mt
  const b = 3 * mt2 * t
  const c = 3 * mt * t2
  const d = t * t2
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  }
}

type Point = { x: number; y: number }

const PATH_SEGMENTS: [Point, Point, Point, Point][] = [
  [
    { x: 30, y: 160 },
    { x: 95, y: 130 },
    { x: 145, y: 85 },
    { x: 210, y: 55 },
  ],
  [
    { x: 210, y: 55 },
    { x: 230, y: 42 },
    { x: 245, y: 28 },
    { x: 255, y: 20 },
  ],
]

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Re-parameterize by arc length so each task step looks evenly spaced.
function pointOnPathByProgress(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress))
  const samplesPerSegment = 120
  const sampled: { p: Point; s: number }[] = []
  let totalLength = 0
  let prev: Point | null = null

  for (const [p0, p1, p2, p3] of PATH_SEGMENTS) {
    for (let i = 0; i <= samplesPerSegment; i++) {
      const t = i / samplesPerSegment
      const p = cubicBezierPoint(t, p0, p1, p2, p3)
      if (prev) totalLength += distance(prev, p)
      sampled.push({ p, s: totalLength })
      prev = p
    }
  }

  const target = totalLength * clamped
  for (let i = 1; i < sampled.length; i++) {
    if (sampled[i].s >= target) {
      const a = sampled[i - 1]
      const b = sampled[i]
      const seg = b.s - a.s || 1
      const ratio = (target - a.s) / seg
      return {
        x: a.p.x + (b.p.x - a.p.x) * ratio,
        y: a.p.y + (b.p.y - a.p.y) * ratio,
      }
    }
  }
  return sampled[sampled.length - 1].p
}

export default function Progress() {
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [workflow, setWorkflow] = useState<WorkflowState | null>(() => readWorkflow())

  const currentStage = workflow?.stages[workflow.currentStageIndex]
  const currentOption = currentStage?.options.find((item) => item.id === workflow?.currentTaskId) ?? null

  const totalTasks = workflow?.stages.reduce((sum, stage) => sum + stage.options.length, 0) ?? 0
  const baseCompletedCount = workflow?.completedTaskIds.length ?? 0
  const alreadyDoneCurrentTask =
    workflow?.currentTaskId ? workflow.completedTaskIds.includes(workflow.currentTaskId) : false
  const completedCount = baseCompletedCount + (completed && !alreadyDoneCurrentTask ? 1 : 0)
  const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  const stageCompletedCount =
    currentStage?.options.filter((option) => workflow?.completedTaskIds.includes(option.id)).length ?? 0
  const stageTotalCount = currentStage?.options.length ?? 0
  const stageDoneAfterComplete =
    stageCompletedCount + (completed && workflow?.currentTaskId && !alreadyDoneCurrentTask ? 1 : 0)
  const isCurrentStageCompleted = stageTotalCount > 0 && stageDoneAfterComplete >= stageTotalCount
  const hasNextStage = workflow ? workflow.currentStageIndex < workflow.stages.length - 1 : false
  const allDone = totalTasks > 0 && completedCount >= totalTasks
  const progressT = totalTasks > 0 ? completedCount / totalTasks : 0
  const pathPoint = pointOnPathByProgress(progressT)
  const climberLeft = (pathPoint.x / 320) * 100
  const climberTop = (pathPoint.y / 180) * 100

  const handleComplete = () => {
    if (completed || !workflow?.currentTaskId) return
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } })
    setCompleted(true)

    if (workflow.completedTaskIds.includes(workflow.currentTaskId)) return
    const nextWorkflow: WorkflowState = {
      ...workflow,
      completedTaskIds: [...workflow.completedTaskIds, workflow.currentTaskId],
    }
    localStorage.setItem('start-now-workflow', JSON.stringify(nextWorkflow))
    setWorkflow(nextWorkflow)
  }

  const goNextInStage = () => {
    navigate('/path-select')
  }

  const enterNextStage = () => {
    if (!workflow || !isCurrentStageCompleted || !hasNextStage) return
    const nextWorkflow: WorkflowState = {
      ...workflow,
      currentStageIndex: workflow.currentStageIndex + 1,
      currentTaskId: null,
    }
    localStorage.setItem('start-now-workflow', JSON.stringify(nextWorkflow))
    setWorkflow(nextWorkflow)
    navigate('/path-select')
  }

  const startNewGoal = () => {
    if (workflow && allDone && !workflow.isDemo) {
      const total = workflow.stages.reduce((sum, stage) => sum + stage.options.length, 0)
      const archiveItem: GoalArchiveItem = {
        id: `${Date.now()}`,
        goalTitle: workflow.goalTitle || '未命名目标',
        goalContext: workflow.goalContext || '',
        completedAt: new Date().toISOString(),
        completedTasks: workflow.completedTaskIds.length,
        totalTasks: total,
        stageCount: workflow.stages.length,
      }
      const history = readGoalHistory()
      localStorage.setItem('start-now-goal-history', JSON.stringify([archiveItem, ...history]))
    }
    localStorage.removeItem('start-now-workflow')
    navigate('/goal')
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-6xl flex-col px-6 py-10 md:py-14">
      <h1 className="text-3xl font-bold md:text-4xl">行动进展</h1>
      <p className="mt-3 text-text/80">
        阶段进度 {Math.min(stageDoneAfterComplete, stageTotalCount)}/{stageTotalCount} · 整体进度 {percent}%
      </p>
      {workflow?.isDemo && (
        <p className="mt-2 text-sm text-primary/90">演示模式 · 进度与庆祝都是真实的交互感，不会写入你的成长档案哦。</p>
      )}

      <section className="mt-8 flex-1 grid content-center gap-6">
        <div className="grid gap-6 rounded-[24px] bg-white p-6 shadow-soft md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">当前步骤：{currentOption?.title ?? '先做一套真题'}</h2>
            <p className="mt-2 text-text/80">预计时间：{currentOption?.duration ?? '30分钟'}</p>
            <p className="mt-2 text-text/80">{currentOption?.desc ?? '完成后可获得更准确的下一步建议。'}</p>
            <div className="mt-6 max-w-xs">
              <Button onClick={handleComplete} disabled={completed}>
                已完成
              </Button>
            </div>
            {completed && <p className="mt-4 text-primary">太棒了！你又前进了一步 🎉</p>}
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-cream p-6">
            <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-cream">
              <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full">
                <path d="M10 165 L145 35 L185 75 L255 20 L310 165 Z" fill="#9bc4b4" opacity="0.95" />
                <path d="M125 55 L145 35 L165 55 Z" fill="#ffffff" opacity="0.95" />
                <path d="M233 42 L255 20 L278 42 Z" fill="#ffffff" opacity="0.95" />
                <path
                  d="M30 160 C95 130, 145 85, 210 55 C230 42, 245 28, 255 20"
                  stroke="#F4A261"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  fill="none"
                  opacity="0.9"
                />
              </svg>
              <div
                className="absolute transition-all duration-700 ease-out"
                style={{
                  left: `${climberLeft}%`,
                  top: `${climberTop}%`,
                  // Anchor the character's feet on the path point.
                  transform: 'translate(-50%, -88%)',
                }}
              >
                <LottiePlayer
                  animationData={walkerAnimation}
                  className="h-10 w-10"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}
                />
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold text-primary">整体进度 {percent}%</p>
            <p className="mt-1 text-sm text-text/70">
              已完成 {completedCount}/{totalTasks} 个行动
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {allDone ? (
            <>
              <Button className="py-4 text-lg" onClick={startNewGoal}>
                {workflow?.isDemo ? '演示结束，去定制我的目标' : '开始新的目标'}
              </Button>
              <Button className="py-4 text-lg" variant="secondary" onClick={() => navigate('/')}>
                回到首页
              </Button>
            </>
          ) : (
            <>
              <Button
                className="py-4 text-lg"
                onClick={goNextInStage}
                disabled={isCurrentStageCompleted}
              >
                {isCurrentStageCompleted ? '本阶段已完成' : '继续下一步'}
              </Button>
              <Button
                className={`py-4 text-lg ${
                  isCurrentStageCompleted
                    ? 'bg-coral text-white ring-4 ring-coral/30 hover:brightness-95'
                    : 'opacity-70'
                }`}
                variant={isCurrentStageCompleted ? 'primary' : 'secondary'}
                onClick={enterNextStage}
                disabled={!isCurrentStageCompleted}
              >
                进入下一阶段
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-xl border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-primary/10"
            onClick={() => setShowChecklist(true)}
          >
            查看行动清单
          </button>
        </div>
      </section>

      {showChecklist && workflow && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowChecklist(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-lg font-bold">行动清单</h3>
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-sm text-text/70 transition hover:bg-gray-100"
                onClick={() => setShowChecklist(false)}
              >
                关闭
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
              {workflow.stages.map((stage, stageIndex) => (
                <section key={stage.id} className="rounded-xl bg-cream p-4">
                  <p className="text-sm font-semibold text-text/70">{stage.title}</p>
                  <ul className="mt-3 space-y-2">
                    {stage.options.map((option, taskIndex) => {
                      const done = workflow.completedTaskIds.includes(option.id)
                      const current = workflow.currentTaskId === option.id
                      return (
                        <li
                          key={option.id}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            done
                              ? 'bg-primary/20 text-text'
                              : current
                                ? 'bg-coral/20 text-text'
                                : 'bg-white text-text/80'
                          }`}
                        >
                          <span className="font-semibold">
                            {done ? '✓' : current ? '→' : '○'} 阶段{stageIndex + 1}-{taskIndex + 1}
                          </span>{' '}
                          {option.title}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
