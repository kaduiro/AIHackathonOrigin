import { UserRole } from '@/types/database'

type Permission =
  | 'view_feed'
  | 'post_qa'
  | 'comment'
  | 'react'
  | 'join_room'
  | 'create_room'
  | 'create_event'
  | 'book_consultation'
  | 'receive_consultation'
  | 'report'
  | 'admin_panel'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: ['view_feed'],
  user: ['view_feed', 'report'],
  verified: ['view_feed', 'post_qa', 'comment', 'react', 'join_room', 'create_room', 'create_event', 'book_consultation', 'report'],
  minor: ['view_feed', 'post_qa', 'comment', 'react', 'join_room', 'report', 'book_consultation'],
  mentor: ['view_feed', 'post_qa', 'comment', 'react', 'join_room', 'create_room', 'create_event', 'book_consultation', 'receive_consultation', 'report'],
  admin: ['view_feed', 'post_qa', 'comment', 'react', 'join_room', 'create_room', 'create_event', 'book_consultation', 'receive_consultation', 'report', 'admin_panel'],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
