CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  birth_date DATE,
  document_url TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.guardian_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verifications_user ON public.verifications(user_id);
CREATE INDEX idx_verifications_status ON public.verifications(status);
CREATE INDEX idx_guardian_consents_user ON public.guardian_consents(user_id);
CREATE INDEX idx_guardian_consents_status ON public.guardian_consents(status);

CREATE TRIGGER verifications_updated_at BEFORE UPDATE ON public.verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER guardian_consents_updated_at BEFORE UPDATE ON public.guardian_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verification" ON public.verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own verification" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own verification" ON public.verifications FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.guardian_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consent" ON public.guardian_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consent" ON public.guardian_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consent" ON public.guardian_consents FOR UPDATE USING (auth.uid() = user_id);
