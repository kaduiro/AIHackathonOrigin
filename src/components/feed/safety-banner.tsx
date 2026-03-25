import { ShieldCheck } from 'lucide-react'

export function SafetyBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950">
      <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
      <div>
        <span className="font-medium text-blue-800 dark:text-blue-200">安全なコミュニティ</span>
        <span className="text-blue-700 dark:text-blue-300">
          {' '}— 外部SNSの交換は禁止です。困ったことがあれば通報機能をご利用ください。
        </span>
      </div>
    </div>
  )
}
