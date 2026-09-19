export interface EmailPayload {
  to: string;
  subject: string;
  title: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'OBEFF IMS <notifications@family.org>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const fullActionUrl = payload.actionUrl 
    ? (payload.actionUrl.startsWith('http') ? payload.actionUrl : `${appUrl}${payload.actionUrl}`) 
    : undefined;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${payload.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; margin: 0; padding: 24px; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #065f46 100%); padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">OBEFF IMS</h1>
              <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 13px;">Official Family Information Management System</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${payload.title}</h2>
              <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                ${payload.body}
              </div>
              ${
                fullActionUrl && payload.actionText
                  ? `
                <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #10b981;">
                      <a href="${fullActionUrl}" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                        ${payload.actionText}
                      </a>
                    </td>
                  </tr>
                </table>
                `
                  : ''
              }
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                You are receiving this automated email from OBEFF IMS. If you wish to adjust your email notification preferences, visit your Profile settings.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} OBEFF Family Heritage & Lineage Records. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (!apiKey || apiKey.startsWith('re_your_')) {
    // Development fallback: Log email clearly to console
    console.log('\n================== [TRANSACTIONAL EMAIL DISPATCH] ==================');
    console.log(`To: ${payload.to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Title: ${payload.title}`);
    console.log(`Body: ${payload.body.replace(/<[^>]*>/g, '')}`);
    if (fullActionUrl) console.log(`Action Link: ${fullActionUrl}`);
    console.log('====================================================================\n');
    return { success: true, messageId: `mock-msg-${Date.now()}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Failed to send transactional email via Resend:', err);
      return { success: false };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email dispatch error:', error);
    return { success: false };
  }
}
