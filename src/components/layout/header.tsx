import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href={ROUTES.FEED} className="text-lg font-bold">
          つながルート
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" render={<Link href={ROUTES.NOTIFICATIONS} />}>
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
