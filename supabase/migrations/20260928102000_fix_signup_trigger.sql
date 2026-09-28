-- ==============================================================================
-- Migration: 20260928102000_fix_signup_trigger.sql
-- Description: Fix signup trigger schema search_path, admin_id constraint, and exception handling
-- ==============================================================================

-- 1. Make admin_id nullable in public.audit_logs for self-registration events
ALTER TABLE public.audit_logs ALTER COLUMN admin_id DROP NOT NULL;

-- 2. Ensure generate_family_id is SECURITY DEFINER with fixed search_path and collision handling
CREATE OR REPLACE FUNCTION public.generate_family_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    candidate_id TEXT;
BEGIN
    LOOP
        candidate_id := 'OBEFF-' || LPAD(nextval('public.family_id_seq')::TEXT, 5, '0');
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE family_id = candidate_id) THEN
            RETURN candidate_id;
        END IF;
    END LOOP;
END;
$$;

-- 3. Robust, fault-tolerant handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_family_id TEXT;
    reg_id TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    user_address TEXT;
    parsed_dob DATE;
BEGIN
    -- Resolve family ID and tracking registration ID
    new_family_id := public.generate_family_id();
    reg_id := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'registration_request_id'), ''),
        'REG-' || LPAD((FLOOR(RANDOM() * 90000) + 10000)::TEXT, 5, '0')
    );

    user_first_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''), 'Family');
    user_last_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''), 'Member');
    user_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
    user_address := NULLIF(TRIM(NEW.raw_user_meta_data->>'address'), '');

    -- Safe date parsing
    BEGIN
        IF NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data->>'date_of_birth' <> '' THEN
            parsed_dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        parsed_dob := NULL;
    END;

    -- 1. Insert Profile (Core requirement)
    INSERT INTO public.profiles (
        id,
        family_id,
        registration_request_id,
        email,
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
        reg_id,
        NEW.email,
        user_first_name,
        user_last_name,
        user_phone,
        user_address,
        parsed_dob,
        'Member',
        'Pending'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        date_of_birth = EXCLUDED.date_of_birth;

    -- 2. Non-blocking auxiliary insertions: notification preferences
    BEGIN
        INSERT INTO public.notification_preferences (profile_id)
        VALUES (NEW.id)
        ON CONFLICT (profile_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'notification_preferences insert shielded: %', SQLERRM;
    END;

    -- 3. Non-blocking auxiliary insertions: registration audit log
    BEGIN
        INSERT INTO public.audit_logs (
            trackable_id,
            tag,
            admin_id,
            admin_name,
            target_user_id,
            target_user_name,
            action_type,
            metadata
        ) VALUES (
            reg_id,
            'Account-Registration',
            NULL,
            'System',
            NEW.id,
            user_first_name || ' ' || user_last_name,
            'REGISTRATION_SUBMITTED',
            jsonb_build_object('email', NEW.email, 'registration_request_id', reg_id)
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'audit_logs insert shielded: %', SQLERRM;
    END;

    -- 4. Non-blocking auxiliary insertions: admin pending notification
    BEGIN
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
            user_first_name || ' ' || user_last_name || ' registered and is awaiting approval.',
            '/admin/approvals'
        FROM public.profiles p
        WHERE p.role IN ('Admin', 'Super-Admin');
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'notifications insert shielded: %', SQLERRM;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback safety shield: ensures auth.users creation never throws "Database error creating new user"
    RAISE WARNING 'handle_new_user critical error caught and shielded: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Grant execute permissions explicitly
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.generate_family_id() TO postgres, anon, authenticated, service_role, supabase_auth_admin;
