import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/constants/routes'
import { PageHeader } from '@/components/layout/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function AuditLogPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') redirect(ROUTES.LOGIN)

  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, users:actor_id(display_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <PageHeader title="監査ログ" />
      {(!logs || logs.length === 0) ? (
        <p className="text-muted-foreground text-center py-8">ログはありません</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>操作者</TableHead>
              <TableHead>アクション</TableHead>
              <TableHead>対象</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {new Date(log.created_at).toLocaleString('ja-JP')}
                </TableCell>
                <TableCell className="text-sm">
                  {log.users?.display_name || '不明'}
                </TableCell>
                <TableCell className="text-sm font-mono">{log.action}</TableCell>
                <TableCell className="text-sm">
                  {log.target_type} · {log.target_id.slice(0, 8)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
