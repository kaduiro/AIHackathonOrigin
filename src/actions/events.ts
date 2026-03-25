'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/constants/routes'

export type ActionResult = { success: boolean; error?: string; data?: any }

export async function createEventAction(input: {
  title: string
  description: string
  startAt: string
  endAt?: string
  format: string
  location?: string
  ageRestriction: string
  maxParticipants?: number
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .insert({
      creator_id: user.id,
      title: input.title,
      description: input.description,
      start_at: input.startAt,
      end_at: input.endAt || null,
      format: input.format,
      location: input.location || null,
      age_restriction: input.ageRestriction,
      max_participants: input.maxParticipants || null,
      status: 'published',
    })
    .select()
    .single()

  if (error) return { success: false, error: 'イベントの作成に失敗しました' }

  revalidatePath(ROUTES.EVENTS)
  return { success: true, data: { id: data.id } }
}

export async function joinEventAction(eventId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check event
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event || event.status !== 'published') return { success: false, error: 'イベントが見つかりません' }

  if (event.age_restriction === 'adult_only' && user.age_group === 'minor') {
    return { success: false, error: 'このイベントは18歳以上が対象です' }
  }

  // Check capacity
  if (event.max_participants) {
    const { count } = await supabase
      .from('event_participations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered')
    if (count && count >= event.max_participants) {
      return { success: false, error: '定員に達しています' }
    }
  }

  const { error } = await supabase
    .from('event_participations')
    .upsert({ event_id: eventId, user_id: user.id, status: 'registered' }, { onConflict: 'event_id,user_id' })

  if (error) return { success: false, error: '参加に失敗しました' }

  revalidatePath(ROUTES.EVENT_DETAIL(eventId))
  return { success: true }
}

export async function cancelParticipationAction(eventId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('event_participations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: 'キャンセルに失敗しました' }

  revalidatePath(ROUTES.EVENT_DETAIL(eventId))
  return { success: true }
}
