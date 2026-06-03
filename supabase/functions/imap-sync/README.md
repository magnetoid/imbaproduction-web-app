# imap-sync

Pulls new mail over IMAP into `crm_inbox_messages`. Pairs with the `send-email`
function (SMTP) to give the admin a working **Inbox** (`/admin/inbox`).

## Status: SPIKE — verify before relying on it

Two unknowns surfaced in research and **must be validated** in your environment:

1. **Edge runtime + raw sockets.** IMAP needs outbound TCP/TLS
   (`Deno.connect` / `Deno.connectTls`). If the Supabase edge sandbox forbids
   raw sockets, the function will throw a socket/permission error. In that case,
   run the **same logic as an external worker** — a small Deno or Node process on
   a VM / Cloud Run / a cron box — using the service-role key to write to the DB.
   The DB schema and the admin UI do not change; only where the loop runs does.
2. **`deno-imap` UID support.** Research refuted (1–2) the claim that `deno-imap`
   reliably supports UID operations. Confirm `selectMailbox`, `search(['UID', …])`
   and `fetch(uid, …)` behave as written; if not, pin a different IMAP client or
   track by `Message-ID` instead of UID. The import specifier in `index.ts`
   (`jsr:@workingdevshero/deno-imap`) must be confirmed and version-pinned.

## Config

IMAP host/port/credentials/mailbox live in `crm_runtime_settings` (set them in
**Admin → CRM Settings → Email inbox (IMAP)**). The sync cursor
(`imap_last_uid`, `imap_uidvalidity`) is maintained automatically per RFC 4549.

## Deploy

```bash
supabase functions deploy imap-sync
```

The function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the edge
env. Idempotency is guaranteed by the `UNIQUE (mailbox, uid)` index added in
`migrations/V014__email_inbox.sql`.

## Trigger

- **Manual:** the Inbox "Sync now" button invokes it.
- **Scheduled (pg_cron + pg_net):** run periodically. Requires the `pg_cron` and
  `pg_net` extensions enabled. Replace `<PROJECT_REF>` and the service-role key:

```sql
select cron.schedule(
  'imap-sync-5min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/imap-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

Keep the service-role key in Vault rather than inline where possible.
