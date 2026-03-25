import { User, UserRole } from '@/types/database'
import { hasPermission } from '@/constants/permissions'

export function getUserEffectiveRole(user: User): UserRole {
  return user.role
}

export function canUserPerform(user: User, permission: string): boolean {
  return hasPermission(user.role, permission as Parameters<typeof hasPermission>[1])
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin'
}

export function isVerified(user: User): boolean {
  return ['verified', 'mentor', 'admin'].includes(user.role)
}

export function isMinor(user: User): boolean {
  return user.role === 'minor'
}

export function needsOnboarding(user: User): boolean {
  return user.verification_status === 'pending' && user.age_group === 'unverified'
}

export function needsAgeVerification(user: User): boolean {
  return user.age_group === 'unverified'
}
