'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Flag,
  ShieldCheck,
  UserCheck,
  DoorOpen,
  CalendarCheck,
  MessageSquareWarning,
  ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

const sidebarItems = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'ダッシュボード', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_REPORTS, label: '通報管理', icon: Flag },
  { href: ROUTES.ADMIN_VERIFICATIONS, label: '年齢確認審査', icon: ShieldCheck },
  { href: ROUTES.ADMIN_MENTORS, label: 'メンター審査', icon: UserCheck },
  { href: ROUTES.ADMIN_ROOMS, label: 'ルーム承認', icon: DoorOpen },
  { href: ROUTES.ADMIN_EVENTS, label: 'イベント監視', icon: CalendarCheck },
  { href: ROUTES.ADMIN_MODERATION, label: 'モデレーション設定', icon: MessageSquareWarning },
  { href: ROUTES.ADMIN_AUDIT_LOG, label: '監査ログ', icon: ScrollText },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r bg-muted/40 lg:block">
      <div className="flex h-14 items-center border-b px-6">
        <Link href={ROUTES.ADMIN_DASHBOARD} className="text-lg font-bold">
          管理者パネル
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
