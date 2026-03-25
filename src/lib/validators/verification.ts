import { z } from 'zod'

export const ageVerificationSchema = z.object({
  birthDate: z.string().min(1, '生年月日を入力してください'),
  isAdult: z.boolean(),
})

export const parentalConsentSchema = z.object({
  guardianName: z.string().min(1, '保護者の氏名を入力してください'),
  guardianEmail: z.string().email('有効なメールアドレスを入力してください'),
  guardianPhone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, '同意が必要です'),
})

export type AgeVerificationInput = z.infer<typeof ageVerificationSchema>
export type ParentalConsentInput = z.infer<typeof parentalConsentSchema>
