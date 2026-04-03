# Email Setup (Render + Nodemailer)

Yes — Nodemailer works on Render.

Render does **not** block Nodemailer itself. The requirement is that you use a valid SMTP provider and correct credentials.

## Key Point About `noreply@...`

You can use `noreply@yourdomain.com` **as the sender** if:

1. Your SMTP provider allows that sender/domain
2. The domain is verified (SPF/DKIM configured)
3. The mailbox/sender identity exists with the provider

If these are missing, many providers reject mail or mark it as spam.

## If You Don't Have a Domain

You can still send email immediately.

- Use a real mailbox you own (for example, Gmail SMTP with App Password)
- Set `EMAIL_USER` to that mailbox
- Leave `EMAIL_FROM` empty **or** set it to the same mailbox address

Example:

```env
EMAIL_SERVICE=smtp
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=your_16_char_app_password
# EMAIL_FROM=yourname@gmail.com
EMAIL_PROVIDER=gmail
```

In short: without a domain, do **not** use `noreply@something.com`.

## Environment Variables

Set these in Render (Service → Environment):

```env
EMAIL_SERVICE=smtp
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password

# Optional explicit sender shown in "From"
EMAIL_FROM=noreply@yourdomain.com

# Option A: provider shortcut (e.g. gmail)
EMAIL_PROVIDER=gmail

# Option B: explicit SMTP host (recommended for custom providers)
# EMAIL_HOST=smtp.your-provider.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
```

Backend behavior:

- SMTP auth uses `EMAIL_USER` + `EMAIL_PASS`
- From address uses `EMAIL_FROM` if set, otherwise `EMAIL_USER`

## Working Provider Examples

- Gmail SMTP (with App Password)
- Mailgun SMTP
- SendGrid SMTP
- Resend SMTP endpoint
- Zoho SMTP

## Quick Troubleshooting

1. Check Render logs for `Email service ready via SMTP`
2. If you see auth failures, re-check username/password or app password
3. If send succeeds but inbox misses mail, fix SPF/DKIM/DMARC for your domain
4. If using `noreply@...`, make sure that identity is allowed by your SMTP provider

## Local vs Render

Same code path. The difference is only environment variables.

- Local: values in `backend/.env`
- Render: values in dashboard Environment settings

If local works and Render fails, it is usually a missing/incorrect env var in Render.
