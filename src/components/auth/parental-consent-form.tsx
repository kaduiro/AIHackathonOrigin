'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitParentalConsentAction } from '@/actions/verification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function ParentalConsentForm() {
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await submitParentalConsentAction(formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push(ROUTES.FEED), 2000)
      } else {
        setError(result.error || 'エラーが発生しました')
      }
    })
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">保護者同意を送信しました</h2>
              <p className="text-sm text-muted-foreground">
                管理者の確認後、すべての機能をご利用いただけます。
                ホーム画面に移動します...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <p>18歳未満のユーザーの安全を守るため、保護者の方の同意をお願いしています。</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="guardianName">保護者の氏名</Label>
            <Input id="guardianName" name="guardianName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianEmail">保護者のメールアドレス</Label>
            <Input id="guardianEmail" name="guardianEmail" type="email" required />
            <p className="text-xs text-muted-foreground">
              確認メールが送信されます
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">保護者の電話番号（任意）</Label>
            <Input id="guardianPhone" name="guardianPhone" type="tel" />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
              保護者として、お子様のサービス利用に同意し、
              <a href="/terms" className="text-primary underline-offset-4 hover:underline">利用規約</a>
              と
              <a href="/safety" className="text-primary underline-offset-4 hover:underline">安全ポリシー</a>
              を確認しました
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isPending || !agreed}>
            {isPending ? '送信中...' : '同意して送信する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
