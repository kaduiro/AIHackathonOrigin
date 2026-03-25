'use server'

import { createClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema, passwordResetSchema } from '@/lib/validators/auth'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export type ActionResult = {
  success: boolean
  error?: string
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    displayName: formData.get('displayName') as string,
    agreeToTerms: formData.get('agreeToTerms') === 'on',
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'このメールアドレスは既に登録されています' }
    }
    return { success: false, error: '登録に失敗しました。もう一度お試しください' }
  }

  return { success: true }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  redirect(ROUTES.INTERESTS)
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
  }

  const parsed = passwordResetSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
  })

  if (error) {
    return { success: false, error: 'パスワードリセットに失敗しました' }
  }

  return { success: true }
}
