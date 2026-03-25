CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id),
  room_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  format TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'offline', 'hybrid')),
  location TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'room_only')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'stopped', 'completed')),
  age_restriction TEXT NOT NULL DEFAULT 'none' CHECK (age_restriction IN ('none', 'adult_only', 'minor_friendly')),
  max_participants INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_events_creator ON public.events(creator_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start ON public.events(start_at);
CREATE INDEX idx_participations_event ON public.event_participations(event_id);
CREATE INDEX idx_participations_user ON public.event_participations(user_id);

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published events viewable" ON public.events FOR SELECT USING (status IN ('published', 'completed') OR creator_id = auth.uid());
CREATE POLICY "Auth users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update events" ON public.events FOR UPDATE USING (auth.uid() = creator_id);

ALTER TABLE public.event_participations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participations viewable" ON public.event_participations FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.event_participations FOR UPDATE USING (auth.uid() = user_id);
