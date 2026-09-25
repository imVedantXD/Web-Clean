import nodemailer from "nodemailer";

/**
 * Email delivery helper for Sahayata Web.
 * Configure via environment variables:
 *   SMTP_URL="smtps://user:pass@smtp.host:465"
 * — or —
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * 
 * If not configured, the app runs in local simulation mode where emails are logged to console.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_URL || process.env.SMTP_HOST);
}

function transporter() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

function getFromAddress(): string {
  return process.env.SMTP_FROM ?? "Sahayata Web <no-reply@sahayataweb.in>";
}

async function sendEmailSafely(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const from = getFromAddress();
  if (!isEmailConfigured()) {
    console.log(`\n================== [EMAIL SIMULATION] ==================`);
    console.log(`To: ${options.to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Preview: ${options.text.substring(0, 140)}...`);
    console.log(`========================================================\n`);
    return true;
  }

  try {
    await transporter().sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (err) {
    console.error("Failed to deliver email:", err);
    return false;
  }
}

/**
 * 1. Email Verification Code
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
): Promise<boolean> {
  const subject = `${code} is your Sahayata Web verification code`;
  const text = `Namaste ${name},\n\nYour Sahayata Web verification code is ${code}. It expires in 10 minutes.\n\nIf you did not create an account, you can ignore this email.\n\n— Team Sahayata`;
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#05070d;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070d;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#0b1120;border:1px solid rgba(16,185,129,.3);border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#14b8a6);padding:28px 32px;">
              <p style="margin:0;color:#ecfdf5;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Sahayata Web</p>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:12px;font-weight:500;">Seva. Solidarity. Digital India.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#e2e8f0;font-size:16px;font-weight:600;">Namaste ${name},</p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                You're one step away from joining India's movement of everyday heroes.
                Enter this verification code to activate your account:
              </p>
              <div style="background:rgba(16,185,129,.08);border:1px dashed rgba(16,185,129,.5);border-radius:14px;padding:22px;text-align:center;">
                <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#34d399;">${code}</span>
              </div>
              <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
                This code expires in 10 minutes. If you did not sign up for Sahayata Web,
                please ignore this email — no account will be created.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#070c18;border-top:1px solid rgba(148,163,184,.12);">
              <p style="margin:0;color:#475569;font-size:11px;text-align:center;">Crafted with care by Vedant Pandey · Class IX · Sahayata Web</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmailSafely({ to, subject, text, html });
}

/**
 * 2. Newsletter Subscription Welcome Email
 */
export async function sendNewsletterWelcomeEmail(to: string): Promise<boolean> {
  const subject = `Welcome to Sahayata Web Digest! 🌟 You're Subscribed`;
  const text = `Namaste!\n\nThank you for subscribing to Sahayata Web's Weekly Seva Digest.\n\nYou will now receive weekly highlights of live community campaigns, volunteer drives, and impactful stories near you across India.\n\nExplore active campaigns today: https://sahayataweb.in/campaigns\n\n— Team Sahayata`;
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#05070d;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070d;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#0b1120;border:1px solid rgba(16,185,129,.3);border-radius:22px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.7);">
          <tr>
            <td style="background:linear-gradient(135deg,#047857,#0f766e,#d97706);padding:32px 36px;">
              <span style="display:inline-block;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:4px 12px;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Community Digest</span>
              <h1 style="margin:12px 0 4px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.02em;">Welcome to Sahayata Web! 🌟</h1>
              <p style="margin:0;color:#e6fffa;font-size:13px;font-weight:500;">Seva, made simple · Digital India</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 16px;color:#f1f5f9;font-size:16px;font-weight:600;">Namaste & Welcome,</p>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.7;">
                Thank you for subscribing to our <strong style="color:#34d399;">Weekly Seva Digest</strong>. You are now connected with a growing network of everyday heroes driving change across neighbourhoods in Bharat.
              </p>

              <!-- Feature Cards -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:14px;padding:16px 20px;margin-bottom:12px;">
                    <p style="margin:0;color:#34d399;font-size:13px;font-weight:700;">📍 Hyperlocal Campaigns</p>
                    <p style="margin:4px 0 0;color:#cbd5e1;font-size:12px;line-height:1.5;">Get notified about food drives, senior care, and cleanups in your city.</p>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="background:rgba(20,184,166,0.06);border:1px solid rgba(20,184,166,0.2);border-radius:14px;padding:16px 20px;">
                    <p style="margin:0;color:#2dd4bf;font-size:13px;font-weight:700;">🤝 Zero Spam Promise</p>
                    <p style="margin:4px 0 0;color:#cbd5e1;font-size:12px;line-height:1.5;">Only high-impact updates, once a week. Your inbox stays clean.</p>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin:32px 0 24px;">
                <a href="https://sahayataweb.in/campaigns" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#022c22;font-size:14px;font-weight:800;padding:14px 28px;border-radius:12px;text-decoration:none;box-shadow:0 8px 24px rgba(16,185,129,0.4);">
                  Explore Active Campaigns →
                </a>
              </div>

              <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;text-align:center;">
                If you ever wish to unsubscribe, you can do so anytime from any digest email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;background:#070c18;border-top:1px solid rgba(148,163,184,.12);text-align:center;">
              <p style="margin:0;color:#64748b;font-size:11px;">Designed & engineered with ❤️ by <strong>Vedant Pandey (Class IX)</strong> · Sahayata Web</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmailSafely({ to, subject, text, html });
}

