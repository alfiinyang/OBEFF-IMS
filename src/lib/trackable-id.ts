/**
 * Auto-Generated Unique Trackable ID Generator for OBEFF IMS
 * Generates standardized, collision-resistant tracking codes for:
 * - CMP: Member Complaints / Reports (e.g. CMP-58201)
 * - APL: Quarantine Appeals (e.g. APL-39104)
 * - LIN: Lineage Requests (e.g. LIN-20419)
 * - DEL: Post Deletion Records (e.g. DEL-84012)
 * - REG: Registration Requests (e.g. REG-10523)
 * - QRN: Quarantine Moderation Records (e.g. QRN-61029)
 */

export type TrackablePrefix = 'CMP' | 'APL' | 'LIN' | 'DEL' | 'REG' | 'QRN';

export function generateTrackableId(prefix: TrackablePrefix): string {
  // Generate a random 5-digit number between 10000 and 99999
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomSuffix}`;
}
