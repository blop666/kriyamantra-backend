import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { taskActions, weeklyTasks } from "@/lib/db/schema";
import { getOwnedBusiness } from "@/lib/domain/business";
import { canTransition, type TaskStatus } from "@/lib/domain/tasks";
import { readJson, requestId, structuredError, withRequestId } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestIdValue = requestId(request);
  const auth = await getOwnedBusiness();
  if (auth.error) return withRequestId(structuredError("TSK_AUTH_REQUIRED", auth.error, 401, undefined, requestIdValue), requestIdValue);
  if (!auth.business) return withRequestId(structuredError("TSK_BUSINESS_REQUIRED", "Business profile required", 404, undefined, requestIdValue), requestIdValue);
  const body = await readJson(request);
  const nextStatus = body && typeof body === "object" && "status" in body ? (body as { status?: unknown }).status : undefined;
  if (typeof nextStatus !== "string" || !["todo", "in_progress", "done", "snoozed", "skipped"].includes(nextStatus)) return withRequestId(structuredError("TSK_INVALID_STATUS", "Invalid task status", 422, undefined, requestIdValue), requestIdValue);
  const { id } = await params;
  const db = getDb();
  const [task] = await db.select().from(weeklyTasks).where(and(eq(weeklyTasks.id, id), eq(weeklyTasks.businessId, auth.business.id))).limit(1);
  if (!task) return withRequestId(structuredError("TSK_NOT_FOUND", "Task not found", 404, undefined, requestIdValue), requestIdValue);
  if (!canTransition(task.status, nextStatus as TaskStatus)) return withRequestId(structuredError("TSK_INVALID_TRANSITION", "Invalid task status transition", 409, { from: task.status, to: nextStatus }, requestIdValue), requestIdValue);
  if (task.status === nextStatus) return withRequestId(Response.json({ data: task, requestId: requestIdValue }), requestIdValue);
  const now = new Date();
  const completedAt = nextStatus === "done" ? now : task.completedAt;
  const [updated] = await db.update(weeklyTasks).set({ status: nextStatus as TaskStatus, completedAt, updatedAt: now }).where(and(eq(weeklyTasks.id, id), eq(weeklyTasks.businessId, auth.business.id))).returning();
  await db.insert(taskActions).values({ id: randomUUID(), businessId: auth.business.id, taskId: id, fromStatus: task.status, toStatus: nextStatus as TaskStatus, actorUserId: auth.user?.id ?? null, metadata: {}, createdAt: now });
  return withRequestId(Response.json({ data: updated, requestId: requestIdValue }), requestIdValue);
}
