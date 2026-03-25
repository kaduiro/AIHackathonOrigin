CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  age_policy TEXT NOT NULL DEFAULT 'all' CHECK (age_policy IN ('all', 'adult_only', 'minor_friendly')),
  approval_required BOOLEAN NOT NULL DEFAULT false,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  creator_id UUID NOT NULL REFERENCES public.users(id),
  max_members INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.room_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'left')),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.room_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  icon_url TEXT,
  intro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_rooms_community ON public.rooms(community_id);
CREATE INDEX idx_rooms_status ON public.rooms(approval_status);
CREATE INDEX idx_rooms_creator ON public.rooms(creator_id);
CREATE INDEX idx_memberships_room ON public.room_memberships(room_id);
CREATE INDEX idx_memberships_user ON public.room_memberships(user_id);
CREATE INDEX idx_room_profiles_room ON public.room_profiles(room_id);

CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER room_profiles_updated_at BEFORE UPDATE ON public.room_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved rooms viewable" ON public.rooms FOR SELECT USING (approval_status = 'approved' OR creator_id = auth.uid());
CREATE POLICY "Auth users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update rooms" ON public.rooms FOR UPDATE USING (auth.uid() = creator_id);

ALTER TABLE public.room_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable by room members" ON public.room_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join" ON public.room_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.room_memberships FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.room_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Room profiles viewable" ON public.room_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.room_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.room_profiles FOR UPDATE USING (auth.uid() = user_id);
