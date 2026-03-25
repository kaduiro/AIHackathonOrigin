import { z } from 'zod'

export const saveTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()).min(1, '少なくとも1つのタグを選択してください').max(10, 'タグは10個まで選択できます'),
})

export const diagnosisSchema = z.object({
  interestLevel: z.enum(['exploring', 'interested', 'committed']),
  goalType: z.enum(['learn', 'connect', 'create', 'mentor', 'explore']),
  answers: z.record(z.string(), z.unknown()),
})

export type SaveTagsInput = z.infer<typeof saveTagsSchema>
export type DiagnosisInput = z.infer<typeof diagnosisSchema>
