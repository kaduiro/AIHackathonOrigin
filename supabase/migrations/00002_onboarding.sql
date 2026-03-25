-- Tags master table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('interest', 'skill', 'goal', 'field')),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-Tag association
CREATE TABLE public.user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tag_id)
);

-- Diagnosis results
CREATE TABLE public.diagnosis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  summary TEXT,
  interest_level TEXT NOT NULL CHECK (interest_level IN ('exploring', 'interested', 'committed')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('learn', 'connect', 'create', 'mentor', 'explore')),
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Communities
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community-Tag association
CREATE TABLE public.community_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(community_id, tag_id)
);

-- Indexes
CREATE INDEX idx_user_tags_user ON public.user_tags(user_id);
CREATE INDEX idx_user_tags_tag ON public.user_tags(tag_id);
CREATE INDEX idx_diagnosis_user ON public.diagnosis_results(user_id);
CREATE INDEX idx_community_tags_community ON public.community_tags(community_id);
CREATE INDEX idx_community_tags_tag ON public.community_tags(tag_id);
CREATE INDEX idx_tags_category ON public.tags(category);

-- Updated_at triggers
CREATE TRIGGER diagnosis_results_updated_at
  BEFORE UPDATE ON public.diagnosis_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tags" ON public.user_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.user_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.user_tags FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.diagnosis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own diagnosis" ON public.diagnosis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diagnosis" ON public.diagnosis_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diagnosis" ON public.diagnosis_results FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Communities are viewable by authenticated users" ON public.communities FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE public.community_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community tags are viewable by authenticated users" ON public.community_tags FOR SELECT USING (auth.uid() IS NOT NULL);

-- Seed data: default tags
INSERT INTO public.tags (name, category, display_order) VALUES
  ('プログラミング', 'interest', 1),
  ('デザイン', 'interest', 2),
  ('マーケティング', 'interest', 3),
  ('データサイエンス', 'interest', 4),
  ('AI・機械学習', 'interest', 5),
  ('起業・ビジネス', 'interest', 6),
  ('音楽', 'interest', 7),
  ('映像・写真', 'interest', 8),
  ('ライティング', 'interest', 9),
  ('語学・留学', 'interest', 10),
  ('就活', 'interest', 11),
  ('研究・論文', 'interest', 12),
  ('ボランティア', 'interest', 13),
  ('スポーツ', 'interest', 14),
  ('ゲーム開発', 'interest', 15),
  ('Web開発', 'skill', 1),
  ('モバイルアプリ', 'skill', 2),
  ('UI/UXデザイン', 'skill', 3),
  ('動画編集', 'skill', 4),
  ('プレゼン', 'skill', 5),
  ('新しいことを学びたい', 'goal', 1),
  ('仲間を見つけたい', 'goal', 2),
  ('何か作品を作りたい', 'goal', 3),
  ('人に教えたい・相談に乗りたい', 'goal', 4),
  ('まだ決まっていないが探りたい', 'goal', 5),
  ('IT', 'field', 1),
  ('アート・クリエイティブ', 'field', 2),
  ('ビジネス・経営', 'field', 3),
  ('教育', 'field', 4),
  ('理工系', 'field', 5),
  ('人文・社会科学', 'field', 6);

-- Seed data: sample communities
INSERT INTO public.communities (name, description) VALUES
  ('はじめてのプログラミング', '初心者歓迎！プログラミングを始めたい人のためのコミュニティ'),
  ('デザイン研究会', 'UI/UXからグラフィックまで、デザインに興味がある学生の集まり'),
  ('AI・データサイエンス入門', 'AIやデータサイエンスに興味がある学生向けの学び合いの場'),
  ('起業・ビジネスチャレンジ', 'ビジネスアイデアを形にしたい学生のコミュニティ'),
  ('クリエイター集会所', '映像、音楽、ライティングなどクリエイティブ活動をする学生の場'),
  ('就活サポートルーム', '就活の悩みや情報を共有するコミュニティ'),
  ('語学・留学チャレンジ', '語学学習や留学に興味がある学生のための情報交換の場'),
  ('ハッカソン仲間募集', 'ハッカソンやコンテストに一緒に参加する仲間を見つけよう');

-- Link communities to tags (sample)
INSERT INTO public.community_tags (community_id, tag_id)
SELECT c.id, t.id FROM public.communities c, public.tags t
WHERE (c.name = 'はじめてのプログラミング' AND t.name IN ('プログラミング', 'Web開発', '新しいことを学びたい'))
   OR (c.name = 'デザイン研究会' AND t.name IN ('デザイン', 'UI/UXデザイン', 'アート・クリエイティブ'))
   OR (c.name = 'AI・データサイエンス入門' AND t.name IN ('AI・機械学習', 'データサイエンス', 'IT'))
   OR (c.name = '起業・ビジネスチャレンジ' AND t.name IN ('起業・ビジネス', 'ビジネス・経営', '仲間を見つけたい'))
   OR (c.name = 'クリエイター集会所' AND t.name IN ('映像・写真', '音楽', 'アート・クリエイティブ'))
   OR (c.name = '就活サポートルーム' AND t.name IN ('就活', '仲間を見つけたい'))
   OR (c.name = '語学・留学チャレンジ' AND t.name IN ('語学・留学', '新しいことを学びたい'))
   OR (c.name = 'ハッカソン仲間募集' AND t.name IN ('プログラミング', '仲間を見つけたい', 'ゲーム開発'));
