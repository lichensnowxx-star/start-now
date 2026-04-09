import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateWorkflow } from '../utils/api'

interface GoalDraft {
  goal: string
  context: string
}

export default function GoalInput() {
  const navigate = useNavigate()
  const [draft, setDraft] = useLocalStorage<GoalDraft>('start-now-goal', {
    goal: '',
    context: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = draft.goal.trim().length > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const workflow = await generateWorkflow(draft.goal.trim(), draft.context.trim())
      localStorage.setItem('start-now-workflow', JSON.stringify(workflow))
      navigate('/path-select')
    } catch {
      setError('哎呀，小助手卡住了，再试一次吧～')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-4xl items-center px-6 py-10 md:py-14">
      <form className="w-full rounded-[24px] bg-white p-6 shadow-soft md:p-10" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold md:text-4xl">你现在最想搞定什么？</h1>

        <div className="mt-8 space-y-4">
          <Input
            large
            placeholder="例如：转行产品经理、雅思7分、做一个小红书账号..."
            value={draft.goal}
            maxLength={200}
            disabled={loading}
            onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
          />
          <Input
            placeholder="你现在是什么情况？（选填）"
            value={draft.context}
            maxLength={500}
            disabled={loading}
            onChange={(e) => setDraft({ ...draft, context: e.target.value })}
          />
        </div>

        {!canSubmit && (
          <p className="mt-4 text-sm text-gray-500">先告诉我你想搞定什么呀 👀</p>
        )}
        {!!error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8">
          <Button type="submit" disabled={!canSubmit} loading={loading}>
            帮我找第一步
          </Button>
        </div>
      </form>
    </main>
  )
}
