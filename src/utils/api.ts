import type { PathOption, Stage, WorkflowState } from '../types'
import { optionTextPassesQuality, stageTitlePassesQuality } from '../../shared/optionQuality'

/** options 尚无 id，由 stagesFromAiPayload 补齐 */
type StageDraft = { title: string; options: Omit<PathOption, 'id'>[] }

function parseOptionalField(x: Record<string, unknown>, key: string): string | undefined {
  const v = x[key]
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

function parseOption(o: unknown): Omit<PathOption, 'id'> | null {
  if (!o || typeof o !== 'object') return null
  const x = o as Record<string, unknown>
  if (typeof x.title !== 'string' || typeof x.duration !== 'string' || !Array.isArray(x.steps)) {
    return null
  }
  const reason = typeof x.reason === 'string' ? x.reason.trim() : ''
  const legacyDesc = typeof x.desc === 'string' ? x.desc.trim() : ''
  const desc = reason || legacyDesc
  if (!desc) return null
  const stepsRaw = x.steps.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  if (stepsRaw.length !== 3) return null
  const steps = stepsRaw.map((s) => s.trim())
  const title = x.title.trim()
  const duration = x.duration.trim()
  if (!optionTextPassesQuality(title, desc, steps)) return null
  return {
    title,
    desc,
    duration,
    steps,
    firstAction: parseOptionalField(x, 'firstAction'),
    outcome: parseOptionalField(x, 'outcome'),
  }
}

/** 校验 API 返回的 stages，失败则整体放弃 AI 结果、回退 mock */
function parseAiStagesPayload(data: unknown): StageDraft[] | null {
  if (!data || typeof data !== 'object') return null
  const stages = (data as { stages?: unknown }).stages
  if (!Array.isArray(stages) || stages.length !== 3) return null
  const out: StageDraft[] = []
  for (const st of stages) {
    if (!st || typeof st !== 'object') return null
    const title = (st as Record<string, unknown>).title
    if (typeof title !== 'string' || !title.trim()) return null
    if (!stageTitlePassesQuality(title)) return null
    const opts = (st as Record<string, unknown>).options
    if (!Array.isArray(opts) || opts.length !== 3) return null
    const options: Omit<PathOption, 'id'>[] = []
    for (const o of opts) {
      const p = parseOption(o)
      if (!p) return null
      options.push(p)
    }
    out.push({ title: title.trim(), options })
  }
  return out
}

function stagesFromAiPayload(raw: StageDraft[]): Stage[] {
  return raw.map((stage, stageIndex) => ({
    id: `stage-${stageIndex + 1}`,
    title: stage.title,
    options: stage.options.map((option, optionIndex) => ({
      ...option,
      id: `stage-${stageIndex + 1}-task-${optionIndex + 1}`,
    })),
  }))
}

async function fetchAiWorkflowStages(goal: string, context: string): Promise<Stage[] | null> {
  try {
    const res = await fetch('/api/generate-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, context }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const parsed = parseAiStagesPayload(data)
    if (!parsed) return null
    return stagesFromAiPayload(parsed)
  } catch {
    return null
  }
}

function stagesFromTemplates(): Stage[] {
  return stageTemplates.map((stage, stageIndex) => ({
    id: `stage-${stageIndex + 1}`,
    title: stage.title,
    options: stage.options.map((option, optionIndex) => ({
      ...option,
      id: `stage-${stageIndex + 1}-task-${optionIndex + 1}`,
    })),
  }))
}

const stageTemplates: {
  title: string
  options: Omit<PathOption, 'id'>[]
}[] = [
  {
    title: '阶段 1：启动与摸底',
    options: [
      {
        title: '先做一套真题',
        desc: '了解自己的起点水平',
        duration: '30分钟',
        steps: ['找一套真题', '模拟考试环境', '记录得分和薄弱项'],
      },
      {
        title: '制定学习计划',
        desc: '根据目标分数倒推安排',
        duration: '20分钟',
        steps: ['确定考试日期', '计算剩余天数', '分配各科时间'],
      },
      {
        title: '建立单词基础',
        desc: '从高频词汇开始积累',
        duration: '每天30分钟',
        steps: ['下载背单词App', '设置每日目标', '开始第一轮背诵'],
      },
    ],
  },
  {
    title: '阶段 2：能力强化',
    options: [
      {
        title: '专项训练阅读',
        desc: '集中突破长难句和定位能力',
        duration: '40分钟',
        steps: ['挑选阅读题型', '做题并计时', '复盘错题原因'],
      },
      {
        title: '听力精听复盘',
        desc: '把听不清的问题点逐个解决',
        duration: '35分钟',
        steps: ['选择音频材料', '逐句精听', '整理高频错误点'],
      },
      {
        title: '写作素材库搭建',
        desc: '积累可复用的观点和表达',
        duration: '25分钟',
        steps: ['整理高频话题', '准备例子素材', '写出3段模板表达'],
      },
    ],
  },
  {
    title: '阶段 3：冲刺与稳定',
    options: [
      {
        title: '全真模考一次',
        desc: '按正式考试时间完整演练',
        duration: '2小时40分钟',
        steps: ['准备完整试卷', '严格计时', '记录每科得分'],
      },
      {
        title: '错题二次清零',
        desc: '把反复犯错点彻底搞懂',
        duration: '45分钟',
        steps: ['汇总高频错题', '定位知识漏洞', '写出纠错策略'],
      },
      {
        title: '考前节奏确认',
        desc: '明确最后一周安排和状态管理',
        duration: '20分钟',
        steps: ['确定每日任务量', '安排休息节奏', '准备考试物品清单'],
      },
    ],
  },
]

export async function generateWorkflow(goalTitle: string, goalContext: string): Promise<WorkflowState> {
  const aiStages = await fetchAiWorkflowStages(goalTitle, goalContext)
  const stages = aiStages && aiStages.length === 3 ? aiStages : stagesFromTemplates()

  return {
    stages,
    currentStageIndex: 0,
    currentTaskId: null,
    completedTaskIds: [],
    goalTitle,
    goalContext,
    createdAt: new Date().toISOString(),
  }
}
