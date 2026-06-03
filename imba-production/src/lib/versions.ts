import { supabase } from './supabase'
import type { ContentVersion } from './supabase'

/**
 * Generic content version history (Payload/Ghost-style snapshots).
 * Used by the blog editor now; reused by the Phase 2 page builder.
 * Admin-only — RLS gates `content_versions` behind is_admin().
 */

export async function listVersions(
  entityType: string,
  entityId: string,
  limit = 50,
): Promise<ContentVersion[]> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as ContentVersion[]
}

/**
 * Snapshot the current editable payload as a new immutable version.
 * Best-effort: a failed snapshot must never block the main save, so callers
 * should `.catch()` and surface a non-fatal warning.
 */
export async function snapshotVersion(
  entityType: string,
  entityId: string,
  snapshot: Record<string, unknown>,
  opts?: { isAutosave?: boolean },
): Promise<void> {
  const { data: versionData, error: versionErr } = await supabase.rpc('next_content_version', {
    p_entity_type: entityType,
    p_entity_id: entityId,
  })
  if (versionErr) throw versionErr

  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase.from('content_versions').insert([{
    entity_type: entityType,
    entity_id: entityId,
    version: (versionData as number) ?? 1,
    title: typeof snapshot.title === 'string' ? snapshot.title : null,
    snapshot,
    is_autosave: opts?.isAutosave ?? false,
    author_id: userData.user?.id ?? null,
    author_email: userData.user?.email ?? null,
  }])
  if (error) throw error
}
