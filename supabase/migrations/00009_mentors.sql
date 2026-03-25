CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  expertise TEXT[] NOT NULL DEFAULT '{}',
  target_audience TEXT NOT NULL DEFAULT '',
  bio TEXT,
  max_weekly_slots INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id UUID NOT NULL REFERENCES public.users(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.booking_slots(id),
  mentor_user_id UUID NOT NULL REFERENCES public.users(id),
  requester_user_id UUID NOT NULL REFERENCES public.users(id),
  topic TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentor_profiles_user ON public.mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_status ON public.mentor_profiles(status);
CREATE INDEX idx_booking_slots_mentor ON public.booking_slots(mentor_user_id);
CREATE INDEX idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX idx_booking_slots_start ON public.booking_slots(start_at);
CREATE INDEX idx_bookings_mentor ON public.consultation_bookings(mentor_user_id);
CREATE INDEX idx_bookings_requester ON public.consultation_bookings(requester_user_id);
CREATE INDEX idx_bookings_status ON public.consultation_bookings(status);

CREATE TRIGGER mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.consultation_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved mentors viewable" ON public.mentor_profiles FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "Users can create own profile" ON public.mentor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.mentor_profiles FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Available slots viewable" ON public.booking_slots FOR SELECT USING (true);
CREATE POLICY "Mentors can manage own slots" ON public.booking_slots FOR INSERT WITH CHECK (auth.uid() = mentor_user_id);
CREATE POLICY "Mentors can update own slots" ON public.booking_slots FOR UPDATE USING (auth.uid() = mentor_user_id);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.consultation_bookings FOR SELECT USING (auth.uid() = requester_user_id OR auth.uid() = mentor_user_id);
CREATE POLICY "Users can create bookings" ON public.consultation_bookings FOR INSERT WITH CHECK (auth.uid() = requester_user_id);
CREATE POLICY "Participants can update bookings" ON public.consultation_bookings FOR UPDATE USING (auth.uid() = requester_user_id OR auth.uid() = mentor_user_id);
