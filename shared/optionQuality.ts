/**
 * 服务端与前端共用：单条行动是否过于空泛；不达标则整条 AI workflow 丢弃（fallback mock）。
 */

/** 常见「方向/口号」式用语，出现在 title / reason / step 中则判不达标 */
const BANNED_SUBSTRINGS = [
  '建立基础',
  '强化能力',
  '持续提升',
  '系统学习',
  '全面规划',
  '长期坚持',
  '夯实基础',
  '全面提升',
  '稳步提升',
  '不断加强',
  '深化理解',
  '巩固提高',
  '持续优化',
  '整体规划',
  '全面加强',
  '逐步提升',
  '优化状态',
  '能力提升',
  '基础训练',
  '核心基础',
  '强化训练',
  '强化习惯',
  '持续练习',
  '项目开发',
  '建立习惯',
  '能力提升期',
]

function normalizeForCheck(s: string): string {
  return s.replace(/\s+/g, '')
}

function containsBanned(text: string): boolean {
  const t = normalizeForCheck(text)
  return BANNED_SUBSTRINGS.some((b) => t.includes(b))
}

/** title / reason / steps：具体性与长度 */
export function optionTextPassesQuality(title: string, reason: string, steps: string[]): boolean {
  const t = title.trim()
  const r = reason.trim()
  if (t.length < 6 || r.length < 6) return false
  if (containsBanned(t) || containsBanned(r)) return false
  for (const step of steps) {
    const s = step.trim()
    if (s.length < 4) return false
    if (containsBanned(s)) return false
  }
  return true
}

export function stageTitlePassesQuality(title: string): boolean {
  return title.trim().length >= 5
}
