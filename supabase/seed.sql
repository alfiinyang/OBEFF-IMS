-- ==============================================================================
-- OBEFF IMS - Production Seed Script (Initial Seed Data)
-- Target Platform: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. Create initial test users in auth.users (if not already existing)
-- Password for all 4 seed accounts: ObeffHeritage2026!
-- (Users can change passwords anytime via email reset)

DO $$
DECLARE
    super_admin_id UUID := '11111111-1111-1111-1111-111111111111';
    extra_admin_id  UUID := '22222222-2222-2222-2222-222222222222';
    member_1_id     UUID := '33333333-3333-3333-3333-333333333333';
    member_2_id     UUID := '44444444-4444-4444-4444-444444444444';
    encrypted_pw    TEXT := crypt('ObeffHeritage2026!', gen_salt('bf'));
BEGIN
    -- Super Admin
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        super_admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@obeff.org',
        encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Chief","last_name":"Obeff","phone":"+234 803 000 0001"}',
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Extra Admin
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        extra_admin_id,
        '00000000-0000-0000-0000-000000000000',
        'edet.admin@obeff.org',
        encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Dr. Edet","last_name":"Obeff","phone":"+234 805 555 6666"}',
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Member 1
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        member_1_id,
        '00000000-0000-0000-0000-000000000000',
        'kufre.member@obeff.org',
        encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Kufre","last_name":"Obeff","phone":"+44 7700 900123"}',
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Member 2
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
        member_2_id,
        '00000000-0000-0000-0000-000000000000',
        'maria.member@obeff.org',
        encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"first_name":"Maria","last_name":"Obeff","phone":"+234 802 333 4444"}',
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Populate / Update Profiles with designated Family IDs and Roles
    INSERT INTO public.profiles (
        id, family_id, first_name, last_name, phone, address, date_of_birth, role, status
    ) VALUES 
    (
        super_admin_id,
        'OBEFF-00001',
        'Chief',
        'Obeff',
        '+234 803 000 0001',
        '1 Heritage Palace, Calabar, Cross River State, Nigeria',
        '1950-01-01',
        'Super-Admin',
        'Active'
    ),
    (
        extra_admin_id,
        'OBEFF-00002',
        'Dr. Edet',
        'Obeff',
        '+234 805 555 6666',
        '8 Marina Road, Victoria Island, Lagos, Nigeria',
        '1975-06-18',
        'Admin',
        'Active'
    ),
    (
        member_1_id,
        'OBEFF-00003',
        'Kufre',
        'Obeff',
        '+44 7700 900123',
        '22 Kensington High St, London, UK',
        '1998-11-04',
        'Member',
        'Active'
    ),
    (
        member_2_id,
        'OBEFF-00004',
        'Maria',
        'Obeff',
        '+234 802 333 4444',
        '14 Heritage Boulevard, Calabar, Nigeria',
        '1955-09-25',
        'Member',
        'Active'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        family_id = EXCLUDED.family_id;

    -- 3. Set default notification preferences
    INSERT INTO public.notification_preferences (profile_id, email_announcements, email_new_posts, email_engagements)
    VALUES
        (super_admin_id, TRUE, TRUE, TRUE),
        (extra_admin_id, TRUE, TRUE, TRUE),
        (member_1_id, TRUE, FALSE, TRUE),
        (member_2_id, TRUE, FALSE, TRUE)
    ON CONFLICT (profile_id) DO NOTHING;

    -- 4. Initial Lineage Connections (Family Tree)
    INSERT INTO public.lineage_edges (child_id, parent_id, relation_type, approval_status, approved_by, approved_at)
    VALUES
        (extra_admin_id, super_admin_id, 'Father', 'Approved', super_admin_id, NOW()),
        (extra_admin_id, member_2_id, 'Mother', 'Approved', super_admin_id, NOW()),
        (member_1_id, extra_admin_id, 'Father', 'Approved', super_admin_id, NOW())
    ON CONFLICT (child_id, relation_type) DO NOTHING;

    -- 5. Welcome Announcement
    INSERT INTO public.posts (author_id, content, is_admin_announcement, is_pinned)
    VALUES (
        super_admin_id,
        'Greetings to all descendants of the OBEFF family heritage. The official Information Management System (IMS) is now live. Please review your profiles, verify your lineage connections, and keep in touch.',
        TRUE,
        TRUE
    );

END $$;
