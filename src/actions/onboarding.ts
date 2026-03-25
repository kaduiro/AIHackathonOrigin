'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { saveTagsSchema, diagnosisSchema } from '@/lib/validators/onboarding'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function saveTagsAction(tagIds: string[]): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = saveTagsSchema.safeParse({ tagIds })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Delete existing tags
  await supabase
    .from('user_tags')
    .delete()
    .eq('user_id', user.id)

  // Insert new tags
  const inserts = parsed.data.tagIds.map(tagId => ({
    user_id: user.id,
    tag_id: tagId,
  }))

  const { error } = await supabase
    .from('user_tags')
    .insert(inserts)

  if (error) {
    return { success: false, error: 'タグの保存に失敗しました' }
  }

  return { success: true }
}

export async function submitDiagnosisAction(data: {
  interestLevel: string
  goalType: string
  answers: Record<string, unknown>
}): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = diagnosisSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Upsert diagnosis result
  const { error } = await supabase
    .from('diagnosis_results')
    .upsert({
      user_id: user.id,
      interest_level: parsed.data.interestLevel,
      goal_type: parsed.data.goalType,
      answers: parsed.data.answers,
      summary: generateSummary(parsed.data.interestLevel, parsed.data.goalType),
    }, {
      onConflict: 'user_id',
    })

  if (error) {
    // If upsert fails due to no unique constraint on user_id, try delete + insert
    await supabase.from('diagnosis_results').delete().eq('user_id', user.id)
    const { error: insertError } = await supabase.from('diagnosis_results').insert({
      user_id: user.id,
      interest_level: parsed.data.interestLevel,
      goal_type: parsed.data.goalType,
      answers: parsed.data.answers,
      summary: generateSummary(parsed.data.interestLevel, parsed.data.goalType),
    })
    if (insertError) {
      return { success: false, error: '診断結果の保存に失敗しました' }
    }
  }

  return { success: true }
}

function generateSummary(interestLevel: string, goalType: string): string {
  const levelLabels: Record<string, string> = {
    exploring: 'まずは気軽に探してみたい',
    interested: '興味があり積極的に参加したい',
    committed: '本格的に取り組みたい',
  }
  const goalLabels: Record<string, string> = {
    learn: '新しいことを学ぶ',
    connect: '仲間とつながる',
    create: '何かを作り出す',
    mentor: '人に教える・相談に乗る',
    explore: 'まずは色々見てみる',
  }
  return `${levelLabels[interestLevel] || ''}タイプ。目標: ${goalLabels[goalType] || ''}`
}

export async function skipDiagnosisAction(): Promise<void> {
  redirect(ROUTES.MATCHING_RESULTS)
}
