import type { PathOption, Stage, WorkflowState } from '../types'

const demoStageTemplates: {
  title: string
  options: Omit<PathOption, 'id'>[]
}[] = [
  {
    title: '阶段 1：温柔起步',
    options: [
      {
        title: '做一套雅思真题摸摸底',
        desc: '不用追求完美分数，先知道自己的起点就好。',
        duration: '约 2.5 小时',
        steps: ['选一套完整剑桥题', '按考试时间专注做完', '简单记下卡壳的题型'],
      },
      {
        title: '写下三门里最怕的那一科',
        desc: '写下来会降低一点心理压力，也方便后面对症下药。',
        duration: '5 分钟',
        steps: ['拿出纸或备忘录', '诚实写出一科', '想一句给自己的鼓励'],
      },
      {
        title: '听力热身 15 分钟',
        desc: '从小剂量开始，让耳朵先醒过来。',
        duration: '15 分钟',
        steps: ['选一段真题听力', '专注听一遍', '标出没听清的句子'],
      },
    ],
  },
  {
    title: '阶段 2：稳稳加一点量',
    options: [
      {
        title: '精读一篇阅读并复盘',
        desc: '慢一点没关系，搞懂结构比刷题数量重要。',
        duration: '40 分钟',
        steps: ['限时做一篇', '对照答案只看错题', '总结一道错题原因'],
      },
      {
        title: '口语 Part 1 自录一遍',
        desc: '听见自己的声音，也是温柔地认识自己。',
        duration: '20 分钟',
        steps: ['选 3 个日常话题', '录音回答', '听回放记一个小改进点'],
      },
      {
        title: '写一段小作文再改一遍',
        desc: '先写出来，再改一句也算进步。',
        duration: '35 分钟',
        steps: ['限时写 150 词左右', '休息 2 分钟', '改语法与逻辑各一处'],
      },
    ],
  },
  {
    title: '阶段 3：手感与节奏',
    options: [
      {
        title: '半套全真计时练习',
        desc: '感受节奏比分数更重要，先让身体适应考试感。',
        duration: '约 2 小时',
        steps: ['选半套试卷', '严格计时', '记录时间是否够用'],
      },
      {
        title: '整理一小份错题补给包',
        desc: '把容易重复错的地方温柔地收进一个小本子。',
        duration: '25 分钟',
        steps: ['汇总 5 道典型错', '写一句提醒自己', '放进固定复习位'],
      },
      {
        title: '给自己画一张「考前一周草图」',
        desc: '不用精确到分钟，只要大致安心就好。',
        duration: '20 分钟',
        steps: ['标出考试日', '写 3 件必做题', '留一天完全放松'],
      },
    ],
  },
]

/** 首页「查看演示」：预设目标与路径，跳过目标输入页 */
export function getDemoWorkflow(): WorkflowState {
  const stages: Stage[] = demoStageTemplates.map((stage, stageIndex) => ({
    id: `demo-stage-${stageIndex + 1}`,
    title: stage.title,
    options: stage.options.map((option, optionIndex) => ({
      ...option,
      id: `demo-stage-${stageIndex + 1}-task-${optionIndex + 1}`,
    })),
  }))

  return {
    stages,
    currentStageIndex: 0,
    currentTaskId: null,
    completedTaskIds: [],
    goalTitle: '准备雅思7分',
    goalContext: '演示用：我想稳步提升听说读写，希望节奏温柔一点、能长期坚持下去。',
    createdAt: new Date().toISOString(),
    isDemo: true,
  }
}
