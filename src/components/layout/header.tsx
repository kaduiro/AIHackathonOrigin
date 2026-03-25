import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
        <Link href={ROUTES.FEED} className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          つながルート
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" render={<Link href={ROUTES.NOTIFICATIONS} />}>
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
