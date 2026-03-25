export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatContext {
  userTags?: string[]
  currentPage?: string
}

const RESPONSES: Record<string, string[]> = {
  greeting: [
    'こんにちは！何かお手伝いできることはありますか？タグの選び方、質問の書き方、コミュニティの探し方など、何でもお気軽にどうぞ。',
  ],
  tag_help: [
    'タグの選び方について：\n\n1. まずは自分が「興味がある」と思うものを直感的に選んでみましょう\n2. 3〜5個くらいが最初はおすすめです\n3. 後からいつでも変更できるので、気軽に選んでOKです\n\n迷ったら「まだ決まっていないが探りたい」を選ぶのもアリですよ！',
  ],
  question_help: [
    '質問の書き方のコツ：\n\n1. 「今困っていること」を具体的に書く\n2. 「自分で試したこと」があれば添える\n3. 「どうなりたいか」のゴールを明確に\n\nテンプレートに沿って書くと、回答がもらいやすくなりますよ！',
  ],
  community_help: [
    'コミュニティの探し方：\n\n1. ホーム画面の「おすすめ」をチェック\n2. 興味タグで絞り込み\n3. まずは「閲覧だけ」でも大丈夫です\n\n気になるコミュニティがあれば、まずは覗いてみましょう！',
  ],
  event_help: [
    'イベントへの参加方法：\n\n1. イベント一覧から興味のあるものを探す\n2. 詳細を確認して「参加する」ボタンを押す\n3. 当日は気軽に参加してOKです\n\n初心者歓迎のイベントも多いので、安心して参加してくださいね！',
  ],
  safety: [
    '⚠️ 安全に関するお知らせ：\n\n• 外部SNSのIDやURLの交換は禁止されています\n• 困ったことがあれば「通報」機能をご利用ください\n• 個人情報の取り扱いには十分ご注意ください\n• 不審なメッセージを受け取った場合は、運営にご連絡ください',
  ],
  default: [
    'ご質問ありがとうございます！以下のトピックについてお手伝いできます：\n\n• タグの選び方\n• 質問の書き方\n• コミュニティの探し方\n• イベントへの参加\n• 安全に関する情報\n\nどれについて知りたいですか？',
  ],
}

export function generateMockResponse(userMessage: string, _context?: ChatContext): string {
  const message = userMessage.toLowerCase()

  if (message.includes('こんにちは') || message.includes('はじめまして') || message.includes('hello')) {
    return pickRandom(RESPONSES.greeting)
  }
  if (message.includes('タグ') || message.includes('興味') || message.includes('選')) {
    return pickRandom(RESPONSES.tag_help)
  }
  if (message.includes('質問') || message.includes('書き方') || message.includes('投稿')) {
    return pickRandom(RESPONSES.question_help)
  }
  if (message.includes('コミュニティ') || message.includes('ルーム') || message.includes('参加')) {
    return pickRandom(RESPONSES.community_help)
  }
  if (message.includes('イベント') || message.includes('予定')) {
    return pickRandom(RESPONSES.event_help)
  }
  if (message.includes('安全') || message.includes('通報') || message.includes('危険') || message.includes('SNS')) {
    return pickRandom(RESPONSES.safety)
  }

  return pickRandom(RESPONSES.default)
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}
