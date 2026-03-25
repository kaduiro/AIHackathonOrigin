import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          つながルート
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          興味ベースで学生をつなぎ、安全に最初の一歩を踏み出せる
          学び・相談・挑戦のコミュニティプラットフォーム
        </p>
      </div>
      <div className="flex gap-4">
        <Button size="lg" render={<Link href={ROUTES.REGISTER} />}>
          新規登録
        </Button>
        <Button variant="outline" size="lg" render={<Link href={ROUTES.LOGIN} />}>
          ログイン
        </Button>
      </div>
    </div>
  )
}
