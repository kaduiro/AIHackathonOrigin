'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, HelpCircle, Users, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

const navItems = [
  { href: ROUTES.FEED, label: 'ホーム', icon: Home },
  { href: ROUTES.QA, label: 'Q&A', icon: HelpCircle },
  { href: ROUTES.ROOMS, label: 'ルーム', icon: Users },
  { href: ROUTES.EVENTS, label: 'イベント', icon: Calendar },
  { href: ROUTES.PROFILE, label: 'マイページ', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
