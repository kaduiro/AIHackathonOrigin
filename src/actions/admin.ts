'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export type ActionResult = { success: boolean; error?: string }

async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'admin') throw new Error('Forbidden')
  return user
}

async function createAuditLog(actorId: string, action: string, targetType: string, targetId: string, details?: Record<string, unknown>) {
  const supabase = await createClient()
  await supabase.from('audit_logs').insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  })
}

async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  const supabase = await createClient()
  await supabase.from('notifications').insert({ user_id: userId, type, title, message, link })
}

// --- Verification Review ---
export async function approveVerificationAction(verificationId: string, userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('verifications').update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewer_id: admin.id }).eq('id', verificationId)
  await supabase.from('users').update({ verification_status: 'approved' }).eq('id', userId)
  await createAuditLog(admin.id, 'approve_verification', 'verification', verificationId)
  await createNotification(userId, 'approval', '年齢確認が承認されました', 'あなたの年齢確認が承認されました。')

  revalidatePath('/admin/verifications')
  return { success: true }
}

export async function rejectVerificationAction(verificationId: string, userId: string, reason: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('verifications').update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewer_id: admin.id, rejection_reason: reason }).eq('id', verificationId)
  await supabase.from('users').update({ verification_status: 'rejected' }).eq('id', userId)
  await createAuditLog(admin.id, 'reject_verification', 'verification', verificationId, { reason })
  await createNotification(userId, 'rejection', '年齢確認が却下されました', `理由: ${reason}`)

  revalidatePath('/admin/verifications')
  return { success: true }
}

// --- Mentor Review ---
export async function approveMentorAction(mentorProfileId: string, userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('mentor_profiles').update({ status: 'approved' }).eq('id', mentorProfileId)
  await supabase.from('users').update({ role: 'mentor' }).eq('id', userId)
  await createAuditLog(admin.id, 'approve_mentor', 'mentor_profile', mentorProfileId)
  await createNotification(userId, 'approval', 'メンター申請が承認されました', 'おめでとうございます！メンターとして活動できます。')

  revalidatePath('/admin/mentors')
  return { success: true }
}

export async function rejectMentorAction(mentorProfileId: string, userId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('mentor_profiles').update({ status: 'rejected' }).eq('id', mentorProfileId)
  await createAuditLog(admin.id, 'reject_mentor', 'mentor_profile', mentorProfileId)
  await createNotification(userId, 'rejection', 'メンター申請が却下されました', '審査の結果、今回は見送りとなりました。')

  revalidatePath('/admin/mentors')
  return { success: true }
}

// --- Room Approval ---
export async function approveRoomAction(roomId: string, creatorId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('rooms').update({ approval_status: 'approved' }).eq('id', roomId)
  await createAuditLog(admin.id, 'approve_room', 'room', roomId)
  await createNotification(creatorId, 'approval', 'ルーム作成が承認されました', 'ルームが公開されました。')

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function rejectRoomAction(roomId: string, creatorId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('rooms').update({ approval_status: 'rejected' }).eq('id', roomId)
  await createAuditLog(admin.id, 'reject_room', 'room', roomId)
  await createNotification(creatorId, 'rejection', 'ルーム作成が却下されました', '審査の結果、ルームは承認されませんでした。')

  revalidatePath('/admin/rooms')
  return { success: true }
}

// --- Event Management ---
export async function stopEventAction(eventId: string, creatorId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('events').update({ status: 'stopped' }).eq('id', eventId)
  await createAuditLog(admin.id, 'stop_event', 'event', eventId)
  await createNotification(creatorId, 'system', 'イベントが停止されました', '管理者によりイベントが停止されました。')

  revalidatePath('/admin/events')
  return { success: true }
}

// --- Report Management ---
export async function resolveReportAction(reportId: string, action: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('reports').update({ status: action === 'dismiss' ? 'dismissed' : 'resolved' }).eq('id', reportId)
  await createAuditLog(admin.id, `report_${action}`, 'report', reportId)

  revalidatePath('/admin/reports')
  return { success: true }
}

// --- Moderation ---
export async function reviewModerationAction(caseId: string, decision: 'approved' | 'rejected'): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { data: modCase } = await supabase.from('moderation_cases').select('*').eq('id', caseId).single()
  if (!modCase) return { success: false, error: 'ケースが見つかりません' }

  await supabase.from('moderation_cases').update({ review_status: decision, reviewer_id: admin.id, reviewed_at: new Date().toISOString() }).eq('id', caseId)

  // If approved, publish the content. If rejected, keep it held.
  if (decision === 'approved') {
    if (modCase.target_type === 'post') {
      await supabase.from('posts').update({ status: 'published' }).eq('id', modCase.target_id)
    } else if (modCase.target_type === 'comment') {
      await supabase.from('comments').update({ status: 'published' }).eq('id', modCase.target_id)
    }
  } else {
    if (modCase.target_type === 'post') {
      await supabase.from('posts').update({ status: 'rejected' }).eq('id', modCase.target_id)
    } else if (modCase.target_type === 'comment') {
      await supabase.from('comments').update({ status: 'rejected' }).eq('id', modCase.target_id)
    }
  }

  await createAuditLog(admin.id, `moderation_${decision}`, modCase.target_type, modCase.target_id)
  revalidatePath('/admin/moderation')
  return { success: true }
}

// --- NG Words ---
export async function addNGWordAction(word: string, category: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('ng_words').insert({ word, category })
  if (error) {
    if (error.code === '23505') return { success: false, error: '既に登録されています' }
    return { success: false, error: '追加に失敗しました' }
  }

  await createAuditLog(admin.id, 'add_ng_word', 'ng_word', word)
  revalidatePath('/admin/moderation')
  return { success: true }
}

export async function removeNGWordAction(wordId: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('ng_words').update({ is_active: false }).eq('id', wordId)
  await createAuditLog(admin.id, 'remove_ng_word', 'ng_word', wordId)

  revalidatePath('/admin/moderation')
  return { success: true }
}

// --- User Management ---
export async function suspendUserAction(userId: string, reason: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const supabase = await createClient()

  await supabase.from('users').update({ role: 'user' }).eq('id', userId)
  await createAuditLog(admin.id, 'suspend_user', 'user', userId, { reason })
  await createNotification(userId, 'system', 'アカウントが制限されました', `理由: ${reason}`)

  return { success: true }
}

// --- Notifications ---
export async function markNotificationReadAction(notificationId: string): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', user.id)
  return { success: true }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  return { success: true }
}