/**
 * 3. Contact Form Submission Confirmation Email
 */
export async function sendContactConfirmationEmail(
  to: string,
  name: string,
  subjectText: string
): Promise<boolean> {
  const subject = `Message Received: "${subjectText}" — Sahayata Web`;
  const text = `Namaste ${name},\n\nWe have received your message regarding "${subjectText}". Our team reads every submission carefully and will get back to you within 1-2 business days.\n\nThank you for reaching out!\n\n— Team Sahayata`;
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#05070d;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070d;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#0b1120;border:1px solid rgba(16,185,129,.3);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#0f766e);padding:28px 32px;">
              <p style="margin:0;color:#ecfdf5;font-size:22px;font-weight:800;">Sahayata Web Support</p>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:12px;">We've got your message!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;color:#e2e8f0;font-size:16px;font-weight:600;">Namaste ${name},</p>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Thank you for reaching out to us. We have successfully logged your inquiry regarding:
              </p>
              <div style="background:rgba(255,255,255,0.04);border-left:4px solid #34d399;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#f1f5f9;font-size:14px;font-weight:700;">"${subjectText}"</p>
              </div>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Our team reviews every message and will reply to you within 24 to 48 hours.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#070c18;border-top:1px solid rgba(148,163,184,.12);text-align:center;">
              <p style="margin:0;color:#475569;font-size:11px;">Vedant Pandey · Sahayata Web Platform</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmailSafely({ to, subject, text, html });
}

/**
 * 4. Campaign Joined Confirmation Email
 */
export async function sendCampaignJoinedEmail(
  to: string,
  name: string,
  campaignTitle: string,
  location: string,
  city: string,
  startAt: Date
): Promise<boolean> {
  const formattedDate = new Date(startAt).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `You're registered for "${campaignTitle}"! 🤝`;
  const text = `Namaste ${name},\n\nYou have successfully joined the drive "${campaignTitle}"!\n\nDetails:\n- Date & Time: ${formattedDate}\n- Location: ${location}, ${city}\n\nThank you for volunteering and stepping up for your community.\n\n— Team Sahayata`;
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#05070d;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070d;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#0b1120;border:1px solid rgba(16,185,129,.3);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#10b981);padding:28px 32px;">
              <span style="display:inline-block;background:rgba(0,0,0,0.2);border-radius:12px;padding:3px 10px;color:#ecfdf5;font-size:11px;font-weight:700;text-transform:uppercase;">Drive Registration Confirmed</span>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:800;">${campaignTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;color:#e2e8f0;font-size:16px;font-weight:600;">Namaste ${name},</p>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Thank you for signing up to volunteer! Your presence makes a massive difference. Here are your drive details:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:18px;margin-bottom:24px;">
                <tr>
                  <td style="color:#34d399;font-size:12px;font-weight:700;text-transform:uppercase;padding-bottom:4px;">📅 Date & Time</td>
                </tr>
                <tr>
                  <td style="color:#ffffff;font-size:14px;font-weight:600;padding-bottom:14px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color:#34d399;font-size:12px;font-weight:700;text-transform:uppercase;padding-bottom:4px;">📍 Venue</td>
                </tr>
                <tr>
                  <td style="color:#ffffff;font-size:14px;font-weight:600;">${location}, ${city}</td>
                </tr>
              </table>

              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                You can manage your campaign signups and view drive updates anytime from your <a href="https://sahayataweb.in/dashboard" style="color:#34d399;text-decoration:underline;">Sahayata Dashboard</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#070c18;border-top:1px solid rgba(148,163,184,.12);text-align:center;">
              <p style="margin:0;color:#475569;font-size:11px;">Sahayata Web · Powered by Digital India</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmailSafely({ to, subject, text, html });
}

/**
 * 5. Volunteer Profile Registration Welcome Email
 */
export async function sendVolunteerWelcomeEmail(
  to: string,
  name: string,
  city: string
): Promise<boolean> {
  const subject = `Namaste ${name}! Welcome to Sahayata Volunteer Network 🇮🇳`;
  const text = `Namaste ${name},\n\nWelcome to the official Sahayata Volunteer Network in ${city}!\n\nYour volunteer profile is now active. You will receive notifications when new campaigns are launched in ${city}.\n\nView campaigns: https://sahayataweb.in/campaigns\n\n— Team Sahayata`;
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#05070d;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070d;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#0b1120;border:1px solid rgba(16,185,129,.3);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#14b8a6);padding:28px 32px;">
              <p style="margin:0;color:#ecfdf5;font-size:22px;font-weight:800;">Volunteer Profile Activated 🇮🇳</p>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:12px;">Serving ${city} with pride</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;color:#e2e8f0;font-size:16px;font-weight:600;">Namaste ${name},</p>
              <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Congratulations! You are officially registered as a Sahayata Volunteer in <strong style="color:#34d399;">${city}</strong>.
              </p>
              <div style="background:rgba(16,185,129,0.08);border-left:4px solid #34d399;border-radius:6px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;color:#e2e8f0;font-size:13px;line-height:1.5;">
                  Whenever organizers host drives for senior care, food relief, cleanups, or education in ${city}, you'll be among the first to know.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#070c18;border-top:1px solid rgba(148,163,184,.12);text-align:center;">
              <p style="margin:0;color:#475569;font-size:11px;">Vedant Pandey · Sahayata Web Platform</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendEmailSafely({ to, subject, text, html });
}
