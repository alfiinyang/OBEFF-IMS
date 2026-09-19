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
} from '@/types';
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
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  submitLineage: (parentId: string, relationType: 'Father' | 'Mother', notes?: string) => Promise<void>;
  approveLineage: (edgeId: string) => Promise<void>;
  rejectLineage: (edgeId: string, notes?: string) => Promise<void>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  switchDemoRole: (role: UserRole) => void;
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
      const cached = localStorage.getItem('obeff_local_db');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.profiles) setProfiles(parsed.profiles);
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

  const userNotifications = notifications.filter((n) => n.recipient_id === currentUser.id);
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
    const newEdge: LineageEdge = {
      id: `edge-${Date.now()}`,
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

    // Mandatory notification to all admins (in-app and email)
    const admins = profiles.filter((p) => ['Admin', 'Super-Admin'].includes(p.role) && p.status === 'Active');
    const notifs = await notifyAdminsApprovalRequired(
      admins,
      currentUser,
      'LINEAGE_SUBMISSION',
      `Submitted ${relationType} connection to ${parent ? parent.first_name + ' ' + parent.last_name : 'Parent'}.`
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

    // Log Audit
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: edge.child_id,
      target_user_name: child ? `${child.first_name} ${child.last_name}` : 'Member',
      action_type: 'LINEAGE_APPROVED',
      metadata: { edge_id: edgeId, relation: edge.relation_type },
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

    // Audit Log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: currentUser.id,
      admin_name: `${currentUser.first_name} ${currentUser.last_name}`,
      target_user_id: user.id,
      target_user_name: `${user.first_name} ${user.last_name}`,
      action_type: 'ACCOUNT_ACTIVATED',
      metadata: { family_id: user.family_id },
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

  const switchDemoRole = (role: UserRole) => {
    const target = profiles.find((p) => p.role === role && p.status === 'Active');
    if (target) {
      setCurrentUser(target);
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
        toggleLikePost,
        addComment,
        submitLineage,
        approveLineage,
        rejectLineage,
        approveUser,
        rejectUser,
        updateUserRole,
        updateUserStatus,
        updateProfile,
        switchDemoRole,
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
