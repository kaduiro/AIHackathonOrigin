-- Demo data for hackathon presentation
DO $$
DECLARE
  sample_user_id UUID;
  post_count INT;
BEGIN
  SELECT id INTO sample_user_id FROM public.users LIMIT 1;
  IF sample_user_id IS NULL THEN
    RAISE NOTICE 'No users found, skipping demo data';
    RETURN;
  END IF;

  -- Check if demo data already exists
  SELECT COUNT(*) INTO post_count FROM public.posts WHERE author_id = sample_user_id;
  IF post_count > 3 THEN
    RAISE NOTICE 'Demo data already exists, skipping';
    RETURN;
  END IF;

  -- Sample Q&A Posts
  INSERT INTO public.posts (author_id, type, title, body, status, tags) VALUES
  (sample_user_id, 'question', 'Next.jsとReactの違いがよく分かりません',
   '【困っていること】' || chr(10) || 'プログラミングを始めたばかりで、Next.jsとReactの違いがいまいち理解できていません。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || '公式ドキュメントを読みましたが、SSRやSSGなどの専門用語が多くて混乱しています。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || 'それぞれの特徴と、初心者はどちらから学ぶべきか教えていただきたいです。',
   'published', ARRAY['プログラミング', 'Web開発']),

  (sample_user_id, 'question', '大学1年生でインターンに応募するのは早いですか？',
   '【困っていること】' || chr(10) || 'IT企業のインターンに興味がありますが、まだ大学1年生です。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || '先輩に聞いたら「まだ早い」と言われましたが、SNSでは1年生から行っている人もいるようです。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || '1年生でもインターンに参加できるのか、何を準備すべきか知りたいです。',
   'published', ARRAY['就活', '起業・ビジネス']),

  (sample_user_id, 'question', 'TOEICのスコアを600→800に上げる勉強法',
   '【困っていること】' || chr(10) || '現在TOEICスコアが600点で、就活までに800点を目標にしています。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || '公式問題集を2冊解きましたが、リスニングが伸び悩んでいます。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || '効率的な勉強法や、おすすめの教材を教えていただきたいです。',
   'published', ARRAY['語学・留学']),

  (sample_user_id, 'question', 'Figmaでのポートフォリオの作り方',
   '【困っていること】' || chr(10) || 'デザインに興味があり、ポートフォリオを作りたいのですが、Figmaの使い方が分かりません。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || 'YouTubeのチュートリアルを見ましたが、実際のポートフォリオとして何を載せればいいか迷っています。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || '初心者でも見栄えの良いポートフォリオを作る方法を教えてください。',
   'published', ARRAY['デザイン', 'UI/UXデザイン']),

  (sample_user_id, 'question', 'ハッカソン初参加で何を準備すべき？',
   '【困っていること】' || chr(10) || '来月初めてハッカソンに参加します。チーム開発の経験がなく不安です。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || 'Gitの基本的な使い方は覚えました。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || 'ハッカソンで必要なスキルや、事前に準備しておくべきことを知りたいです。',
   'published', ARRAY['プログラミング', 'ゲーム開発']),

  (sample_user_id, 'question', 'データサイエンスを学ぶのにPythonとRどちらがいい？',
   '【困っていること】' || chr(10) || 'データサイエンスに興味がありますが、PythonとRのどちらを先に学ぶべきか迷っています。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || '両方のチュートリアルを少し触りましたが、決められません。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || 'それぞれのメリット・デメリットと、初学者へのおすすめを教えてください。',
   'published', ARRAY['データサイエンス', 'AI・機械学習']),

  (sample_user_id, 'discussion', '【雑談】皆さんの勉強場所を教えてください',
   'カフェ、図書館、自習室、自宅...皆さんはどこで勉強していますか？' || chr(10) || '集中できるおすすめの場所があれば教えてください！',
   'published', ARRAY['研究・論文']),

  (sample_user_id, 'question', 'Web制作のバイトの探し方',
   '【困っていること】' || chr(10) || 'HTML/CSS/JavaScriptの基礎を学んだので、Web制作のバイトをしたいです。' || chr(10) || chr(10) || '【試したこと】' || chr(10) || 'バイトサイトで検索しましたが、「実務経験1年以上」の案件ばかりでした。' || chr(10) || chr(10) || '【どうなりたいか】' || chr(10) || '未経験OKのWeb制作案件の探し方を教えてください。',
   'published', ARRAY['Web開発', 'プログラミング']);

  -- Comments
  INSERT INTO public.comments (post_id, author_id, body, status)
  SELECT p.id, sample_user_id,
    CASE
      WHEN p.title LIKE '%Next.js%' THEN '初心者にはまずReactから始めることをおすすめします！Reactの基礎を理解してからNext.jsに進むとスムーズですよ。SSRは「サーバーでHTMLを生成する」くらいの理解で最初はOKです。'
      WHEN p.title LIKE '%インターン%' THEN '1年生でもインターンに応募できますよ！特にITベンチャーは学年不問のところが多いです。まずはProgateやUdemyでポートフォリオを作ってから応募するのがおすすめです。'
      WHEN p.title LIKE '%TOEIC%' THEN 'リスニングは「シャドーイング」が効果的です。公式問題集の音声を毎日15分聞き流すだけでも違いますよ。あとはabceedというアプリもおすすめです！'
      WHEN p.title LIKE '%Figma%' THEN 'Figmaコミュニティにテンプレートがたくさんあるので、まずはそこからスタートするのがおすすめです。自分のプロジェクト＋学習過程をまとめるだけでも立派なポートフォリオになります。'
      WHEN p.title LIKE '%ハッカソン%' THEN 'ハッカソンは技術力よりもアイデアとチームワークが大事です！事前にチームでの役割分担を決めておくと当日スムーズに進みますよ。楽しんでください！'
      WHEN p.title LIKE '%Python%' THEN 'データサイエンスならPythonがおすすめです！ライブラリが充実していて、機械学習にも応用しやすいですよ。'
      WHEN p.title LIKE '%勉強場所%' THEN '私は大学の図書館とスターバックスを使い分けています。集中したい時は図書館、気分転換したい時はカフェがおすすめです！'
      ELSE 'とても参考になる質問ですね！私も同じことで悩んでいました。'
    END,
    'published'
  FROM public.posts p
  WHERE p.author_id = sample_user_id AND p.status = 'published';

  -- Reactions
  INSERT INTO public.reactions (user_id, target_type, target_id, reaction_type)
  SELECT sample_user_id, 'post', p.id,
    (ARRAY['like', 'helpful', 'interesting', 'support'])[floor(random() * 4 + 1)]
  FROM public.posts p WHERE p.status = 'published' LIMIT 5
  ON CONFLICT DO NOTHING;

  -- Events
  INSERT INTO public.events (creator_id, title, description, start_at, end_at, format, status, age_restriction) VALUES
  (sample_user_id, '🎯 もくもく会 - Web開発', '今夜一緒に勉強しませんか？各自の作業をしながら、分からないことがあれば気軽に質問できる雰囲気です。初心者大歓迎！', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'online', 'published', 'none'),
  (sample_user_id, '💡 アイデアソン - 学生生活を便利にするアプリ', '「こんなアプリがあったらいいな」を自由に考えるブレストイベントです。実装スキルは不要、アイデアだけ持ってきてください！', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 'online', 'published', 'none'),
  (sample_user_id, '📚 TOEIC対策 勉強会', 'TOEIC600→800を目指す人向けの勉強会です。リスニングパートを中心に一緒に問題を解きましょう。', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 'online', 'published', 'none'),
  (sample_user_id, '🎨 UI/UXデザイン入門ワークショップ', 'Figmaを使ったUIデザインの基礎を学ぶハンズオンです。PC持参でお願いします。', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'hybrid', 'published', 'none'),
  (sample_user_id, '🏃 朝活プログラミング - 毎週月曜7:00〜', '朝の1時間でコーディング！習慣化したい方、一緒に頑張りましょう。', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'online', 'published', 'none');

  -- Rooms
  INSERT INTO public.rooms (community_id, title, description, age_policy, approval_required, approval_status, creator_id)
  SELECT c.id, room.title, room.description, 'all', false, 'approved', sample_user_id
  FROM public.communities c,
  (VALUES
    ('はじめてのプログラミング', '#Python入門', 'Pythonをゼロから学ぶ部屋。質問OK、初心者大歓迎！'),
    ('はじめてのプログラミング', '#Web制作チャレンジ', 'HTML/CSS/JSでWebサイトを作る仲間を募集中'),
    ('デザイン研究会', '#UIデザイン練習帳', '毎日1つUIパーツを作って共有する部屋'),
    ('AI・データサイエンス入門', '#ChatGPTを使い倒す', 'プロンプトエンジニアリングや活用法を共有'),
    ('起業・ビジネスチャレンジ', '#ビジネスアイデア壁打ち', 'アイデアを気軽にぶつけ合う場所'),
    ('就活サポートルーム', '#ES添削し合い', 'エントリーシートを相互レビューする部屋'),
    ('クリエイター集会所', '#名作映画考察', '映画の感想や考察を語り合う部屋'),
    ('ハッカソン仲間募集', '#チームメンバー募集板', 'ハッカソンやコンテストの仲間を探す')
  ) AS room(community_name, title, description)
  WHERE c.name = room.community_name;

END $$;
