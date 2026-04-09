import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import type { GoalArchiveItem, WorkflowState } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()

  const workflow = useMemo<WorkflowState | null>(() => {
    const raw = localStorage.getItem('start-now-workflow')
    if (!raw) return null
    try {
      return JSON.parse(raw) as WorkflowState
    } catch {
      return null
    }
  }, [])

  const goalHistory = useMemo<GoalArchiveItem[]>(() => {
    const raw = localStorage.getItem('start-now-goal-history')
    if (!raw) return []
    try {
      return JSON.parse(raw) as GoalArchiveItem[]
    } catch {
      return []
    }
  }, [])

  const totalTasks = workflow?.stages.reduce((sum, stage) => sum + stage.options.length, 0) ?? 0
  const completedTasks = workflow?.completedTaskIds.length ?? 0
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-6xl flex-col px-6 py-10 md:py-14">
      <h1 className="text-3xl font-bold md:text-4xl">你走过的每一步，都算数</h1>
      <p className="mt-3 text-text/80">这里会持续记录你完成过的目标和当前进展。</p>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-[24px] bg-white p-6 shadow-soft">
          <p className="text-sm text-text/70">当前进度</p>
          <p className="mt-2 text-3xl font-bold text-primary">{percent}%</p>
          <p className="mt-2 text-text/80">
            已完成 {completedTasks}/{totalTasks} 个行动
          </p>
          <div className="mt-6 max-w-xs">
            <Button onClick={() => navigate('/progress')}>继续当前行动</Button>
          </div>
        </article>

        <article className="rounded-[24px] bg-white p-6 shadow-soft">
          <p className="text-sm text-text/70">成长档案</p>
          <p className="mt-2 text-xl font-semibold">已完成目标 {goalHistory.length} 个</p>
          {goalHistory.length === 0 && <p className="mt-2 text-text/80">还没有历史目标，先完成一个吧。</p>}
          {goalHistory.length > 0 && (
            <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto">
              {goalHistory.map((goal) => (
                <li key={goal.id} className="rounded-xl bg-cream p-3">
                  <p className="font-semibold">{goal.goalTitle}</p>
                  <p className="mt-1 text-xs text-text/70">
                    完成 {goal.completedTasks}/{goal.totalTasks} 个任务 · {goal.stageCount} 个阶段
                  </p>
                  <p className="mt-1 text-xs text-text/60">
                    完成于 {new Date(goal.completedAt).toLocaleString('zh-CN')}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 max-w-xs">
            <Button variant="secondary" onClick={() => navigate('/goal')}>
              开启新目标
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}
