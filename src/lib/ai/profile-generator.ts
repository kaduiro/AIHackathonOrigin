export interface ProfileGenerationInput {
  displayName: string
  tags: string[]
  interestLevel?: string
  goalType?: string
}

const INTEREST_LEVEL_PHRASES: Record<string, string> = {
  exploring: 'いろいろなことに興味があり、気軽に探索中',
  interested: '積極的に新しいことに挑戦したい',
  committed: '本格的にスキルアップを目指している',
}

const GOAL_TYPE_PHRASES: Record<string, string> = {
  learn: '新しい知識やスキルを身につけることが好き',
  connect: '同じ志を持つ仲間との出会いを大切にしている',
  create: '何かを形にすることにワクワクする',
  mentor: '自分の経験を活かして人の役に立ちたい',
  explore: 'まだ方向性を模索中だけど、可能性を広げたい',
}

export function generateProfileDraft(input: ProfileGenerationInput): string {
  const parts: string[] = []

  // Opening
  if (input.tags.length > 0) {
    const tagList = input.tags.slice(0, 3).join('・')
    parts.push(`${tagList}に興味があります。`)
  }

  // Interest level
  if (input.interestLevel && INTEREST_LEVEL_PHRASES[input.interestLevel]) {
    parts.push(INTEREST_LEVEL_PHRASES[input.interestLevel] + 'です。')
  }

  // Goal
  if (input.goalType && GOAL_TYPE_PHRASES[input.goalType]) {
    parts.push(GOAL_TYPE_PHRASES[input.goalType] + 'です。')
  }

  // Closing
  parts.push('よろしくお願いします！')

  return parts.join('\n')
}

export function generateRoomIntroDraft(input: {
  roomName: string
  userTags: string[]
}): string {
  const tagMention = input.userTags.length > 0
    ? `${input.userTags.slice(0, 2).join('と')}に興味があります。`
    : ''

  return `「${input.roomName}」に参加しました！${tagMention}初心者ですが、よろしくお願いします。`
}
