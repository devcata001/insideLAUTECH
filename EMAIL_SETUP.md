# Email Service Setup Guide

## Overview

ShopOnCampus uses **Nodemailer SMTP only**:

1. **Sender email:** `shoponcampus@gmail.com`
2. **Transport:** SMTP with Gmail App Password
3. **Deployment:** Works on Render using environment variables

---

## Why this setup

- ✅ Free for startup usage
- ✅ SMTP mode is simplest and most reliable on Render
- ✅ Works on Render
- ✅ Keeps sender identity on `shoponcampus@gmail.com`

---

## Setup Steps

### Nodemailer SMTP on Render

Use Gmail with a 16-character App Password.

1. Enable 2-Step Verification on the Gmail account (`shoponcampus@gmail.com`)
2. Generate an App Password in Google Account settings
3. Set these Render environment variables:

```env
EMAIL_SERVICE=smtp
EMAIL_USER=shoponcampus@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_PROVIDER=gmail
```

Optional custom SMTP host/port values (only if not using Gmail preset):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

---

## What should work

- ✅ Signup verification emails
- ✅ Resend verification emails
- ✅ Forgot password emails
- ✅ Password reset completion flow

---

## Troubleshooting

### Render: SMTP mode not sending

- Confirm `EMAIL_SERVICE=smtp`
- Confirm `EMAIL_USER` and `EMAIL_PASS` are both set on Render
- For Gmail App Password, do **not** use your normal Gmail login password
- Redeploy after updating environment variables

### Port 5000 already in use

- Stop previous process before restart:
  - `pkill -f "node server.js"`

---

## Notes on free usage

- SMTP with Gmail App Password is suitable for low/medium startup volume.
- If volume grows heavily, move to a dedicated provider (SendGrid, Resend, Mailgun).
