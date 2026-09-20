'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  LineageEdge,
  Post,
  InAppNotification,
  NotificationPreferences,
  AuditLog,
  UserRole,
  UserStatus,
  PostReport,
  PostAppeal,
} from '@/types';
import { generateTrackableId } from './trackable-id';
import {
  INITIAL_PROFILES,
  INITIAL_LINEAGE,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PREFERENCES,
  INITIAL_AUDIT_LOGS,
} from './mock-data';
import { notifyUserAccountModified, notifyAdminsApprovalRequired, dispatchNotification } from './notifications';

interface FamilyContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  profiles: UserProfile[];
  posts: Post[];
  lineageEdges: LineageEdge[];
  notifications: InAppNotification[];
  preferences: NotificationPreferences;
  auditLogs: AuditLog[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  createPost: (content: string, mediaUrl?: string, isAdminAnnouncement?: boolean, isPinned?: boolean) => Promise<void>;
  editPost: (postId: string, newContent: string, newMediaUrl?: string) => void;
  deletePost: (postId: string, reason?: string) => void;
  reportPost: (postId: string, reason: string) => Promise<string>;
  quarantinePost: (postId: string, reason: string) => Promise<void>;
  appealQuarantine: (postId: string, appealMessage: string) => Promise<string>;
  resolveAppeal: (postId: string, decision: 'accepted' | 'rejected', notes?: string) => Promise<void>;
  removePost: (postId: string, reason: string) => Promise<void>;
  restorePost: (postId: string) => void;
  dismissReport: (postId: string, reportId: string) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  submitLineage: (parentId: string, relationType: 'Father' | 'Mother', notes?: string) => Promise<void>;
  approveLineage: (edgeId: string) => Promise<void>;
  rejectLineage: (edgeId: string, notes?: string) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  registerUser: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
  }) => Promise<UserProfile>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; status?: string }>;
  logout: () => void;
  resetLocalDatabase: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // Default to Dr. Edet Obeff (Admin & Family Member)
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES[2]);
  const [profiles, setProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [lineageEdges, setLineageEdges] = useState<LineageEdge[]>(INITIAL_LINEAGE);
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    INITIAL_PREFERENCES[currentUser.id] || {
      profile_id: currentUser.id,
      email_announcements: true,
      email_new_posts: false,
      email_engagements: true,
    }
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Sync preferences when currentUser switches
  useEffect(() => {
    if (INITIAL_PREFERENCES[currentUser.id]) {
      setPreferences(INITIAL_PREFERENCES[currentUser.id]);
    }
  }, [currentUser.id]);

  // Hydrate from localStorage or local database on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionEmail = localStorage.getItem('obeff_session_email');
      const cached = localStorage.getItem('obeff_local_db');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.profiles) {
            setProfiles(parsed.profiles);
            if (sessionEmail) {
              const matched = parsed.profiles.find(
                (p: UserProfile) => p.email.toLowerCase() === sessionEmail.toLowerCase()
              );
              if (matched) setCurrentUser(matched);
            }
          }
          if (parsed.posts) setPosts(parsed.posts);
          if (parsed.lineage_edges) setLineageEdges(parsed.lineage_edges);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.audit_logs) setAuditLogs(parsed.audit_logs);
        } catch (e) {}
      } else {
        fetch('/api/db')
          .then((res) => res.json())
          .then((data) => {
            if (data.profiles && data.profiles.length > 0) {
              setProfiles(data.profiles);
              setPosts(data.posts);
              setLineageEdges(data.lineage_edges);
              setNotifications(data.notifications);
              setAuditLogs(data.audit_logs);
              if (sessionEmail) {
                const matched = data.profiles.find(
                  (p: UserProfile) => p.email.toLowerCase() === sessionEmail.toLowerCase()
                );
                if (matched) setCurrentUser(matched);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Persist to localStorage and local file database on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToPersist = {
        profiles,
        lineage_edges: lineageEdges,
        posts,
        notifications,
        preferences: INITIAL_PREFERENCES,
        audit_logs: auditLogs,
      };
      try {
        localStorage.setItem('obeff_local_db', JSON.stringify(stateToPersist));
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stateToPersist),
        }).catch(() => {});
      } catch (e) {}
    }
  }, [profiles, lineageEdges, posts, notifications, auditLogs]);

  const resetLocalDatabase = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obeff_local_db');
    }
    try {
      await fetch('/api/db', { method: 'DELETE' });
    } catch (e) {}
    setProfiles(INITIAL_PROFILES);
    setPosts(INITIAL_POSTS);
    setLineageEdges(INITIAL_LINEAGE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_PROFILES[2]);
  };

  const userNotifications = [...notifications]
    .filter((n) => n.recipient_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const unreadNotificationCount = userNotifications.filter((n) => !n.is_read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipient_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  const updatePreferences = (updated: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updated,
      updated_at: new Date().toISOString(),
    }));
  };

  const createPost = async (
    content: string,
    mediaUrl?: string,
    isAdminAnnouncement = false,
    isPinned = false
  ) => {
    const isActuallyAdmin = ['Admin', 'Super-Admin'].includes(currentUser.role);
    const isAnnouncement = isActuallyAdmin && isAdminAnnouncement;
    const pinned = isActuallyAdmin && (isPinned || isAnnouncement);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author_id: currentUser.id,
      author: currentUser,
      content,
      media_url: mediaUrl,
      is_admin_announcement: isAnnouncement,
      is_pinned: pinned,
      likes_count: 0,
      comments_count: 0,
      has_liked: false,
      status: 'published',
      created_at: new Date().toISOString(),
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);

    // If official announcement, broadcast to members who enabled announcement emails
    if (isAnnouncement) {
      const activeMembers = profiles.filter(
        (p) => p.status === 'Active' && p.id !== currentUser.id
      );

      for (const member of activeMembers) {
        const memberPrefs = INITIAL_PREFERENCES[member.id] || {
          email_announcements: true,
          email_new_posts: false,
          email_engagements: true,
        };

        const notif = await dispatchNotification({
          recipient: member,
          type: 'Announcement',
          title: 'Official Family Announcement',
          message: `${currentUser.first_name} ${currentUser.last_name}: "${content.substring(0, 80)}..."`,
          actionUrl: '/feed',
          actionText: 'View Announcement',
          emailSubject: `[Official Announcement] ${currentUser.first_name} posted an important update`,
          emailBody: `<p><strong>${currentUser.first_name} ${currentUser.last_name}</strong> published an official family announcement:</p><blockquote style="border-left: 4px solid #10b981; padding-left: 12px; margin: 16px 0; color: #334155;">${content}</blockquote>`,
          preferences: memberPrefs,
        });

        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const editPost = (postId: string, newContent: string, newMediaUrl?: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId && post.author_id === currentUser.id) {
          return {
            ...post,
            content: newContent,
            media_url: newMediaUrl,
            edited_at: new Date().toISOString(),
          };
        }
        return post;
      })
    );
  };

  const deletePost = (postId: string, reason?: string) => {
    const postToDelete = posts.find((p) => p.id === postId);
    const delTrackableId = generateTrackableId('DEL');

    // 1. Permanently delete from all active application records
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    // 2. Immutable audit log tagged Content-Deletion
    const now = new Date().toISOString();
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: delTrackableId,
      tag: 'Content-Deletion',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: postToDelete?.author_id,
      target_user_name: postToDelete ? `${postToDelete.author.first_name} ${postToDelete.author.last_name}` : undefined,
      action_type: 'POST_PERMANENTLY_DELETED',
      metadata: {
        post_id: postId,
        trackable_id: delTrackableId,
        author_name: postToDelete ? `${postToDelete.author.first_name} ${postToDelete.author.last_name}` : 'Unknown',
        content_snippet: postToDelete ? postToDelete.content.substring(0, 120) : '',
        deleted_by_role: currentUser.role,
        reason: reason || (postToDelete && postToDelete.author_id === currentUser.id ? 'Self-deletion by author' : 'Administrative deletion'),
      },
      created_at: now,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // 3. Notify author if deleted administratively by another user
    if (postToDelete && postToDelete.author_id !== currentUser.id) {
      const author = profiles.find((p) => p.id === postToDelete.author_id);
      if (author) {
        dispatchNotification({
          recipient: author,
          type: 'System',
          title: `Post Removed [${delTrackableId}]`,
          message: `Your post was permanently removed by Administrator ${currentUser.first_name}. Tracking ID: ${delTrackableId}. Reason: "${reason || 'Content guidelines violation'}"`,
          actionUrl: '/profile',
          emailSubject: `OBEFF IMS - Content Removal Record [${delTrackableId}]`,
          emailBody: `<p>Dear ${author.first_name},</p><p>Your post has been permanently removed from OBEFF IMS by Administrator ${currentUser.first_name} ${currentUser.last_name}.</p><p><strong>Audit Tracking Reference:</strong> ${delTrackableId}</p><p><strong>Reason:</strong> ${reason || 'Violation of community standards'}</p>`,
        }).then((notif) => {
          setNotifications((prev) => [notif, ...prev]);
        });
      }
    }
  };

  const reportPost = async (postId: string, reason: string): Promise<string> => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return '';

    const reportId = generateTrackableId('CMP');
    const now = new Date().toISOString();

    const report: PostReport = {
      id: reportId,
      post_id: postId,
      reporter_id: currentUser.id,
      reporter_name: `${currentUser.first_name} ${currentUser.last_name}`,
      reason,
      created_at: now,
      status: 'pending',
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              reports: [...(p.reports || []), report],
            }
          : p
      )
    );

    // Audit Log with CMP trackable ID
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: reportId,
      tag: 'Complaint-Report',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: post.author_id,
      target_user_name: `${post.author.first_name} ${post.author.last_name}`,
      action_type: 'POST_REPORTED',
      metadata: { post_id: postId, complaint_id: reportId, reason },
      created_at: now,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Notify all active Admins & Super-Admins in-app & email
    const admins = profiles.filter((p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active');
    for (const admin of admins) {
      const notif = await dispatchNotification({
        recipient: admin,
        type: 'Approval',
        title: `Post Reported [${reportId}]`,
        message: `${currentUser.first_name} filed complaint ${reportId} against post by ${post.author.first_name}: "${reason}"`,
        actionUrl: '/admin/approvals?tab=moderation',
        emailSubject: `[OBEFF IMS Moderation Alert] Complaint ${reportId} filed by ${currentUser.first_name}`,
        emailBody: `<p>A family post has been flagged for administrative review.</p><p><strong>Complaint ID:</strong> ${reportId}</p><p><strong>Reporter:</strong> ${currentUser.first_name} ${currentUser.last_name}</p><p><strong>Reason:</strong> ${reason}</p>`,
      });
      setNotifications((prevNotifs) => [notif, ...prevNotifs]);
    }

    return reportId;
  };

  const quarantinePost = async (postId: string, reason: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const qrnId = generateTrackableId('QRN');
    const now = new Date().toISOString();

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              status: 'quarantined' as const,
              moderation_reason: reason,
              moderated_by: `${currentUser.first_name} ${currentUser.last_name}`,
              moderated_at: now,
              reports: (p.reports || []).map((r) => ({ ...r, status: 'resolved' as const })),
            }
          : p
      )
    );

    // Notify the author in-app and by email
    const author = profiles.find((p) => p.id === post.author_id);
    if (author) {
      const notif = await dispatchNotification({
        recipient: author,
        type: 'System',
        title: `Post Quarantined [${qrnId}]`,
        message: `Your post was quarantined by Administrator ${currentUser.first_name}. Reason: "${reason}". You may appeal this decision from your profile.`,
        actionUrl: '/profile',
        emailSubject: `OBEFF IMS - Notice of Post Quarantine [${qrnId}]`,
        emailBody: `<p>Dear ${author.first_name},</p><p>Your family post has been placed under quarantine by Administrator ${currentUser.first_name} ${currentUser.last_name}.</p><p><strong>Tracking Ref:</strong> ${qrnId}</p><p><strong>Reason:</strong> ${reason}</p><p>Quarantined posts are hidden from the general feed. You may review and submit an appeal from your profile.</p>`,
      });
      setNotifications((prevNotifs) => [notif, ...prevNotifs]);
    }

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: qrnId,
      tag: 'Post-Quarantine',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: post.author_id,
      target_user_name: `${post.author.first_name} ${post.author.last_name}`,
      action_type: 'POST_QUARANTINED',
      metadata: { post_id: postId, qrn_id: qrnId, reason },
      created_at: now,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const appealQuarantine = async (postId: string, appealMessage: string): Promise<string> => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return '';

    const appealId = generateTrackableId('APL');
    const now = new Date().toISOString();

    const newAppeal: PostAppeal = {
      id: appealId,
      post_id: postId,
      appellant_id: currentUser.id,
      appellant_name: `${currentUser.first_name} ${currentUser.last_name}`,
      message: appealMessage,
      created_at: now,
      status: 'pending',
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, appeal: newAppeal } : p))
    );

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: appealId,
      tag: 'Quarantine-Appeal',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: post.author_id,
      target_user_name: `${post.author.first_name} ${post.author.last_name}`,
      action_type: 'QUARANTINE_APPEAL_SUBMITTED',
      metadata: { post_id: postId, appeal_id: appealId, appeal_message: appealMessage },
      created_at: now,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Notify all active Admins & Super-Admins
    const admins = profiles.filter((p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active');
    for (const admin of admins) {
      const notif = await dispatchNotification({
        recipient: admin,
        type: 'Approval',
        title: `Quarantine Appeal Submitted [${appealId}]`,
        message: `${currentUser.first_name} filed an appeal (${appealId}) for their quarantined post: "${appealMessage.substring(0, 60)}..."`,
        actionUrl: '/admin/approvals?tab=moderation',
        emailSubject: `[OBEFF IMS Appeal Alert] Appeal ${appealId} from ${currentUser.first_name}`,
        emailBody: `<p>A member has appealed a post quarantine.</p><p><strong>Appeal ID:</strong> ${appealId}</p><p><strong>Author:</strong> ${currentUser.first_name} ${currentUser.last_name}</p><p><strong>Appeal Statement:</strong> ${appealMessage}</p>`,
      });
      setNotifications((prevNotifs) => [notif, ...prevNotifs]);
    }

    return appealId;
  };

  const resolveAppeal = async (
    postId: string,
    decision: 'accepted' | 'rejected',
    notes?: string
  ) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.appeal) return;

    const now = new Date().toISOString();
    const appealId = post.appeal.id;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedAppeal: PostAppeal = {
            ...p.appeal!,
            status: decision,
            resolved_by: `${currentUser.first_name} ${currentUser.last_name}`,
            resolved_at: now,
            resolution_notes: notes,
          };

          if (decision === 'accepted') {
            return {
              ...p,
              status: 'published' as const,
              moderation_reason: undefined,
              appeal: updatedAppeal,
            };
          } else {
            return {
              ...p,
              appeal: updatedAppeal,
            };
          }
        }
        return p;
      })
    );

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: appealId,
      tag: 'Appeal-Resolution',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: post.author_id,
      target_user_name: `${post.author.first_name} ${post.author.last_name}`,
      action_type: decision === 'accepted' ? 'APPEAL_ACCEPTED' : 'APPEAL_REJECTED',
      metadata: {
        post_id: postId,
        appeal_id: appealId,
        decision,
        resolution_notes: notes,
      },
      created_at: now,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Notify Author
    const author = profiles.find((p) => p.id === post.author_id);
    if (author) {
      const notif = await dispatchNotification({
        recipient: author,
        type: 'System',
        title: decision === 'accepted' ? `Appeal Accepted! Post Restored [${appealId}] 🎉` : `Appeal Decision [${appealId}]`,
        message:
          decision === 'accepted'
            ? `Your appeal (${appealId}) was approved by ${currentUser.first_name}. Your post has been restored to the feed.`
            : `Your appeal (${appealId}) was reviewed and rejected: ${notes || 'Quarantine remains in effect.'}`,
        actionUrl: '/profile',
        emailSubject: `OBEFF IMS - Appeal Decision [${appealId}]`,
        emailBody: `<p>Dear ${author.first_name},</p><p>Administrator ${currentUser.first_name} ${currentUser.last_name} has reviewed your appeal <strong>${appealId}</strong>.</p><p><strong>Decision:</strong> ${decision === 'accepted' ? 'Approved & Post Restored' : 'Rejected'}</p><p><strong>Admin Notes:</strong> ${notes || 'N/A'}</p>`,
      });
      setNotifications((prevNotifs) => [notif, ...prevNotifs]);
    }
  };

  const removePost = async (postId: string, reason: string) => {
    // Calling deletePost to perform hard permanent deletion and audit log
    deletePost(postId, reason);
  };

  const restorePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              status: 'published' as const,
              moderation_reason: undefined,
              moderated_by: undefined,
              moderated_at: undefined,
            }
          : p
      )
    );
  };

  const dismissReport = (postId: string, reportId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              reports: (p.reports || []).map((r) =>
                r.id === reportId ? { ...r, status: 'dismissed' as const } : r
              ),
            }
          : p
      )
    );
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentlyLiked = post.has_liked;
          const newLikesCount = currentlyLiked ? post.likes_count - 1 : post.likes_count + 1;

          // If liking someone else's post, notify author in-app and email according to preferences
          if (!currentlyLiked && post.author_id !== currentUser.id) {
            const author = profiles.find((p) => p.id === post.author_id);
            if (author) {
              const authorPrefs = INITIAL_PREFERENCES[author.id];
              dispatchNotification({
                recipient: author,
                type: 'Engagement',
                title: 'New Like on Your Post',
                message: `${currentUser.first_name} liked your post.`,
                actionUrl: '/feed',
                emailSubject: `OBEFF IMS - ${currentUser.first_name} liked your post`,
                emailBody: `<p>${currentUser.first_name} ${currentUser.last_name} liked your recent family post.</p>`,
                preferences: authorPrefs,
              }).then((notif) => {
                setNotifications((nPrev) => [notif, ...nPrev]);
              });
            }
          }

          return {
            ...post,
            has_liked: !currentlyLiked,
            likes_count: newLikesCount,
          };
        }
        return post;
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment = {
      id: `c-${Date.now()}`,
      post_id: postId,
      author_id: currentUser.id,
      author: currentUser,
      content,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments_count: p.comments_count + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );

    // Notify author if not commenting on own post
    if (post.author_id !== currentUser.id) {
      const author = profiles.find((pr) => pr.id === post.author_id);
      if (author) {
        const authorPrefs = INITIAL_PREFERENCES[author.id];
        dispatchNotification({
          recipient: author,
          type: 'Engagement',
          title: 'New Comment on Your Post',
          message: `${currentUser.first_name} commented: "${content.substring(0, 50)}..."`,
          actionUrl: '/feed',
          actionText: 'View Comment',
          emailSubject: `OBEFF IMS - ${currentUser.first_name} commented on your post`,
          emailBody: `<p>${currentUser.first_name} ${currentUser.last_name} commented:</p><blockquote style="border-left: 3px solid #cbd5e1; padding-left: 10px; color: #475569;">"${content}"</blockquote>`,
          preferences: authorPrefs,
        }).then((notif) => {
          setNotifications((nPrev) => [notif, ...nPrev]);
        });
      }
    }
  };

  const submitLineage = async (parentId: string, relationType: 'Father' | 'Mother', notes?: string) => {
    const parent = profiles.find((p) => p.id === parentId);
    const linId = generateTrackableId('LIN');
    const newEdge: LineageEdge = {
      id: `edge-${Date.now()}`,
      request_id: linId,
      child_id: currentUser.id,
      parent_id: parentId,
      relation_type: relationType,
      approval_status: 'Pending',
      notes,
      created_at: new Date().toISOString(),
      parent,
      child: currentUser,
    };

    setLineageEdges((prev) => [newEdge, ...prev]);

    // Audit Log for Lineage Request
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: linId,
      tag: 'Lineage-Request',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: parentId,
      target_user_name: parent ? `${parent.first_name} ${parent.last_name}` : undefined,
      action_type: 'LINEAGE_SUBMITTED',
      metadata: { request_id: linId, relation_type: relationType, notes },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Mandatory notification to all admins (in-app and email)
    const admins = profiles.filter((p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active');
    const notifs = await notifyAdminsApprovalRequired(
      admins,
      currentUser,
      'LINEAGE_SUBMISSION',
      `Submitted ${relationType} connection [${linId}] to ${parent ? parent.first_name + ' ' + parent.last_name : 'Parent'}.`
    );

    setNotifications((prev) => [...notifs, ...prev]);
  };

  const approveLineage = async (edgeId: string) => {
    const edge = lineageEdges.find((e) => e.id === edgeId);
    if (!edge) return;

    setLineageEdges((prev) =>
      prev.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              approval_status: 'Approved',
              approved_by: currentUser.id,
              approved_at: new Date().toISOString(),
            }
          : e
      )
    );

    // Notify child user in-app and by email
    const child = profiles.find((p) => p.id === edge.child_id);
    if (child) {
      const notif = await dispatchNotification({
        recipient: child,
        type: 'System',
        title: 'Lineage Approved! 🌳',
        message: `Your ${edge.relation_type} link has been verified and added to the official Family Tree by ${currentUser.first_name}.`,
        actionUrl: '/tree',
        actionText: 'Explore Family Tree',
        emailSubject: 'OBEFF IMS - Lineage Link Approved',
        emailBody: `<p>Good news! Administrator ${currentUser.first_name} ${currentUser.last_name} has verified and approved your lineage connection. Your branch is now active on the Family Tree.</p>`,
        isMandatory: true,
      });

      setNotifications((prev) => [notif, ...prev]);
    }

    // Log Audit with LIN trackable ID
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: edge.request_id || generateTrackableId('LIN'),
      tag: 'Lineage-Approval',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: edge.child_id,
      target_user_name: child ? `${child.first_name} ${child.last_name}` : 'Member',
      action_type: 'LINEAGE_APPROVED',
      metadata: { edge_id: edgeId, request_id: edge.request_id, relation: edge.relation_type },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const rejectLineage = async (edgeId: string, notes = 'Information could not be verified.') => {
    const edge = lineageEdges.find((e) => e.id === edgeId);
    if (!edge) return;

    setLineageEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, approval_status: 'Rejected', notes } : e))
    );

    const child = profiles.find((p) => p.id === edge.child_id);
    if (child) {
      const notif = await dispatchNotification({
        recipient: child,
        type: 'System',
        title: 'Lineage Verification Notice',
        message: `Your lineage proposal could not be approved: ${notes}`,
        actionUrl: '/lineage',
        actionText: 'Review Lineage Tab',
        emailSubject: 'OBEFF IMS - Lineage Update Notice',
        emailBody: `<p>Administrator ${currentUser.first_name} reviewed your lineage submission with the following note:</p><p style="color: #b91c1c; font-style: italic;">"${notes}"</p><p>Please visit your Lineage tab to adjust your submission.</p>`,
        isMandatory: true,
      });
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const approveUser = async (userId: string) => {
    const user = profiles.find((p) => p.id === userId);
    if (!user) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status: 'Active' } : p))
    );

    // Mandatory In-app and Email notification to the approved user
    const notif = await notifyUserAccountModified(
      user,
      'ACTIVATED',
      `Welcome to OBEFF IMS! Your registration has been verified and activated by ${currentUser.first_name} ${currentUser.last_name}. Your permanent Family ID is ${user.family_id}.`,
      `${currentUser.first_name} ${currentUser.last_name}`
    );

    setNotifications((prev) => [notif, ...prev]);

    // Audit Log with REG trackable ID
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: user.registration_request_id || generateTrackableId('REG'),
      tag: 'Account-Activation',
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: user.id,
      target_user_name: `${user.first_name} ${user.last_name}`,
      action_type: 'ACCOUNT_ACTIVATED',
      metadata: { family_id: user.family_id, registration_request_id: user.registration_request_id },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const rejectUser = async (userId: string, reason = 'Registration details could not be authenticated.') => {
    const user = profiles.find((p) => p.id === userId);
    if (!user) return;

    setProfiles((prev) => prev.filter((p) => p.id !== userId));

    await dispatchNotification({
      recipient: user,
      type: 'System',
      title: 'Account Application Notice',
      message: `Your registration request could not be processed: ${reason}`,
      actionUrl: '/login',
      emailSubject: 'OBEFF IMS - Application Status',
      emailBody: `<p>Dear ${user.first_name},</p><p>Your request to join OBEFF IMS was reviewed. Note: ${reason}</p>`,
      isMandatory: true,
    });
  };

  const registerUser = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
  }): Promise<UserProfile> => {
    const newFamilyId = `OBEFF-00${profiles.length + 101}`;
    const regTrackableId = generateTrackableId('REG');
    const newApplicant: UserProfile = {
      id: `user-${Date.now()}`,
      registration_request_id: regTrackableId,
      family_id: newFamilyId,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      address: userData.address,
      date_of_birth: userData.date_of_birth,
      role: 'Member',
      status: 'Pending',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date().toISOString(),
    };

    const updatedProfiles = [...profiles, newApplicant];
    setProfiles(updatedProfiles);

    // Audit Log for new registration
    const regLog: AuditLog = {
      id: `log-${Date.now()}`,
      trackable_id: regTrackableId,
      tag: 'Account-Registration',
      admin_id: newApplicant.id,
      admin_name: `${newApplicant.first_name} ${newApplicant.last_name}`,
      target_user_id: newApplicant.id,
      target_user_name: `${newApplicant.first_name} ${newApplicant.last_name}`,
      action_type: 'REGISTRATION_SUBMITTED',
      metadata: { registration_request_id: regTrackableId, email: newApplicant.email },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [regLog, ...prev]);

    // Notify all active Admins in-app and by email
    const activeAdmins = updatedProfiles.filter(
      (p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active'
    );
    const adminNotifs = await notifyAdminsApprovalRequired(
      activeAdmins,
      newApplicant,
      'NEW_REGISTRATION',
      `New family member registration [${regTrackableId}] submitted for ${newApplicant.first_name} ${newApplicant.last_name} (${newApplicant.phone}).`
    );

    const updatedNotifications = [...notifications, ...adminNotifs];
    setNotifications(updatedNotifications);

    // Sync to localStorage and /api/db immediately
    if (typeof window !== 'undefined') {
      const stateToPersist = {
        profiles: updatedProfiles,
        lineage_edges: lineageEdges,
        posts,
        notifications: updatedNotifications,
        preferences: INITIAL_PREFERENCES,
        audit_logs: auditLogs,
      };
      localStorage.setItem('obeff_local_db', JSON.stringify(stateToPersist));
      try {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stateToPersist),
        });
      } catch (e) {
        console.error('Failed to sync to local DB API:', e);
      }
    }

    return newApplicant;
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const user = profiles.find((p) => p.id === userId);
    if (!user) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );

    // Mandatory Notification
    const notif = await notifyUserAccountModified(
      user,
      'ROLE_UPDATED',
      `Your account role has been updated to "${newRole}" by Administrator ${currentUser.first_name}.`,
      `${currentUser.first_name} ${currentUser.last_name}`
    );
    setNotifications((prev) => [notif, ...prev]);

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: user.id,
      target_user_name: `${user.first_name} ${user.last_name}`,
      action_type: `ROLE_UPDATED_TO_${newRole.toUpperCase()}`,
      metadata: { new_role: newRole },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const updateUserStatus = async (userId: string, newStatus: UserStatus) => {
    const user = profiles.find((p) => p.id === userId);
    if (!user) return;

    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status: newStatus } : p))
    );

    // Mandatory Notification
    const notif = await notifyUserAccountModified(
      user,
      newStatus === 'Active' ? 'ACTIVATED' : 'SUSPENDED',
      `Your account status has been changed to "${newStatus}" by Administrator ${currentUser.first_name}.`,
      `${currentUser.first_name} ${currentUser.last_name}`
    );
    setNotifications((prev) => [notif, ...prev]);

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: user.id,
      target_user_name: `${user.first_name} ${user.last_name}`,
      action_type: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
      metadata: { new_status: newStatus },
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, ...data } : p))
    );
  };

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; status?: string }> => {
    const user = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'No account found with this email address. Please register.' };
    }
    if (user.status === 'Pending') {
      return { success: false, status: 'Pending', error: 'Your account is under review by a family administrator.' };
    }
    if (user.status === 'Suspended') {
      return { success: false, status: 'Suspended', error: 'This account has been suspended by a family administrator.' };
    }

    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('obeff_session_email', user.email);
    }
    return { success: true };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obeff_session_email');
    }
    if (profiles.length > 0) {
      // Set to first active member
      const active = profiles.find((p) => p.status === 'Active') || profiles[0];
      setCurrentUser(active);
    }
  };

  return (
    <FamilyContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        profiles,
        posts,
        lineageEdges,
        notifications,
        preferences,
        auditLogs,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updatePreferences,
        createPost,
        editPost,
        deletePost,
        reportPost,
        quarantinePost,
        appealQuarantine,
        resolveAppeal,
        removePost,
        restorePost,
        dismissReport,
        toggleLikePost,
        addComment,
        submitLineage,
        approveLineage,
        rejectLineage,
        approveUser,
        rejectUser,
        registerUser,
        updateUserRole,
        updateUserStatus,
        updateProfile,
        login,
        logout,
        resetLocalDatabase,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
