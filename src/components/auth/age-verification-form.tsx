'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitAgeVerificationAction } from '@/actions/verification'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function AgeVerificationForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isMinor, setIsMinor] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await submitAgeVerificationAction(formData)
      if (result.success) {
        // Check if minor based on birth date
        const birthDateStr = formData.get('birthDate') as string
        const birthDate = new Date(birthDateStr)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }

        if (age < 18) {
          setIsMinor(true)
          setSuccess(true)
        } else {
          setSuccess(true)
          setTimeout(() => router.push(ROUTES.FEED), 1500)
        }
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
              <h2 className="text-lg font-semibold">年齢確認が完了しました</h2>
              {isMinor ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    18歳未満のため、保護者の同意が必要です。
                  </p>
                  <Button onClick={() => router.push(ROUTES.PARENTAL_CONSENT)} className="mt-4">
                    保護者同意に進む
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  ホーム画面に移動します...
                </p>
              )}
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
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <ShieldCheck className="h-5 w-5 flex-shrink-0" />
            <p>安全なコミュニティのために年齢確認を行っています。情報は厳重に保護されます。</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="birthDate">生年月日</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              18歳未満の方は保護者の同意が必要になります
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '確認中...' : '年齢を確認する'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
