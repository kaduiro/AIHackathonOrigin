import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface MentorCardProps { mentor: any }

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <Link href={ROUTES.MENTOR_DETAIL(mentor.users?.id || mentor.user_id)}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <UserCheck className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-sm">{mentor.users?.display_name || '匿名メンター'}</CardTitle>
              <p className="text-xs text-muted-foreground">{mentor.target_audience}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {mentor.bio && <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>}
          <div className="flex flex-wrap gap-1">
            {(mentor.expertise || []).slice(0, 3).map((exp: string) => (
              <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
