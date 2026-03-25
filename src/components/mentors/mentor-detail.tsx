'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, ArrowLeft } from 'lucide-react'

interface MentorDetailProps { mentor: any }

export function MentorDetail({ mentor }: MentorDetailProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />戻る
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <UserCheck className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <CardTitle>{mentor.users?.display_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{mentor.target_audience}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mentor.bio && <p className="text-sm">{mentor.bio}</p>}
        {mentor.users?.bio && <p className="text-sm text-muted-foreground">{mentor.users.bio}</p>}
        <div>
          <h3 className="text-sm font-semibold mb-2">専門分野</h3>
          <div className="flex flex-wrap gap-1">
            {(mentor.expertise || []).map((exp: string) => (
              <Badge key={exp} variant="secondary">{exp}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          相談は予約制です。相談後の自由なDMへの接続は行われません。
        </div>
      </CardContent>
    </Card>
  )
}
