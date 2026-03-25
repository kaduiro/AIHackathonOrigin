'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/constants/routes'

export type ActionResult = { success: boolean; error?: string; data?: any }

export async function bookConsultationAction(input: {
  slotId: string
  mentorUserId: string
  topic: string
  message?: string
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Cannot book own slot
  if (user.id === input.mentorUserId) {
    return { success: false, error: '自分の枠は予約できません' }
  }

  // Check slot is available
  const { data: slot } = await supabase
    .from('booking_slots')
    .select('*')
    .eq('id', input.slotId)
    .eq('status', 'available')
    .single()

  if (!slot) return { success: false, error: 'この枠は既に予約済みです' }

  // Update slot status
  await supabase
    .from('booking_slots')
    .update({ status: 'reserved' })
    .eq('id', input.slotId)

  // Create booking
  const { error } = await supabase
    .from('consultation_bookings')
    .insert({
      slot_id: input.slotId,
      mentor_user_id: input.mentorUserId,
      requester_user_id: user.id,
      topic: input.topic,
      message: input.message || null,
    })

  if (error) return { success: false, error: '予約に失敗しました' }

  revalidatePath(ROUTES.MENTOR_DETAIL(input.mentorUserId))
  return { success: true }
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('consultation_bookings')
    .select('*, booking_slots(*)')
    .eq('id', bookingId)
    .single()

  if (!booking || (booking.requester_user_id !== user.id && booking.mentor_user_id !== user.id)) {
    return { success: false, error: '予約が見つかりません' }
  }

  // Cancel booking
  await supabase
    .from('consultation_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  // Free up slot
  await supabase
    .from('booking_slots')
    .update({ status: 'available' })
    .eq('id', booking.slot_id)

  return { success: true }
}

export async function applyMentorAction(input: {
  expertise: string[]
  targetAudience: string
  bio: string
}): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mentor_profiles')
    .insert({
      user_id: user.id,
      expertise: input.expertise,
      target_audience: input.targetAudience,
      bio: input.bio,
      status: 'pending',
    })

  if (error) {
    if (error.code === '23505') return { success: false, error: '既に申請済みです' }
    return { success: false, error: 'メンター申請に失敗しました' }
  }

  return { success: true }
}
