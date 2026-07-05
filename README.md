# Asset Union Admin — Live Full-Stack Build

This project keeps the supplied Asset Union admin UI and converts the dashboard into a single production-oriented Next.js application with MongoDB-backed data, Cloudinary file storage, secure role-based admin access, Gmail delivery, Bridge virtual accounts, and doola LLC formation.

## Implemented modules

- Secure admin sign-in with short-lived HTTP-only access cookies, rotating refresh sessions, authenticator-app 2FA, session/device history, and remote device logout.
- Preset roles: Super Admin, Property Manager, User Manager, and Rent Manager.
- Custom roles with granular permissions. Permissions are enforced in the UI and again on every protected API route.
- Admin invitations by Gmail, a single-use 30-minute acceptance token, invitation status, resend, role update, suspension, and removal.
- MongoDB models and live pages for properties, users, rents, governance proposals/votes, notifications, compliance logs, admin sessions, invitations, and platform settings.
- Cloudinary uploads for profile images, property images, gallery images, and legal/property documents.
- CRUD activity logging. Every create/update/delete/auth/system action is stored in compliance logs and creates an in-app activity notification.
- Manual notifications with audience, type, in-app/email channel selection, send-now or scheduled delivery, status, failure tracking, and a cron dispatcher.
- Rental-property and construction-project creation wizards backed by MongoDB.
- doola property LLC formation with idempotent customer/company requests, persisted formation state, webhook updates, on-demand SS-4/Form 8821 signing sessions, fresh legal-document download links, and retry status.
- Bridge business onboarding per property. The dashboard stores KYB/ToS links, polls approval status, then provisions a unique USD virtual account and stores masked account/routing details against that property.

## Required setup

1. Copy `.env.example` to `.env.local`.
2. Fill MongoDB, Cloudinary, Gmail App Password, Bridge, and doola credentials.
3. Install packages:

```bash
npm install
```

4. Bootstrap the first super admin and default platform settings:

```bash
npm run seed
```

5. Start locally:

```bash
npm run dev
```

Open `http://localhost:3000/sign-in`.

The login endpoint also creates the bootstrap super admin automatically when the Admin collection is empty and the `SUPER_ADMIN_*` variables are present.

## Gmail

Use a Google App Password in `GMAIL_APP_PASSWORD`; do not use the normal Gmail account password. `GMAIL_USER` and `EMAIL_FROM` are already prepared for `cjfrancisf@gmail.com` in the example file.

## Bridge property accounts

Bridge requires the business customer to accept its Terms of Service and complete KYB before a virtual account can be created. With `BRIDGE_CUSTOMER_ID` left blank, property provisioning creates a separate business onboarding link for each property and displays both links on the property detail page. After approval, use **Create / Retry LLC and Bank Account**; the application refreshes the KYB state and creates the USD virtual account.

`BRIDGE_DESTINATION_WALLET_ADDRESS` is required because incoming USD deposits are converted and delivered to the configured destination rail/currency.

For sandbox testing, use Bridge sandbox credentials and its simulated approval flow. For live use, the Bridge account and each property business must complete the applicable compliance review.

## doola LLC formation

The property wizard captures the responsible-party and address fields used for LLC formation. Configure the doola webhook to:

```text
https://YOUR_DOMAIN/api/webhooks/doola
```

Use the same signing secret in `DOOLA_WEBHOOK_SECRET`. Formation is asynchronous; the property detail page stores and displays the current provider status, entity name, state, company ID, EIN, signing requirements, legal documents, and any provider error. Signing and document links are created only when opened because provider URLs expire.

`DOOLA_INDUSTRY` must be an exact value accepted by the current doola industry reference catalogue. The example value targets residential property holding companies; replace it if your approved partner account uses a different classification.

Use `https://api.test.doola.com` for testing. Change `DOOLA_BASE_URL` to the production endpoint supplied for the approved partner account before going live.

## Scheduled notifications

`vercel.json` calls `/api/cron/notifications` every five minutes. Set `CRON_SECRET`; the endpoint requires `Authorization: Bearer <CRON_SECRET>`. On non-Vercel hosting, schedule the same authenticated GET request using the platform cron service.

## Security and deployment notes

- Never commit `.env.local` or provider secrets.
- Use different high-entropy values for `AUTH_SECRET`, `ENCRYPTION_KEY`, and `CRON_SECRET`.
- Use a production MongoDB database with network restrictions and backups.
- Keep Bridge and doola in sandbox until KYB, webhook, legal, and money-movement flows are verified end-to-end.
- The application stores only the last four digits of Bridge account and routing numbers in MongoDB.
