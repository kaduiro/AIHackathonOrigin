'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { createPostSchema, createCommentSchema, reportSchema } from '@/lib/validators/qa'
import { moderateContent } from '@/lib/ai/moderation'
import { moderateAndRecord } from '@/services/moderation'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/constants/routes'

export type ActionResult = {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

export async function createPostAction(input: {
  title: string
  body: string
  type: string
  tags: string[]
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const parsed = createPostSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // Moderate content
  const modResult = moderateContent(`${parsed.data.title} ${parsed.data.body}`)
  const status = modResult.label === 'held' ? 'held' : modResult.label === 'caution' ? 'held' : 'published'

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      type: parsed.data.type,
      tags: parsed.data.tags,
      status,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: '投稿の作成に失敗しました' }
  }

  // Record moderation case if content was flagged
  if (status === 'held') {
    await moderateAndRecord('post', data.id, `${parsed.data.title} ${parsed.data.body}`)
    return {
      success: true,
      data: { id: data.id, held: true, reasons: modResult.reasons },
    }
  }

  revalidatePath(ROUTES.QA)
  return { success: true, data: { id: data.id } }
}

export async function updatePostAction(postId: string, input: {
  title: string
  body: string
  tags: string[]
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({
      title: input.title,
      body: input.body,
      tags: input.tags,
    })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) {
    return { success: false, error: '投稿の更新に失敗しました' }
  }

  revalidatePath(ROUTES.QA_DETAIL(postId))
  return { success: true }
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({ status: 'deleted' })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) {
    return { success: false, error: '投稿の削除に失敗しました' }
  }

  revalidatePath(ROUTES.QA)
  return { success: true }
}

export async function createCommentAction(input: {
  body: string
  postId: string
  parentId?: string
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const parsed = createCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const modResult = moderateContent(parsed.data.body)
  const status = modResult.label === 'safe' ? 'published' : 'held'

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: parsed.data.postId,
      author_id: user.id,
      parent_id: parsed.data.parentId || null,
      body: parsed.data.body,
      status,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'コメントの投稿に失敗しました' }
  }

  // Record moderation case if content was flagged
  if (status === 'held') {
    await moderateAndRecord('comment', data.id, parsed.data.body)
  }

  revalidatePath(ROUTES.QA_DETAIL(parsed.data.postId))
  return { success: true, data: { held: status === 'held' } }
}

export async function toggleReactionAction(targetType: string, targetId: string, reactionType: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('reaction_type', reactionType)
    .single()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
  } else {
    await supabase.from('reactions').insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reaction_type: reactionType,
    })
  }

  return { success: true }
}

export async function reportAction(input: {
  targetType: string
  targetId: string
  reason: string
  description?: string
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      reason: parsed.data.reason,
      description: parsed.data.description || null,
    })

  if (error) {
    return { success: false, error: '通報の送信に失敗しました' }
  }

  return { success: true }
}
