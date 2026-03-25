import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, ShieldCheck, UserCheck, DoorOpen, MessageSquareWarning } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()

  const [reports, verifications, mentors, rooms, moderations] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('verifications').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('mentor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('moderation_cases').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
  ])

  const stats = [
    { label: '未処理の通報', count: reports.count || 0, icon: Flag, href: ROUTES.ADMIN_REPORTS, color: 'text-red-500' },
    { label: '年齢確認待ち', count: verifications.count || 0, icon: ShieldCheck, href: ROUTES.ADMIN_VERIFICATIONS, color: 'text-blue-500' },
    { label: 'メンター審査待ち', count: mentors.count || 0, icon: UserCheck, href: ROUTES.ADMIN_MENTORS, color: 'text-green-500' },
    { label: 'ルーム承認待ち', count: rooms.count || 0, icon: DoorOpen, href: ROUTES.ADMIN_ROOMS, color: 'text-purple-500' },
    { label: 'モデレーション保留', count: moderations.count || 0, icon: MessageSquareWarning, href: ROUTES.ADMIN_MODERATION, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="管理者ダッシュボード" description="未処理タスクの一覧" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
