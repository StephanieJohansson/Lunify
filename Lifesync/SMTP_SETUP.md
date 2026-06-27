# SMTP setup

Lunify reads all mail credentials from environment variables. Never commit real values.

Required variables:

```text
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-secret
MAIL_FROM=no-reply@your-domain.example
CLIENT_URL=http://localhost:5173
```

Production settings:

```text
CLIENT_URL=https://your-lunify-frontend.example
SESSION_COOKIE_SECURE=true
```

Port 587 with STARTTLS is the default. If a provider uses another port or authentication mode,
set `MAIL_PORT`, `MAIL_STARTTLS`, and `MAIL_SMTP_AUTH` according to that provider's documentation.

Use a dedicated SMTP credential with permission to send only. Do not reuse a personal mailbox
password. Rotate the credential immediately if it is ever printed, committed, or shared.
