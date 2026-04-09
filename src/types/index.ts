export interface PathOption {
  id: string
  title: string
  desc: string
  duration: string
  steps: string[]
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
