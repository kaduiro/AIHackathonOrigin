'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { generateProfileDraft } from '@/lib/ai/profile-generator'

export type ActionResult = {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

export async function generateProfileAction(): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get user's tags
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tags(name)')
    .eq('user_id', user.id)

  // Get diagnosis
  const { data: diagnosis } = await supabase
    .from('diagnosis_results')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const tagNames = (userTags || []).map((ut: Record<string, unknown>) => {
    const tags = ut.tags as { name: string } | null
    return tags?.name
  }).filter(Boolean) as string[]

  const draft = generateProfileDraft({
    displayName: user.display_name,
    tags: tagNames,
    interestLevel: diagnosis?.interest_level,
    goalType: diagnosis?.goal_type,
  })

  // Save draft
  const { data, error } = await supabase
    .from('ai_profile_drafts')
    .insert({
      user_id: user.id,
      draft_type: 'bio',
      content: draft,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'プロフィール草案の生成に失敗しました' }
  }

  return { success: true, data: { draft, id: data.id } }
}

export async function acceptProfileDraftAction(draftId: string, editedContent: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Update draft status
  await supabase
    .from('ai_profile_drafts')
    .update({ status: 'accepted' })
    .eq('id', draftId)
    .eq('user_id', user.id)

  // Update user bio
  const { error } = await supabase
    .from('users')
    .update({ bio: editedContent })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'プロフィールの更新に失敗しました' }
  }

  return { success: true }
}
