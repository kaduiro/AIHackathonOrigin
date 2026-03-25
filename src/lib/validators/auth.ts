import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, '表示名を入力してください').max(50, '表示名は50文字以内で入力してください'),
  agreeToTerms: z.boolean().refine(val => val === true, '利用規約への同意が必要です'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export const passwordResetSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
