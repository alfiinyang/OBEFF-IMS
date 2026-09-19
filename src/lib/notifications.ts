import { InAppNotification, NotificationPreferences, UserProfile } from '@/types';
import { sendEmail } from './email';

interface DispatchParams {
  recipient: UserProfile;
  type: 'Approval' | 'System' | 'Announcement' | 'Engagement';
  title: string;
  message: string;
  actionUrl?: string;
  emailSubject?: string;
  emailBody?: string;
  actionText?: string;
  isMandatory?: boolean;
  preferences?: NotificationPreferences;
}

export async function dispatchNotification(params: DispatchParams): Promise<InAppNotification> {
  const {
    recipient,
    type,
    title,
    message,
    actionUrl,
    emailSubject,
    emailBody,
    actionText,
    isMandatory = false,
    preferences,
  } = params;

  // 1. Create In-App Notification Record
  const newNotification: InAppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recipient_id: recipient.id,
    type,
    title,
    message,
    action_url: actionUrl,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // 2. Determine if Email Delivery is Required
  let shouldSendEmail = false;

  if (isMandatory) {
    // Critical security, admin actions, or admin approval requests CANNOT be disabled
    shouldSendEmail = true;
  } else if (preferences) {
    if (type === 'Announcement' && preferences.email_announcements) {
      shouldSendEmail = true;
    } else if (type === 'System' && preferences.email_new_posts) {
      shouldSendEmail = true;
    } else if (type === 'Engagement' && preferences.email_engagements) {
      shouldSendEmail = true;
    }
  } else {
    // Default fallback rules
    if (type === 'Announcement') shouldSendEmail = true;
    if (type === 'Engagement') shouldSendEmail = true;
  }

  // 3. Dispatch Email if permitted
  if (shouldSendEmail && recipient.email) {
    await sendEmail({
      to: recipient.email,
      subject: emailSubject || title,
      title: title,
      body: emailBody || `<p>${message}</p>`,
      actionText: actionText || 'Open OBEFF IMS',
      actionUrl: actionUrl || '/feed',
    });
  }

  return newNotification;
}

/**
 * Triggered when an Admin activates or modifies a user's account.
 * MUST notify both in-app and by email (PRD mandatory requirement).
 */
export async function notifyUserAccountModified(
  user: UserProfile,
  modificationType: 'ACTIVATED' | 'ROLE_UPDATED' | 'PROFILE_MODIFIED' | 'SUSPENDED',
  details: string,
  adminName: string
) {
  let title = 'Account Update Notice';
  let emailSubject = 'OBEFF IMS - Account Update Notification';

  if (modificationType === 'ACTIVATED') {
    title = 'Account Approved & Activated! 🎉';
    emailSubject = 'Welcome to OBEFF IMS - Your Account is Activated';
  } else if (modificationType === 'SUSPENDED') {
    title = 'Account Status Notification';
    emailSubject = 'OBEFF IMS - Important Account Notice';
  }

  const emailBody = `
    <p>Hello <strong>${user.first_name}</strong>,</p>
    <p>${details}</p>
    <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 18px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Unique Family ID:</strong> ${user.family_id}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Modified by Family Administrator: ${adminName}</p>
    </div>
    <p>If you have any questions regarding this change, please reach out to the family administrator coordinator.</p>
  `;

  return await dispatchNotification({
    recipient: user,
    type: 'System',
    title,
    message: details,
    actionUrl: '/profile',
    emailSubject,
    emailBody,
    actionText: 'View Your Profile',
    isMandatory: true, // Always sends email
  });
}

/**
 * Triggered when a user performs an activity requiring admin approval.
 * MUST notify all admins in-app and by email (PRD mandatory requirement).
 */
export async function notifyAdminsApprovalRequired(
  admins: UserProfile[],
  applicant: UserProfile,
  activityType: 'NEW_REGISTRATION' | 'LINEAGE_SUBMISSION',
  summary: string
) {
  const title = activityType === 'NEW_REGISTRATION'
    ? 'Action Required: New Family Registration'
    : 'Action Required: Lineage Verification';

  const actionUrl = '/admin/approvals';

  const promises = admins.map((admin) => {
    const emailBody = `
      <p>Hello <strong>${admin.first_name}</strong>,</p>
      <p>A family member action requires your review and approval as an Administrator:</p>
      <div style="background-color: #f8fafc; padding: 16px 20px; border-radius: 8px; margin: 18px 0; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${applicant.first_name} ${applicant.last_name}</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Email: ${applicant.email} | ID: ${applicant.family_id}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155;">${summary}</p>
      </div>
      <p>Please log in to the OBEFF IMS Admin Console to verify and approve or reject this request.</p>
    `;

    return dispatchNotification({
      recipient: admin,
      type: 'Approval',
      title,
      message: `${applicant.first_name} ${applicant.last_name}: ${summary}`,
      actionUrl,
      emailSubject: `[Action Required] ${title} - ${applicant.first_name} ${applicant.last_name}`,
      emailBody,
      actionText: 'Open Approvals Queue',
      isMandatory: true, // Always notify admins
    });
  });

  return await Promise.all(promises);
}
