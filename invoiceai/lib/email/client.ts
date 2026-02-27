import sgMail from '@sendgrid/mail';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let initialized = false;

function initSendGrid() {
  if (!initialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    initialized = true;
  }
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  initSendGrid();

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return false;
  }

  const fromEmail = options.from ?? process.env.SENDGRID_FROM_EMAIL ?? 'noreply@invoiceai.app';

  try {
    await sgMail.send({
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

export function buildInvoiceEmailHtml(params: {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  portalUrl: string;
  personalMessage?: string;
  businessName?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; font-size: 20px; margin: 0;">${escapeHtml(params.businessName ?? 'InvoiceAI')}</h1>
      </div>

      <p style="color: #333; font-size: 16px; line-height: 1.5;">
        Hi ${escapeHtml(params.clientName)},
      </p>

      ${params.personalMessage ? `<p style="color: #555; font-size: 14px; line-height: 1.6;">${escapeHtml(params.personalMessage)}</p>` : ''}

      <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Invoice ${params.invoiceNumber}</p>
        <p style="color: #16a34a; font-size: 28px; font-weight: bold; margin: 8px 0;">${params.amount}</p>
        <p style="color: #666; font-size: 13px; margin: 0;">Due ${params.dueDate}</p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${params.portalUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View & Pay Invoice
        </a>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
        This invoice was sent via InvoiceAI
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function buildReminderEmailHtml(params: {
  clientName: string;
  subject: string;
  body: string;
  portalUrl: string;
  businessName?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; font-size: 20px; margin: 0;">${escapeHtml(params.businessName ?? 'InvoiceAI')}</h1>
      </div>

      <div style="color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(params.body)}</div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${params.portalUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View & Pay Invoice
        </a>
      </div>

      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
        This reminder was sent via InvoiceAI
      </p>
    </div>
  </div>
</body>
</html>`;
}
