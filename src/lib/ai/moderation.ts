export type ModerationResult = {
  label: 'safe' | 'caution' | 'held'
  reasons: string[]
  flaggedWords: string[]
}

// NG words list (basic)
const NG_WORDS = [
  // External contact
  'LINE', 'ライン', 'Twitter', 'X(旧Twitter)', 'Instagram', 'インスタ',
  'Discord', 'ディスコード', 'TikTok', 'ティックトック',
  'DM', 'ダイレクトメッセージ', '個人的に連絡',
  // Contact exchange patterns
  'ID教えて', 'アカウント教えて', '連絡先', '電話番号',
  // Harmful content
  '死ね', '殺す', 'バカ', 'アホ', 'クソ',
]

// URL pattern
const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi

// SNS ID pattern
const SNS_ID_PATTERN = /@[\w]+/g

export function moderateContent(text: string): ModerationResult {
  const reasons: string[] = []
  const flaggedWords: string[] = []

  // Check NG words
  for (const word of NG_WORDS) {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      flaggedWords.push(word)
    }
  }

  if (flaggedWords.length > 0) {
    reasons.push('禁止ワードが含まれています')
  }

  // Check URLs
  const urls = text.match(URL_PATTERN)
  if (urls) {
    reasons.push('URLが含まれています')
    flaggedWords.push(...urls)
  }

  // Check SNS IDs
  const snsIds = text.match(SNS_ID_PATTERN)
  if (snsIds) {
    reasons.push('SNS IDのような文字列が含まれています')
    flaggedWords.push(...snsIds)
  }

  // Determine label
  let label: ModerationResult['label'] = 'safe'
  if (reasons.length > 0) {
    // Harmful content words (last 5 in NG_WORDS) -> held; others -> caution
    label = flaggedWords.some(w => NG_WORDS.slice(-5).some(ng => w.toLowerCase().includes(ng.toLowerCase())))
      ? 'held'
      : 'caution'
  }

  return { label, reasons, flaggedWords }
}
