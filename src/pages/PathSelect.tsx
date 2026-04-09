import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BubbleCard from '../components/BubbleCard'
import Button from '../components/Button'
import type { WorkflowState } from '../types'

const emojiList = ['🧭', '📝', '🌱']

export default function PathSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  const workflow = useMemo<WorkflowState | null>(() => {
    const raw = localStorage.getItem('start-now-workflow')
    if (!raw) return null
    try {
      return JSON.parse(raw) as WorkflowState
    } catch {
      return null
    }
  }, [])

  const currentStage = workflow?.stages[workflow.currentStageIndex]
  const stageOptions = currentStage?.options ?? []
  const remainingOptions = stageOptions.filter(
    (option) => !workflow?.completedTaskIds.includes(option.id),
  )
  const completedInStage = stageOptions.length - remainingOptions.length
  const isStageCompleted = stageOptions.length > 0 && remainingOptions.length === 0

  const selectedOption =
    selected === null ? null : remainingOptions.find((option) => option.id === selected) ?? null

  const handleStart = () => {
    if (!selectedOption || !workflow) return
    const nextWorkflow: WorkflowState = {
      ...workflow,
      currentTaskId: selectedOption.id,
    }
    localStorage.setItem('start-now-workflow', JSON.stringify(nextWorkflow))
    navigate('/progress')
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-6xl flex-col px-6 py-10 md:py-14">
      <h1 className="text-3xl font-bold md:text-4xl">选择你的第一步</h1>
      <p className="mt-3 text-text/80">
        {currentStage ? `${currentStage.title} · 已完成 ${completedInStage}/${stageOptions.length}` : '请先输入目标生成行动路径。'}
      </p>

      <section className="flex flex-1 items-center py-8">
        <div className="w-full grid gap-6 md:grid-cols-3">
          {remainingOptions.map((option, index) => (
            <div
              key={option.id}
              className={index === 1 ? 'md:translate-y-6' : index === 2 ? 'md:-translate-y-2' : ''}
            >
              <BubbleCard
                option={option}
                emoji={emojiList[index] ?? '✨'}
                selected={selected === option.id}
                onClick={() => setSelected(option.id)}
              />
            </div>
          ))}
          {isStageCompleted && (
            <div className="rounded-[24px] bg-white p-6 text-text shadow-soft md:col-span-3">
              本阶段 3 个小任务都完成了，去行动进展页点击“进入下一阶段”。
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-md pb-2">
        <Button className="py-4 text-lg" onClick={handleStart} disabled={selected === null}>
          {isStageCompleted ? '本阶段已完成' : completedInStage > 0 ? '选这个继续' : '选这个开始'}
        </Button>
      </div>
    </main>
  )
}
