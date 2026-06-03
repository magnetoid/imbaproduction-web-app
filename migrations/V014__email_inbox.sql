-- V014 — email: IMAP inbox sync support (Phase 4)
-- Reuses the existing crm_inbox_messages table for inbound mail (no CRM UI).
-- SMTP send already works via the send-email edge function + crm_runtime_settings.

-- IMAP connection + sync cursor on the single runtime-settings row.
ALTER TABLE public.crm_runtime_settings
  ADD COLUMN IF NOT EXISTS imap_host        TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS imap_port        TEXT    DEFAULT '993',
  ADD COLUMN IF NOT EXISTS imap_username    TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS imap_password    TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS imap_secure      BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS imap_mailbox     TEXT    DEFAULT 'INBOX',
  ADD COLUMN IF NOT EXISTS imap_last_uid    BIGINT  DEFAULT 0,   -- highest UID synced
  ADD COLUMN IF NOT EXISTS imap_uidvalidity BIGINT  DEFAULT 0;   -- RFC 4549 cache key

-- UID + mailbox on inbox rows for incremental, idempotent IMAP sync.
ALTER TABLE public.crm_inbox_messages
  ADD COLUMN IF NOT EXISTS uid     BIGINT,
  ADD COLUMN IF NOT EXISTS mailbox TEXT DEFAULT 'INBOX';

-- Dedup guard: one row per (mailbox, uid) so re-runs never double-insert.
CREATE UNIQUE INDEX IF NOT EXISTS crm_inbox_messages_uid_idx
  ON public.crm_inbox_messages (mailbox, uid) WHERE uid IS NOT NULL;
