import fs from 'fs';
import path from 'path';
import { UserProfile, LineageEdge, Post, InAppNotification, NotificationPreferences, AuditLog } from '@/types';

export interface DatabaseState {
  profiles: UserProfile[];
  lineage_edges: LineageEdge[];
  posts: Post[];
  notifications: InAppNotification[];
  preferences: Record<string, NotificationPreferences>;
  audit_logs: AuditLog[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'local-db.json');

export function getLocalDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return {
        profiles: [],
        lineage_edges: [],
        posts: [],
        notifications: [],
        preferences: {},
        audit_logs: [],
      };
    }

    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data) as DatabaseState;
  } catch (err) {
    console.error('Failed to read local database:', err);
    return {
      profiles: [],
      lineage_edges: [],
      posts: [],
      notifications: [],
      preferences: {},
      audit_logs: [],
    };
  }
}

export function saveLocalDatabase(state: DatabaseState): boolean {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write local database:', err);
    return false;
  }
}
