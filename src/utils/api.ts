import type { PathOption, Stage, WorkflowState } from '../types'

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
  await new Promise((resolve) => setTimeout(resolve, 900))

  const stages: Stage[] = stageTemplates.map((stage, stageIndex) => ({
    id: `stage-${stageIndex + 1}`,
    title: stage.title,
    options: stage.options.map((option, optionIndex) => ({
      ...option,
      id: `stage-${stageIndex + 1}-task-${optionIndex + 1}`,
    })),
  }))

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
