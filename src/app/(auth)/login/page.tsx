import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">ログイン</h1>
        <p className="text-sm text-muted-foreground">
          アカウントにログインしてコミュニティに参加しましょう
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        アカウントをお持ちでない方は{' '}
        <Link href={ROUTES.REGISTER} className="text-primary underline-offset-4 hover:underline">
          新規登録
        </Link>
      </p>
    </>
  )
}
