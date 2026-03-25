CREATE TABLE public.ai_profile_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  draft_type TEXT NOT NULL CHECK (draft_type IN ('bio', 'room_intro', 'mentor_expertise')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_drafts_user ON public.ai_profile_drafts(user_id);

ALTER TABLE public.ai_profile_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own drafts" ON public.ai_profile_drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON public.ai_profile_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drafts" ON public.ai_profile_drafts FOR UPDATE USING (auth.uid() = user_id);
