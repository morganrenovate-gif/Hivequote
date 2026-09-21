interface GhlContactInput {
  firstName: string
  lastName?: string
  phone: string
  email?: string
  customFields?: Record<string, string>
  tags?: string[]
}

export type GhlContactResult =
  | { ok: true; contactId: string }
  | { ok: false; reason: 'hedy_migration_not_activated' }

/**
 * Real GHL writes are intentionally disabled during the Hedy-native cutover.
 */
export async function ghlCreateContact(_input: GhlContactInput): Promise<GhlContactResult> {
  return { ok: false, reason: 'hedy_migration_not_activated' }
}
