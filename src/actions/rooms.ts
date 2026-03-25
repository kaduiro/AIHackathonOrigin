'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/constants/routes'

export type ActionResult = { success: boolean; error?: string; data?: Record<string, unknown> }

export async function joinRoomAction(roomId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check room exists and is approved
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .eq('approval_status', 'approved')
    .single()

  if (!room) return { success: false, error: 'ルームが見つかりません' }

  // Check age policy
  if (room.age_policy === 'adult_only' && user.age_group === 'minor') {
    return { success: false, error: 'このルームは18歳以上が対象です' }
  }

  const status = room.approval_required ? 'pending' : 'approved'
  const { error } = await supabase
    .from('room_memberships')
    .upsert({
      room_id: roomId,
      user_id: user.id,
      status,
      joined_at: status === 'approved' ? new Date().toISOString() : null,
    }, { onConflict: 'room_id,user_id' })

  if (error) return { success: false, error: '参加に失敗しました' }

  revalidatePath(ROUTES.ROOM_DETAIL(roomId))
  return { success: true, data: { status } }
}

export async function leaveRoomAction(roomId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('room_memberships')
    .update({ status: 'left' })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: '退出に失敗しました' }

  revalidatePath(ROUTES.ROOM_DETAIL(roomId))
  return { success: true }
}

export async function createRoomApplicationAction(input: {
  communityId: string
  title: string
  description: string
  agePolicy: string
  approvalRequired: boolean
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      community_id: input.communityId,
      title: input.title,
      description: input.description,
      age_policy: input.agePolicy,
      approval_required: input.approvalRequired,
      approval_status: 'pending',
      creator_id: user.id,
    })
    .select()
    .single()

  if (error) return { success: false, error: 'ルーム作成申請に失敗しました' }

  revalidatePath(ROUTES.ROOMS)
  return { success: true, data: { id: data.id } }
}

export async function updateRoomProfileAction(roomId: string, input: {
  nickname: string
  intro?: string
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('room_profiles')
    .upsert({
      room_id: roomId,
      user_id: user.id,
      nickname: input.nickname,
      intro: input.intro || null,
    }, { onConflict: 'room_id,user_id' })

  if (error) return { success: false, error: 'プロフィールの更新に失敗しました' }

  revalidatePath(ROUTES.ROOM_DETAIL(roomId))
  return { success: true }
}
