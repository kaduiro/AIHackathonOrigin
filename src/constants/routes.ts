export const ROUTES = {
  // Auth
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AGE_VERIFICATION: '/age-verification',
  PARENTAL_CONSENT: '/parental-consent',

  // Onboarding
  INTERESTS: '/interests',
  DIAGNOSIS: '/diagnosis',
  MATCHING_RESULTS: '/matching-results',

  // Main
  FEED: '/home',
  QA: '/qa',
  QA_CREATE: '/qa/create',
  QA_DETAIL: (id: string) => `/qa/${id}`,
  ROOMS: '/rooms',
  ROOM_DETAIL: (id: string) => `/rooms/${id}`,
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  EVENT_CREATE: '/events/create',
  MENTORS: '/mentors',
  MENTOR_DETAIL: (id: string) => `/mentors/${id}`,
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  AI_SUPPORT: '/ai-support',
  NOTIFICATIONS: '/notifications',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_VERIFICATIONS: '/admin/verifications',
  ADMIN_MENTORS: '/admin/mentors',
  ADMIN_ROOMS: '/admin/rooms',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
} as const
