import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Monitor, Shield } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface EventCardProps { event: any }

export function EventCard({ event }: EventCardProps) {
  const formatLabels: Record<string, string> = { online: 'オンライン', offline: 'オフライン', hybrid: 'ハイブリッド' }

  return (
    <Link href={ROUTES.EVENT_DETAIL(event.id)}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium line-clamp-1">{event.title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {formatLabels[event.format] || event.format}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(event.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>{event.users?.display_name}</span>
            {event.age_restriction === 'adult_only' && (
              <Badge variant="outline" className="text-xs gap-1"><Shield className="h-3 w-3" />18+</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
