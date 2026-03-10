-- Migration: 20260310_tournaments_and_badges
-- Description: Create tables for tournaments, teams, matches and user badges.

-- 1. Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_teams INTEGER DEFAULT 16,
    registration_fee NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tournament Teams Table
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    captain_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tournament Members (Players in a team) Table
CREATE TABLE IF NOT EXISTS public.tournament_members (
    team_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

-- 4. Tournament Matches Table
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_name TEXT NOT NULL, -- e.g., 'Quarterfinals', 'Semifinals', 'Finals', 'Group Stage'
    match_number INTEGER,
    team1_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    score1 INTEGER,
    score2 INTEGER,
    start_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    winner_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_image_url TEXT,
    description TEXT,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for Tournaments
CREATE POLICY "Public tournaments are viewable by everyone." 
ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Super admins can manage all tournaments." 
ON public.tournaments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Venue admins can manage their own venue tournaments." 
ON public.tournaments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.venue_admins 
    WHERE venue_admins.user_id = auth.uid() AND venue_admins.venue_id = tournaments.venue_id
  )
);

-- Policies for Tournament Teams
CREATE POLICY "Tournament teams are viewable by everyone." 
ON public.tournament_teams FOR SELECT USING (true);

CREATE POLICY "Users can create a team if registration is open."
ON public.tournament_teams FOR INSERT
WITH CHECK (
  auth.uid() = captain_id
);

CREATE POLICY "Team captains can update their team."
ON public.tournament_teams FOR UPDATE
USING (auth.uid() = captain_id);

CREATE POLICY "Admins can manage teams."
ON public.tournament_teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.venue_admins va
    JOIN public.tournaments t ON t.id = tournament_teams.tournament_id
    WHERE va.user_id = auth.uid() AND va.venue_id = t.venue_id
  )
);

-- Policies for Tournament Members
CREATE POLICY "Tournament members are viewable by everyone." 
ON public.tournament_members FOR SELECT USING (true);

CREATE POLICY "Team captains can manage their team members."
ON public.tournament_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tournament_teams 
    WHERE tournament_teams.id = tournament_members.team_id AND tournament_teams.captain_id = auth.uid()
  )
);

-- Policies for Tournament Matches
CREATE POLICY "Tournament matches are viewable by everyone." 
ON public.tournament_matches FOR SELECT USING (true);

CREATE POLICY "Admins can manage matches."
ON public.tournament_matches FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.venue_admins va
    JOIN public.tournaments t ON t.id = tournament_matches.tournament_id
    WHERE va.user_id = auth.uid() AND va.venue_id = t.venue_id
  )
);

-- Policies for User Badges
CREATE POLICY "User badges are viewable by everyone." 
ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges."
ON public.user_badges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.venue_admins va
    JOIN public.tournaments t ON t.id = user_badges.tournament_id
    WHERE va.user_id = auth.uid() AND va.venue_id = t.venue_id
  )
);
