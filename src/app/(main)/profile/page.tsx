import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ROLE_LABELS } from '@/constants/roles'
import { UserRole } from '@/types/database'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: userTags } = await supabase
    .from('user_tags')
    .select('tags(name)')
    .eq('user_id', user.id)

  return (
    <div className="container max-w-2xl space-y-4 py-4">
      <PageHeader title="マイページ" />
      <Card>
        <CardHeader>
          <CardTitle>{user.display_name}</CardTitle>
          <Badge variant="outline">{ROLE_LABELS[user.role as UserRole] || user.role}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && <p className="text-sm">{user.bio}</p>}
          {user.affiliation && <p className="text-sm text-muted-foreground">{user.affiliation}</p>}
          {userTags && userTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {userTags.map((ut: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                <Badge key={i} variant="secondary" className="text-xs">
                  {(ut.tags as any)?.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Link href={ROUTES.PROFILE_EDIT}>
              <Button variant="outline" size="sm">プロフィール編集</Button>
            </Link>
            <Link href={ROUTES.INTERESTS}>
              <Button variant="ghost" size="sm">興味タグを編集</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
