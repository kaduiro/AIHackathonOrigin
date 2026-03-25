import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Lock, Shield } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface RoomCardProps { room: Record<string, unknown> & { id: string; title: string; description: string; approval_required: boolean; age_policy: string; communities?: { name: string } | null } }

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={ROUTES.ROOM_DETAIL(room.id)}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{room.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{room.communities?.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
          <div className="flex gap-1">
            {room.approval_required && (
              <Badge variant="outline" className="text-xs gap-1"><Lock className="h-3 w-3" />承認制</Badge>
            )}
            {room.age_policy === 'adult_only' && (
              <Badge variant="outline" className="text-xs gap-1"><Shield className="h-3 w-3" />18+</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
