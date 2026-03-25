'use client'

import { useTransition } from 'react'
import { resolveReportAction } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const statusLabels: Record<string, string> = {
  pending: '未処理',
  reviewing: '確認中',
  resolved: '解決済み',
  dismissed: '却下',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'destructive',
  reviewing: 'default',
  resolved: 'secondary',
  dismissed: 'outline',
}

interface ReportTableProps {
  reports: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ReportTable({ reports }: ReportTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (reportId: string, action: string) => {
    startTransition(async () => {
      await resolveReportAction(reportId, action)
    })
  }

  if (reports.length === 0) {
    return <p className="text-muted-foreground text-center py-8">通報はありません</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>日時</TableHead>
          <TableHead>通報者</TableHead>
          <TableHead>対象</TableHead>
          <TableHead>理由</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <TableRow key={report.id}>
            <TableCell className="text-sm">
              {new Date(report.created_at).toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell className="text-sm">
              {report.users?.display_name || '不明'}
            </TableCell>
            <TableCell className="text-sm">{report.target_type}</TableCell>
            <TableCell className="text-sm">{report.reason}</TableCell>
            <TableCell>
              <Badge variant={statusVariants[report.status] || 'outline'}>
                {statusLabels[report.status] || report.status}
              </Badge>
            </TableCell>
            <TableCell>
              {report.status === 'pending' && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(report.id, 'resolve')}
                    disabled={isPending}
                  >
                    対応済み
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(report.id, 'dismiss')}
                    disabled={isPending}
                  >
                    却下
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
