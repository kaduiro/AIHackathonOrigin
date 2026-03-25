import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function RegisterPage() {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">新規登録</h1>
        <p className="text-sm text-muted-foreground">
          アカウントを作成して、学び・相談・挑戦の場に参加しましょう
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        既にアカウントをお持ちの方は{' '}
        <Link href={ROUTES.LOGIN} className="text-primary underline-offset-4 hover:underline">
          ログイン
        </Link>
      </p>
    </>
  )
}
