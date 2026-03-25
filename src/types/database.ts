// Core enums
export type UserRole = 'guest' | 'user' | 'verified' | 'minor' | 'mentor' | 'admin'
export type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type ConsentStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type AgeGroup = 'adult' | 'minor' | 'unverified'
export type ContentStatus = 'draft' | 'published' | 'held' | 'rejected' | 'deleted'
export type ModerationLabel = 'safe' | 'caution' | 'held'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'escalated'
export type BookingStatus = 'available' | 'reserved' | 'confirmed' | 'completed' | 'cancelled'
export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'left'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'stopped' | 'completed'
export type ReactionType = 'like' | 'helpful' | 'interesting' | 'support'
export type TagCategory = 'interest' | 'skill' | 'goal' | 'field'
export type NotificationType = 'approval' | 'rejection' | 'booking' | 'report' | 'system'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'
export type MentorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type RoomApprovalStatus = 'pending' | 'approved' | 'rejected'
export type PostType = 'question' | 'discussion'
export type TargetType = 'post' | 'comment' | 'event' | 'room' | 'user' | 'profile'
export type DiagnosisInterestLevel = 'exploring' | 'interested' | 'committed'
export type DiagnosisGoalType = 'learn' | 'connect' | 'create' | 'mentor' | 'explore'

// Database row types
export interface User {
  id: string
  email: string
  display_name: string
  age_group: AgeGroup
  verification_status: VerificationStatus
  consent_status: ConsentStatus
  role: UserRole
  bio: string | null
  avatar_url: string | null
  affiliation: string | null
  created_at: string
  updated_at: string
}

export interface Verification {
  id: string
  user_id: string
  status: VerificationStatus
  birth_date: string | null
  document_url: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewer_id: string | null
  created_at: string
  updated_at: string
}

export interface GuardianConsent {
  id: string
  user_id: string
  status: ConsentStatus
  guardian_email: string | null
  submitted_at: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  category: TagCategory
  display_order: number
  created_at: string
}

export interface UserTag {
  id: string
  user_id: string
  tag_id: string
  created_at: string
}

export interface DiagnosisResult {
  id: string
  user_id: string
  summary: string | null
  interest_level: DiagnosisInterestLevel
  goal_type: DiagnosisGoalType
  answers: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string
  visibility: 'public' | 'private'
  icon_url: string | null
  created_at: string
  updated_at: string
}

export interface CommunityTag {
  id: string
  community_id: string
  tag_id: string
}

export interface Room {
  id: string
  community_id: string
  title: string
  description: string
  age_policy: 'all' | 'adult_only' | 'minor_friendly'
  approval_required: boolean
  approval_status: RoomApprovalStatus
  creator_id: string
  max_members: number | null
  created_at: string
  updated_at: string
}

export interface RoomMembership {
  id: string
  room_id: string
  user_id: string
  status: MembershipStatus
  joined_at: string | null
  created_at: string
}

export interface RoomProfile {
  id: string
  room_id: string
  user_id: string
  nickname: string
  icon_url: string | null
  intro: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  room_id: string | null
  type: PostType
  title: string
  body: string
  status: ContentStatus
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  body: string
  status: ContentStatus
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  user_id: string
  target_type: TargetType
  target_id: string
  reaction_type: ReactionType
  created_at: string
}

export interface Event {
  id: string
  creator_id: string
  room_id: string | null
  title: string
  description: string
  start_at: string
  end_at: string | null
  format: 'online' | 'offline' | 'hybrid'
  location: string | null
  visibility: 'public' | 'room_only'
  status: EventStatus
  age_restriction: 'none' | 'adult_only' | 'minor_friendly'
  max_participants: number | null
  created_at: string
  updated_at: string
}

export interface EventParticipation {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'cancelled' | 'attended'
  created_at: string
}

export interface MentorProfile {
  id: string
  user_id: string
  status: MentorStatus
  expertise: string[]
  target_audience: string
  bio: string | null
  max_weekly_slots: number
  created_at: string
  updated_at: string
}

export interface BookingSlot {
  id: string
  mentor_user_id: string
  start_at: string
  end_at: string
  status: BookingStatus
  created_at: string
}

export interface ConsultationBooking {
  id: string
  slot_id: string
  mentor_user_id: string
  requester_user_id: string
  topic: string
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_type: TargetType
  target_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface ModerationCase {
  id: string
  target_type: TargetType
  target_id: string
  ai_label: ModerationLabel
  review_status: ReviewStatus
  action: string | null
  reviewer_id: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface AIProfileDraft {
  id: string
  user_id: string
  draft_type: 'bio' | 'room_intro' | 'mentor_expertise'
  content: string
  status: 'draft' | 'accepted' | 'rejected'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  target_type: TargetType
  target_id: string
  details: Record<string, unknown> | null
  created_at: string
}
