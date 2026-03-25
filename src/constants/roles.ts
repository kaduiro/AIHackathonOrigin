import { UserRole } from '@/types/database'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  verified: 2,
  minor: 2,
  mentor: 3,
  admin: 10,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'ゲスト',
  user: '一般ユーザー',
  verified: '年齢確認済み',
  minor: '未成年（保護者同意済み）',
  mentor: '認証済みメンター',
  admin: '管理者',
}
