/**
 * 服务端/本地 dev 共用：请求 DeepSeek，解析严格 JSON，校验完整三阶段计划（每阶段 3 条行动）。
 * 仅供 api 路由与 Vite dev 中间件引用，勿打包进浏览器。
 */

import { optionTextPassesQuality, stageTitlePassesQuality } from '../shared/optionQuality'

export interface RawOption {
  title: string
  desc: string
  duration: string
  steps: string[]
  /** 模型可返回，便于后续 UI；不落卡片则由前端忽略 */
  firstAction?: string
  outcome?: string
}

export interface RawStage {
  title: string
  options: RawOption[]
}

function stripJsonFence(s: string): string {
  let t = s.trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '')
    t = t.replace(/\s*```$/, '')
  }
  return t.trim()
}

function parseOptionalString(x: Record<string, unknown>, key: string): string | undefined {
  const v = x[key]
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

function validateRawOptionsArray(opts: unknown): RawOption[] | null {
  if (!Array.isArray(opts) || opts.length !== 3) return null
  const out: RawOption[] = []
  for (const o of opts) {
    if (!o || typeof o !== 'object') return null
    const x = o as Record<string, unknown>
    const titleRaw = x.title
    if (typeof titleRaw !== 'string' || !titleRaw.trim()) return null
    const title = titleRaw.trim()

    const reason = typeof x.reason === 'string' ? x.reason.trim() : ''
    const legacyDesc = typeof x.desc === 'string' ? x.desc.trim() : ''
    const desc = reason || legacyDesc
    if (!desc) return null

    const durationRaw = x.duration
    if (typeof durationRaw !== 'string' || !durationRaw.trim()) return null
    const duration = durationRaw.trim()

    const stepsRaw = x.steps
    if (!Array.isArray(stepsRaw) || stepsRaw.length !== 3) return null
    const steps: string[] = []
    for (const s of stepsRaw) {
      if (typeof s !== 'string' || !String(s).trim()) return null
      steps.push(String(s).trim())
    }

    if (!optionTextPassesQuality(title, desc, steps)) {
      console.warn('[DeepSeek] option failed quality gate:', title.slice(0, 80))
      return null
    }

    out.push({
      title,
      desc,
      duration,
      steps,
      firstAction: parseOptionalString(x, 'firstAction'),
      outcome: parseOptionalString(x, 'outcome'),
    })
  }
  return out
}

export function validateRawStages(data: unknown): RawStage[] | null {
  if (!data || typeof data !== 'object') return null
  const stages = (data as { stages?: unknown }).stages
  if (!Array.isArray(stages) || stages.length !== 3) return null
  const out: RawStage[] = []
  for (const st of stages) {
    if (!st || typeof st !== 'object') return null
    const title = (st as Record<string, unknown>).title
    if (typeof title !== 'string' || !title.trim()) return null
    const stageTitle = title.trim()
    if (!stageTitlePassesQuality(stageTitle)) {
      console.warn('[DeepSeek] stage title failed quality gate:', stageTitle.slice(0, 80))
      return null
    }
    const opts = validateRawOptionsArray((st as Record<string, unknown>).options)
    if (!opts) return null
    out.push({ title: stageTitle, options: opts })
  }
  return out
}

const SYSTEM_PROMPT = `你是「Start Now」产品的行动拆解助手。用户会有一个略模糊的大目标；你要把它拆成 **3 个阶段 × 每阶段 3 条行动**，一共 9 条。

【产品理念 — 每条行动必须】
- **小、具体、低门槛**：读的人觉得「现在就能做第一下」，而不是「以后要干嘛」。
- **是动作，不是方向**：禁止空话、阶段口号、教培大纲式标题。
- **尽量 15～40 分钟内能做完**，或能写清「今天第一下做什么」；duration 用中文写清（如「约20分钟」「今晚10分钟」）。
- **title（卡片主标题）**：像一条待办，尽量 **动词开头**（打开、写下、搜集、试听、完成、记录、练习、跟着、拍下、列出…），**8～40 个字**为宜，一眼知道干什么。
- **reason（为什么先做这一步）**：一句贴心说明，**不能**与 title 重复堆砌空话；要像一个朋友在解释「这一步为啥有用」。
- **steps**：固定 **3 条**，每条都是更小、更顺手的分解，同样要具体，不要「认真坚持」之类。

【禁止出现在 title / reason / 任一 step 里的套话举例】
建立基础、强化能力、持续提升、系统学习、全面规划、长期坚持、夯实基础、全面提升、稳步提升、优化状态、系统了解 AI、持续练习项目——这类 **只像方向、不像今天能做的一步** 一律不要。

【JSON — 只输出一个对象，不要 markdown 围栏、不要多余文字】
根结构：{"stages":[ 阶段A, 阶段B, 阶段C ]}
每个阶段：{"title":"…","options":[ 行动1, 行动2, 行动3 ]}
每条行动必填：title, reason, duration, steps（steps 恰好 3 条字符串）。
可选键（仅在有实质内容时添加）：firstAction（第一下怎么做）, outcome（做完能收获什么）；不要输出空字符串占位。

说明：
- stages 必须恰好 **3** 个，时间顺序：眼下能启动 → 中期推进 → 收尾稳固。
- 每个 stage 的 title 要点出**该阶段在干什么**（可含「阶段 1：…」），但要 **扣住用户目标**，不要只有「第一阶段」四个字。
- 每个 stage 的 options 必须恰好 **3** 个。
- reason：**必填**。firstAction、outcome：**可选**（有则写清「第一下怎么做」「做完能得到啥」；没有就省略这两个键，不要设为空字符串乱占字段）。

【反例 → 正例】
用户目标：我想学 vibe coding
错误（不要写）：建立编程基础 / 系统了解 AI 编程 / 持续练习项目开发
更好（像这样写 title）：看一节约 20 分钟的 vibe coding 入门视频，记下 3 个关键词 | 在 Cursor 里新建最小待办页，先跑通本地预览 | 把今天 3 个报错复制进文档，各写一行你是怎么解决的

用户目标：我想练马甲线
错误（不要写）：建立核心基础 / 强化训练习惯 / 优化身体状态
更好：跟着 15 分钟腹部跟练做一遍，记下最吃力的 2 个动作 | 今晚把常喝的一款高糖饮料换成无糖，先试 1 天 | 用手机拍一张腰腹照片，当作对比起点`

/**
 * @throws 网络或非 2xx、解析失败、结构校验失败
 */
export async function fetchDeepSeekWorkflowStages(
  goal: string,
  context: string,
  apiKey: string,
): Promise<RawStage[]> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `目标：${goal}\n补充说明：${context || '无'}\n\n请严格按 system 要求的 JSON 输出，9 条行动每条都要具体、可立即开始。`,
        },
      ],
      temperature: 0.35,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`DeepSeek HTTP ${res.status}: ${t.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content || !content.trim()) throw new Error('DeepSeek empty content')

  const cleaned = stripJsonFence(content)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('DeepSeek JSON parse failed')
  }

  const valid = validateRawStages(parsed)
  if (!valid) {
    console.warn('[DeepSeek] full payload failed validation or quality gate')
    throw new Error('DeepSeek JSON shape invalid')
  }
  return valid
}
