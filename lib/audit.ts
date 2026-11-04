import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";

type AuditInput = {
  businessId: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  requestId: string;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(input: AuditInput) {
  await getDb().insert(auditEvents).values({
    id: randomUUID(),
    businessId: input.businessId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    requestId: input.requestId,
    metadata: input.metadata ?? {},
    createdAt: new Date(),
  });
}

export function auditSafeError(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 500) : "Unknown error";
}
