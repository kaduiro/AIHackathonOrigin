CREATE TABLE public.moderation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'event', 'room', 'user', 'profile')),
  target_id UUID NOT NULL,
  ai_label TEXT NOT NULL CHECK (ai_label IN ('safe', 'caution', 'held')),
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'escalated')),
  action TEXT,
  reviewer_id UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  flagged_words TEXT[] DEFAULT '{}',
  reasons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_target ON public.moderation_cases(target_type, target_id);
CREATE INDEX idx_moderation_status ON public.moderation_cases(review_status);
CREATE INDEX idx_moderation_label ON public.moderation_cases(ai_label);

CREATE TRIGGER moderation_cases_updated_at BEFORE UPDATE ON public.moderation_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.moderation_cases ENABLE ROW LEVEL SECURITY;
-- Only admins can view moderation cases (handled by checking role in application)
CREATE POLICY "Admins can view all" ON public.moderation_cases FOR SELECT USING (true);
CREATE POLICY "System can insert" ON public.moderation_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update" ON public.moderation_cases FOR UPDATE USING (true);
