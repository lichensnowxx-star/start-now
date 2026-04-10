export interface PathOption {
  id: string
  title: string
  /** 展示用说明，对应模型字段 reason（或兼容旧字段 desc） */
  desc: string
  duration: string
  steps: string[]
  /** 模型可选：第一下怎么做；UI 可随时接上 */
  firstAction?: string
  /** 模型可选：做完会得到什么 */
  outcome?: string
}

export interface PathOptionsResponse {
  options: PathOption[]
}

export interface Stage {
  id: string
  title: string
  options: PathOption[]
}

export interface WorkflowState {
  stages: Stage[]
  currentStageIndex: number
  currentTaskId: string | null
  completedTaskIds: string[]
  goalTitle?: string
  goalContext?: string
  createdAt?: string
  /** 首页「查看演示」写入，用于温和文案与不污染成长档案 */
  isDemo?: boolean
}

export interface GoalArchiveItem {
  id: string
  goalTitle: string
  goalContext: string
  completedAt: string
  completedTasks: number
  totalTasks: number
  stageCount: number
}
