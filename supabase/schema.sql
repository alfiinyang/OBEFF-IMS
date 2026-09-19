-- ==============================================================================
-- OBEFF IMS - Production Database Schema & Security Architecture
-- Target Platform: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SEQUENCES FOR UNIQUE FAMILY ID GENERATION
CREATE SEQUENCE IF NOT EXISTS family_id_seq START WITH 101;

CREATE OR REPLACE FUNCTION generate_family_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'OBEFF-' || LPAD(nextval('family_id_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. CORE TABLES

-- 3.1 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id TEXT UNIQUE NOT NULL DEFAULT generate_family_id(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Member', 'Admin', 'Super-Admin')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Suspended')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 LINEAGE EDGES (Parent-Child Connections)
CREATE TABLE IF NOT EXISTS public.lineage_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('Father', 'Mother')),
    approval_status TEXT NOT NULL DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_child_relation UNIQUE(child_id, relation_type)
);

-- 3.3 POSTS TABLE (Regular Posts & Admin Priority Announcements)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    is_admin_announcement BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 POST REACTIONS / LIKES
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_post_reaction UNIQUE(post_id, user_id)
);

-- 3.6 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Approval', 'System', 'Announcement', 'Engagement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_announcements BOOLEAN NOT NULL DEFAULT TRUE,
    email_new_posts BOOLEAN NOT NULL DEFAULT FALSE,
    email_engagements BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    target_user_id UUID REFERENCES public.profiles(id),
    action_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE & LOOKUP INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON public.profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_lineage_child ON public.lineage_edges(child_id);
CREATE INDEX IF NOT EXISTS idx_lineage_parent ON public.lineage_edges(parent_id);
CREATE INDEX IF NOT EXISTS idx_lineage_status ON public.lineage_edges(approval_status);

CREATE INDEX IF NOT EXISTS idx_posts_pinned_announcement ON public.posts(is_pinned DESC, is_admin_announcement DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_admin_created ON public.audit_logs(admin_id, created_at DESC);

-- 5. ROW-LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineage_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('Admin', 'Super-Admin') AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Authenticated users can view basic member info; admins can view everything
CREATE POLICY "Public profile view for authenticated active users"
ON public.profiles FOR SELECT
TO authenticated
USING (
  status = 'Active' OR id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

-- LINEAGE EDGES POLICIES
CREATE POLICY "View approved lineage or own pending submissions"
ON public.lineage_edges FOR SELECT
TO authenticated
USING (
  approval_status = 'Approved' OR child_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Members can submit their own lineage"
ON public.lineage_edges FOR INSERT
TO authenticated
WITH CHECK (child_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update lineage status"
ON public.lineage_edges FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- POSTS POLICIES
CREATE POLICY "Active members can view posts"
ON public.posts FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'Active')
);

CREATE POLICY "Active members can create posts (Admins can create announcements)"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND
  (is_admin_announcement = FALSE OR public.is_admin())
);

CREATE POLICY "Authors or Admins can update/delete posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors or Admins can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = author_id OR public.is_admin());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users read and update their own notifications"
ON public.notifications FOR ALL
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- NOTIFICATION PREFERENCES POLICIES
CREATE POLICY "Users view and update own preferences"
ON public.notification_preferences FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin());

-- 6. AUTOMATED USER REGISTRATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_family_id TEXT;
BEGIN
    new_family_id := generate_family_id();

    INSERT INTO public.profiles (
        id,
        family_id,
        first_name,
        last_name,
        phone,
        address,
        date_of_birth,
        role,
        status
    ) VALUES (
        NEW.id,
        new_family_id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Family'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Member'),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
        'Member',
        'Pending'
    );

    -- Create default notification preferences
    INSERT INTO public.notification_preferences (profile_id)
    VALUES (NEW.id);

    -- Notify Admins of pending signup
    INSERT INTO public.notifications (
        recipient_id,
        type,
        title,
        message,
        action_url
    )
    SELECT
        p.id,
        'Approval',
        'New Member Registration',
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'A new applicant') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '') || ' registered and is awaiting approval.',
        '/admin/approvals'
    FROM public.profiles p
    WHERE p.role IN ('Admin', 'Super-Admin');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on Supabase Auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. BOOTSTRAP FIRST SUPER-ADMIN HELPER SCRIPT
-- Execute this once in Supabase SQL editor after creating your initial account:
-- UPDATE public.profiles
-- SET role = 'Super-Admin', status = 'Active'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@domain.com');
