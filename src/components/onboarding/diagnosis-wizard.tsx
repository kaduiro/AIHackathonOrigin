'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitDiagnosisAction, skipDiagnosisAction } from '@/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question: string
  options: { value: string; label: string; description: string }[]
}

const questions: Question[] = [
  {
    id: 'interestLevel',
    question: 'コミュニティへの参加意欲はどのくらいですか？',
    options: [
      { value: 'exploring', label: 'まずは見てみたい', description: '気軽にのぞいてみて、合いそうなら参加したい' },
      { value: 'interested', label: '積極的に参加したい', description: '興味のあるコミュニティに入って活動したい' },
      { value: 'committed', label: '本格的に取り組みたい', description: 'リーダーシップをとったり、深く関わりたい' },
    ],
  },
  {
    id: 'goalType',
    question: 'コミュニティで何をしたいですか？',
    options: [
      { value: 'learn', label: '新しいことを学びたい', description: '未経験の分野やスキルを身につけたい' },
      { value: 'connect', label: '仲間を見つけたい', description: '同じ興味を持つ人とつながりたい' },
      { value: 'create', label: '何かを作りたい', description: 'プロジェクトや作品を一緒に作りたい' },
      { value: 'mentor', label: '教えたい・相談に乗りたい', description: '自分の経験を活かして人を助けたい' },
      { value: 'explore', label: 'まだわからない', description: 'とりあえず色々見てみたい' },
    ],
  },
  {
    id: 'experience',
    question: 'コミュニティ活動の経験はありますか？',
    options: [
      { value: 'none', label: '初めて', description: 'コミュニティに参加するのは今回が初めて' },
      { value: 'some', label: '少しある', description: 'サークルや部活などに参加したことがある' },
      { value: 'experienced', label: 'よくある', description: '複数のコミュニティで活動してきた' },
    ],
  },
  {
    id: 'preference',
    question: 'どんな雰囲気のコミュニティが好みですか？',
    options: [
      { value: 'casual', label: 'ゆるく楽しく', description: '気軽に交流できる場がいい' },
      { value: 'focused', label: 'しっかり学ぶ', description: '目標を持って取り組む場がいい' },
      { value: 'mixed', label: 'どちらも', description: '時と場合による' },
    ],
  },
]

export function DiagnosisWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const progress = ((currentStep + 1) / questions.length) * 100

  const selectOption = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = () => {
    if (!answers[currentQuestion.id]) return

    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await submitDiagnosisAction({
        interestLevel: answers.interestLevel || 'exploring',
        goalType: answers.goalType || 'explore',
        answers,
      })
      if (result.success) {
        router.push(ROUTES.MATCHING_RESULTS)
      } else {
        setError(result.error || 'エラーが発生しました')
      }
    })
  }

  const handleSkip = () => {
    startTransition(async () => {
      await skipDiagnosisAction()
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>質問 {currentStep + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Question */}
      <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map(option => (
          <Card
            key={option.value}
            className={cn(
              'cursor-pointer transition-colors hover:border-primary/50',
              answers[currentQuestion.id] === option.value && 'border-primary bg-primary/5'
            )}
            onClick={() => selectOption(option.value)}
          >
            <CardContent className="p-4">
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>

        <Button
          variant="link"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          スキップ
        </Button>

        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || isPending}
        >
          {isPending ? '送信中...' : isLastStep ? '結果を見る' : '次へ'}
          {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
