import { NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      address,
      date_of_birth,
      registration_request_id,
    } = body;

    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Email, first name, and last name are required.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If Supabase is not configured (offline/dev preview mode)
    if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
      return NextResponse.json({
        success: true,
        localOnly: true,
        message: 'Running in local preview mode without Supabase connection.',
      });
    }

    let userId: string | null = null;

    // 1. If service role key is available, use Admin API (bypasses email confirmation bottlenecks & RLS)
    if (supabaseServiceKey) {
      const adminClient = createAdminSupabaseClient();
      if (adminClient) {
        // Attempt to create user in auth.users
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password: password || 'ObeffHeritage2026!',
          email_confirm: true,
          user_metadata: {
            first_name,
            last_name,
            phone,
            address,
            date_of_birth,
            registration_request_id,
          },
        });

        if (createError) {
          // If user already exists in auth.users, fetch their ID
          if (createError.message.toLowerCase().includes('already registered')) {
            const { data: listData } = await adminClient.auth.admin.listUsers();
            const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
            if (existing) {
              userId = existing.id;
            } else {
              return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
            }
          } else {
            return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
          }
        } else if (userData?.user) {
          userId = userData.user.id;
        }

        // Upsert profile in public.profiles table
        if (userId) {
          const { error: profileError } = await adminClient.from('profiles').upsert(
            {
              id: userId,
              registration_request_id,
              email,
              first_name,
              last_name,
              phone,
              address,
              date_of_birth: date_of_birth ? date_of_birth : null,
              role: 'Member',
              status: 'Pending',
            },
            { onConflict: 'id' }
          );

          if (profileError) {
            console.error('Failed to upsert profile via admin client:', profileError);
          }

          // Insert audit log
          try {
            await adminClient.from('audit_logs').insert({
              trackable_id: registration_request_id,
              tag: 'Account-Registration',
              admin_id: userId,
              admin_name: `${first_name} ${last_name}`,
              target_user_id: userId,
              target_user_name: `${first_name} ${last_name}`,
              action_type: 'REGISTRATION_SUBMITTED',
              metadata: { email, registration_request_id },
            });
          } catch (e) {}

          return NextResponse.json({
            success: true,
            user: { id: userId, email },
          });
        }
      }
    }

    // 2. If only anon key is available, use standard client signup
    if (supabaseAnonKey) {
      const publicClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: authData, error: authError } = await publicClient.auth.signUp({
        email,
        password: password || 'ObeffHeritage2026!',
        options: {
          data: {
            first_name,
            last_name,
            phone,
            address,
            date_of_birth,
            registration_request_id,
          },
        },
      });

      if (authError) {
        return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
      }

      const newUserId = authData?.user?.id;

      // Also attempt direct profile upsert (supported by our updated RLS policy)
      if (newUserId) {
        try {
          await publicClient.from('profiles').upsert(
            {
              id: newUserId,
              registration_request_id,
              email,
              first_name,
              last_name,
              phone,
              address,
              date_of_birth: date_of_birth ? date_of_birth : null,
              role: 'Member',
              status: 'Pending',
            },
            { onConflict: 'id' }
          );
        } catch (err) {
          console.warn('Direct profile insert notice (handled by DB trigger if active):', err);
        }
      }

      return NextResponse.json({
        success: true,
        user: authData?.user,
      });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    console.error('Registration server route exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
