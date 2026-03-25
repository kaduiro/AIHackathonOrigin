'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { parentalConsentSchema } from '@/lib/validators/verification'
import { ROUTES } from '@/constants/routes'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function submitAgeVerificationAction(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const birthDateStr = formData.get('birthDate') as string
  if (!birthDateStr) {
    return { success: false, error: '生年月日を入力してください' }
  }

  // Calculate age
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  const isAdult = age >= 18
  const ageGroup = isAdult ? 'adult' : 'minor'

  // Create verification record
  const { error: verificationError } = await supabase
    .from('verifications')
    .insert({
      user_id: user.id,
      status: 'submitted',
      birth_date: birthDateStr,
      submitted_at: new Date().toISOString(),
    })

  if (verificationError) {
    return { success: false, error: '年齢確認の送信に失敗しました' }
  }

  // Update user's age group and verification status
  const newRole = isAdult ? 'verified' : 'user'  // minors need parental consent
  const { error: updateError } = await supabase
    .from('users')
    .update({
      age_group: ageGroup,
      verification_status: 'submitted',
      role: newRole,
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: 'ユーザー情報の更新に失敗しました' }
  }

  return { success: true }
}

export async function submitParentalConsentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  const raw = {
    guardianName: formData.get('guardianName') as string,
    guardianEmail: formData.get('guardianEmail') as string,
    guardianPhone: formData.get('guardianPhone') as string || undefined,
    agreeToTerms: formData.get('agreeToTerms') === 'on',
  }

  const parsed = parentalConsentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // Create consent record
  const { error: consentError } = await supabase
    .from('guardian_consents')
    .insert({
      user_id: user.id,
      status: 'submitted',
      guardian_name: parsed.data.guardianName,
      guardian_email: parsed.data.guardianEmail,
      guardian_phone: parsed.data.guardianPhone || null,
      submitted_at: new Date().toISOString(),
    })

  if (consentError) {
    return { success: false, error: '保護者同意の送信に失敗しました' }
  }

  // Update user
  const { error: updateError } = await supabase
    .from('users')
    .update({
      consent_status: 'submitted',
      role: 'minor',
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: 'ユーザー情報の更新に失敗しました' }
  }

  return { success: true }
}
