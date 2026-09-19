import { NextResponse } from 'next/server';
import { getLocalDatabase, saveLocalDatabase } from '@/lib/local-db';
import {
  INITIAL_PROFILES,
  INITIAL_LINEAGE,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PREFERENCES,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mock-data';

export async function GET() {
  const db = getLocalDatabase();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const updatedState = await request.json();
    const success = saveLocalDatabase(updatedState);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  // Factory reset to initial seed data
  const seedState = {
    profiles: INITIAL_PROFILES,
    lineage_edges: INITIAL_LINEAGE,
    posts: INITIAL_POSTS,
    notifications: INITIAL_NOTIFICATIONS,
    preferences: INITIAL_PREFERENCES,
    audit_logs: INITIAL_AUDIT_LOGS,
  };

  const success = saveLocalDatabase(seedState);
  return NextResponse.json({ success, message: 'Database reset to initial seed data' });
}
