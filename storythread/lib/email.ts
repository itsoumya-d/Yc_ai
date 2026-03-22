// ── SendGrid transactional email utility ──────────────────────────────────────
// All emails are sent via SendGrid API (https://api.sendgrid.com/v3/mail/send)

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export async function sendEmail(opts: SendOptions): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[email] SENDGRID_API_KEY not set — skipping send');
    return { ok: true }; // Silently skip in dev
  }

  const fromEmail = opts.from ?? process.env.FROM_EMAIL ?? 'noreply@example.com';
  const fromName = opts.fromName ?? process.env.FROM_NAME ?? 'App';

  const body = {
    personalizations: [{ to: [{ email: opts.to }] }],
    from: { email: fromEmail, name: fromName },
    subject: opts.subject,
    content: [{ type: 'text/html', value: opts.html }],
  };

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
export function baseTemplate(opts: {
  brandName: string;
  brandColor: string;
  preheader: string;
  content: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${opts.brandName}</title>
<style>
  body { margin:0; padding:0; background:#F9FAFB; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; padding:32px 16px; }
  .card { background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
  .header { background:${opts.brandColor}; padding:32px; text-align:center; }
  .header h1 { color:#ffffff; margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px; }
  .body { padding:32px; color:#374151; font-size:15px; line-height:1.6; }
  .body h2 { color:#111827; font-size:20px; margin-top:0; }
  .btn { display:inline-block; background:${opts.brandColor}; color:#ffffff !important; text-decoration:none;
         padding:14px 28px; border-radius:10px; font-weight:700; font-size:15px; margin:20px 0; }
  .divider { border:none; border-top:1px solid #E5E7EB; margin:24px 0; }
  .footer { text-align:center; font-size:12px; color:#9CA3AF; padding:24px 16px; }
  .badge { display:inline-block; background:${opts.brandColor}18; color:${opts.brandColor};
           padding:4px 12px; border-radius:20px; font-size:13px; font-weight:600; }
</style>
</head>
<body>
<span style="display:none;font-size:1px;color:#F9FAFB;">${opts.preheader}</span>
<div class="wrapper">
  <div class="card">
    <div class="header"><h1>${opts.brandName}</h1></div>
    <div class="body">${opts.content}</div>
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} ${opts.brandName}. All rights reserved.<br />
    <a href="{{{unsubscribe_url}}}" style="color:#9CA3AF;">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}
