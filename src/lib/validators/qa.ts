import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(5, 'タイトルは5文字以上で入力してください').max(200, 'タイトルは200文字以内で入力してください'),
  body: z.string().min(10, '本文は10文字以上で入力してください').max(5000, '本文は5000文字以内で入力してください'),
  type: z.enum(['question', 'discussion']).default('question'),
  tags: z.array(z.string()).max(5, 'タグは5個まで選択できます').default([]),
})

export const createCommentSchema = z.object({
  body: z.string().min(1, 'コメントを入力してください').max(2000, 'コメントは2000文字以内で入力してください'),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
})

export const reportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'event', 'room', 'user', 'profile']),
  targetId: z.string().uuid(),
  reason: z.string().min(1, '理由を選択してください'),
  description: z.string().max(500).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ReportInput = z.infer<typeof reportSchema>
