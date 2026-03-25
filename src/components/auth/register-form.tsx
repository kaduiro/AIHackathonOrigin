'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { registerAction, type ActionResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

const initialState: ActionResult = { success: false }

export function RegisterForm() {
  const [agreed, setAgreed] = useState(false)
  const [state, formAction, isPending] = useActionState(
    async (_prevState: ActionResult, formData: FormData) => {
      return await registerAction(formData)
    },
    initialState
  )

  if (state.success) {
    return (
      <Card>
        <CardContent>
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">登録が完了しました</h2>
              <p className="text-sm text-muted-foreground">
                ご登録のメールアドレスに確認メールを送信しました。
                メール内のリンクをクリックして、アカウントを有効化してください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="ニックネーム"
              required
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@university.ac.jp"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8文字以上"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
              <span>
                <a href="/terms" className="text-primary underline-offset-4 hover:underline">利用規約</a>
                、
                <a href="/privacy" className="text-primary underline-offset-4 hover:underline">プライバシーポリシー</a>
                、
                <a href="/safety" className="text-primary underline-offset-4 hover:underline">安全ポリシー</a>
                に同意します
              </span>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !agreed}>
            {isPending ? '登録中...' : '登録する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
