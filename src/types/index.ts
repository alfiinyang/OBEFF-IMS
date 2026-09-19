export type UserRole = 'Member' | 'Admin' | 'Super-Admin';
export type UserStatus = 'Pending' | 'Active' | 'Suspended';
export type RelationType = 'Father' | 'Mother';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type NotificationType = 'Approval' | 'System' | 'Announcement' | 'Engagement';

export interface UserProfile {
  id: string;
  family_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface LineageEdge {
  id: string;
  child_id: string;
  parent_id: string;
  relation_type: RelationType;
  approval_status: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  parent?: UserProfile;
  child?: UserProfile;
}

export interface Post {
  id: string;
  author_id: string;
  author: UserProfile;
  content: string;
  media_url?: string;
  is_admin_announcement: boolean;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  has_liked?: boolean;
  created_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: UserProfile;
  content: string;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  profile_id: string;
  email_announcements: boolean;
  email_new_posts: boolean;
  email_engagements: boolean;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  target_user_id?: string;
  target_user_name?: string;
  action_type: string;
  metadata?: Record<string, any>;
  created_at: string;
}
