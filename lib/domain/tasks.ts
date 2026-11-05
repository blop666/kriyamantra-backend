import type { InferSelectModel } from "drizzle-orm";
import { taskStatus, weeklyTasks } from "@/lib/db/schema";

export type TaskStatus = (typeof taskStatus.enumValues)[number];
export type WeeklyTask = InferSelectModel<typeof weeklyTasks>;

const transitions: Record<TaskStatus, readonly TaskStatus[]> = {
  todo: ["in_progress", "snoozed", "skipped"],
  in_progress: ["done", "snoozed", "skipped"],
  snoozed: ["todo", "in_progress", "skipped"],
  skipped: ["todo"],
  done: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus) {
  return from === to || transitions[from].includes(to);
}

export function taskTemplates(productName?: string) {
  const product = productName ? ` untuk produk ${productName}` : "";
  return [
    { type: "content", title: `Buat satu ide konten${product}`, description: "Tulis satu ide sederhana yang menampilkan proses atau keunikan produk.", priority: 1 },
    { type: "product", title: `Periksa informasi produk${product}`, description: "Pastikan nama, foto, bahan, dan deskripsi produk siap dipakai.", priority: 2 },
    { type: "planning", title: "Jadwalkan satu aktivitas pemasaran", description: "Pilih satu tindakan pemasaran yang realistis untuk minggu ini.", priority: 3 },
  ];
}
