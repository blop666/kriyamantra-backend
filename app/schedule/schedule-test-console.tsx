"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Generation = {
  id: string;
  status: string;
  imageStatus: string | null;
  format: "feed" | "story";
  createdAt: string;
};

type Output = {
  id: string;
  imagePath: string | null;
  captionId: string;
  captionEn: string;
  hashtags: unknown;
  qualityStatus: string;
};

type Detail = { generation: Generation; outputs: Output[] };
type Schedule = {
  id: string;
  generationId: string;
  mediaType: string;
  scheduledFor: string;
  status: string;
  caption: string;
  attempts: number;
  lastError: string | null;
};
type ApiResult = { status: number; body: unknown };

export default function ScheduleTestConsole() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [details, setDetails] = useState<Record<string, Detail>>({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [scheduledFor, setScheduledFor] = useState(() => localDateTime(10));
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState<"FEED" | "STORIES">("FEED");
  const [status, setStatus] = useState<unknown>(null);
  const [packageData, setPackageData] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<ApiResult[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedDetail = selectedId ? details[selectedId] : undefined;
  const selectedOutput = selectedDetail?.outputs.find((item) => item.qualityStatus === "approved") ?? selectedDetail?.outputs[0];
  const selectedSchedule = schedules.find((item) => item.generationId === selectedId && item.mediaType === mediaType);
  const ready = selectedDetail?.generation.status === "succeeded" && selectedDetail.generation.imageStatus === "succeeded";

  async function call(path: string, options?: RequestInit): Promise<ApiResult> {
    const response = await fetch(path, { ...options, headers: { ...(options?.body ? { "Content-Type": "application/json" } : {}), ...options?.headers } });
    const body = await response.json().catch(() => null);
    const result = { status: response.status, body };
    setLogs((current) => [result, ...current].slice(0, 30));
    if (!response.ok) throw new Error(errorText(response.status, body));
    return result;
  }

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label); setError(""); setMessage("");
    try { await action(); setMessage(`${label} berhasil.`); } catch (caught) { setError(caught instanceof Error ? caught.message : "Request gagal."); } finally { setBusy(""); }
  }

  async function loadAll() {
    await run("Refresh", async () => {
      const [generationResult, scheduleResult, statusResult] = await Promise.all([call("/api/content-generations"), call("/api/posts"), call("/api/integrations/instagram/status")]);
      const generationRows = ((generationResult.body as { generations?: Generation[] }).generations ?? []);
      setGenerations(generationRows);
      setSchedules(((scheduleResult.body as { items?: Schedule[] }).items ?? []));
      setStatus(statusResult.body);
      await Promise.all(generationRows.slice(0, 20).map(async (generation) => {
        try { const result = await call(`/api/content-generations/${generation.id}`); setDetails((current) => ({ ...current, [generation.id]: result.body as Detail })); } catch { /* list remains usable */ }
      }));
    });
  }

  // Temporary harness: initial API hydration is intentionally fire-and-forget.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { queueMicrotask(() => { void loadAll(); }); }, []);

  const counts = useMemo(() => schedules.reduce<Record<string, number>>((result, item) => ({ ...result, [item.status]: (result[item.status] ?? 0) + 1 }), {}), [schedules]);

  async function approve() {
    if (!selectedId) return;
    await run("Approve", async () => { await call(`/api/content-generations/${selectedId}/approve`, { method: "POST", body: JSON.stringify({ confirmed: true }) }); await loadAll(); });
  }

  async function schedule() {
    if (!selectedId) return;
    await run("Schedule", async () => {
      await call(`/api/posts/${selectedId}/schedule`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ scheduledFor: new Date(scheduledFor).toISOString(), mediaType, caption }) });
      await loadAll();
    });
  }

  async function updateSchedule() {
    if (!selectedSchedule) return;
    await run("Update schedule", async () => { await call(`/api/posts/${selectedSchedule.id}/schedule`, { method: "PATCH", body: JSON.stringify({ scheduledFor: new Date(scheduledFor).toISOString(), caption }) }); await loadAll(); });
  }

  async function cancelSchedule() {
    if (!selectedSchedule) return;
    await run("Cancel schedule", async () => { await call(`/api/posts/${selectedSchedule.id}/cancel`, { method: "POST" }); await loadAll(); });
  }

  async function retrySchedule() {
    if (!selectedSchedule) return;
    await run("Retry schedule", async () => { await call(`/api/posts/${selectedSchedule.id}/retry`, { method: "POST" }); await loadAll(); });
  }

  async function loadPackage() {
    if (!selectedSchedule) return;
    await run("Load package", async () => { const result = await call(`/api/posts/${selectedSchedule.id}/package`); setPackageData((result.body as { data?: Record<string, unknown> }).data ?? null); });
  }

  async function publishNow() {
    if (!selectedId) return;
    await run("Publish now", async () => { await call(`/api/content-generations/${selectedId}/publish/instagram`, { method: "POST", body: JSON.stringify({ mediaType, caption, confirmed: true }) }); await loadAll(); });
  }

  function selectGeneration(id: string, type?: string) {
    const detail = details[id];
    const output = detail?.outputs.find((item) => item.qualityStatus === "approved") ?? detail?.outputs[0];
    setSelectedId(id);
    setCaption(output?.captionId ?? "");
    setMediaType((type as "FEED" | "STORIES" | undefined) ?? (detail?.generation.format === "story" ? "STORIES" : "FEED"));
    setPackageData(null);
  }

  return (
    <main className="min-h-screen bg-[#f4efe6] px-4 py-6 text-[#23352d] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b border-[#dfe4dc] pb-5 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#b27832]">Temporary test harness</p><h1 className="mt-2 font-serif text-4xl">Schedule lab</h1><p className="mt-2 text-sm text-[#66756c]">UI sementara untuk menguji approval, scheduler, publish, retry, dan package.</p></div>
          <div className="flex gap-2"><Link className="rounded-xl border border-[#cfd9ce] px-4 py-3 text-sm font-bold" href="/dummy-test">Content flow</Link><button className="primary-button max-w-36" onClick={() => void loadAll()} disabled={!!busy}>Refresh</button></div>
        </header>
        {message && <div className="mb-4 rounded-xl bg-[#e5f1e4] p-3 text-sm text-[#28563f]">{message}</div>}
        {error && <div className="mb-4 rounded-xl bg-[#fbe9e4] p-3 text-sm text-[#9a3d2f]">{error}</div>}
        <div className="mb-5 grid gap-3 sm:grid-cols-4"><Metric label="Scheduled" value={counts.scheduled ?? 0} /><Metric label="Published" value={counts.published ?? 0} /><Metric label="Failed" value={counts.failed ?? 0} /><Metric label="Connection" value={connectionLabel(status)} /></div>
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Generations</h2><span className="text-xs text-[#66756c]">{generations.length} total</span></div><div className="space-y-2">{generations.length ? generations.map((generation) => <button key={generation.id} onClick={() => selectGeneration(generation.id)} className={`w-full rounded-xl border p-3 text-left text-sm ${selectedId === generation.id ? "border-[#1e4034] bg-[#e9f0e8]" : "border-[#dfe4dc]"}`}><div className="flex justify-between gap-3"><strong>{generation.format}</strong><Status value={generation.imageStatus ?? generation.status} /></div><p className="mt-2 truncate font-mono text-[11px] text-[#66756c]">{generation.id}</p><p className="mt-1 text-xs text-[#88958c]">{new Date(generation.createdAt).toLocaleString("id-ID")}</p></button>) : <Empty text="Belum ada generation. Buat dari Content flow." />}</div></section>
          <section className="rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-5"><h2 className="text-xl font-semibold">Actions</h2>{selectedId ? <><div className="mt-3 rounded-xl bg-[#eef3eb] p-3 font-mono text-xs break-all">{selectedId}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Info label="Generation" value={selectedDetail?.generation.status ?? "loading"} /><Info label="Image" value={selectedDetail?.generation.imageStatus ?? "-"} /><Info label="Approval" value={selectedOutput?.qualityStatus ?? "-"} /><Info label="Schedule" value={selectedSchedule?.status ?? "none"} /></div><div className="mt-5 flex flex-wrap gap-2"><button className="primary-button max-w-36" onClick={() => void approve()} disabled={!!busy || selectedOutput?.qualityStatus === "approved"}>Approve</button><button className="rounded-xl border border-[#cfd9ce] px-4 py-3 text-sm font-bold" onClick={() => void publishNow()} disabled={!!busy || !ready || selectedOutput?.qualityStatus !== "approved"}>Publish now</button></div><div className="mt-5 border-t border-[#dfe4dc] pt-5"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Media type<select className="form-input" value={mediaType} onChange={(event) => setMediaType(event.target.value as "FEED" | "STORIES")}><option value="FEED">FEED</option><option value="STORIES">STORIES</option></select></label><label className="text-xs font-semibold">Scheduled UTC/local<input className="form-input" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></label></div><label className="mt-3 block text-xs font-semibold">Caption<textarea className="form-input min-h-28" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={2200} /></label><div className="mt-3 flex flex-wrap gap-2"><button className="primary-button max-w-36" onClick={() => void (selectedSchedule ? updateSchedule() : schedule())} disabled={!!busy || !ready || selectedOutput?.qualityStatus !== "approved"}>{selectedSchedule ? "Update" : "Schedule"}</button>{selectedSchedule?.status === "scheduled" && <button className="rounded-xl border border-[#d89484] px-4 py-3 text-sm font-bold text-[#9a3d2f]" onClick={() => void cancelSchedule()} disabled={!!busy}>Cancel</button>}{selectedSchedule?.status === "failed" && <button className="rounded-xl border border-[#cfd9ce] px-4 py-3 text-sm font-bold" onClick={() => void retrySchedule()} disabled={!!busy}>Retry</button>}{selectedSchedule && <button className="rounded-xl border border-[#cfd9ce] px-4 py-3 text-sm font-bold" onClick={() => void loadPackage()} disabled={!!busy}>Load package</button>}</div></div>{packageData && <div className="mt-5 rounded-xl bg-[#183f38] p-4 text-sm text-white"><p className="font-bold">Manual upload package</p>{typeof packageData.imageUrl === "string" && <a className="mt-2 block break-all text-[#f4d895] underline" href={packageData.imageUrl} target="_blank" rel="noreferrer">Open signed image URL</a>}<pre className="mt-3 max-h-40 overflow-auto text-xs">{JSON.stringify(packageData, null, 2)}</pre></div>}</> : <Empty text="Pilih generation untuk mulai testing." />}</section>
        </div>
        <section className="mt-5 rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Schedules</h2><button className="text-sm font-bold underline" onClick={() => void loadAll()}>Reload</button></div><div className="mt-4 grid gap-3 md:grid-cols-2">{schedules.length ? schedules.map((item) => <button key={item.id} className="rounded-xl border border-[#dfe4dc] p-3 text-left" onClick={() => selectGeneration(item.generationId, item.mediaType)}><div className="flex justify-between"><strong>{item.mediaType}</strong><Status value={item.status} /></div><p className="mt-2 text-xs">{new Date(item.scheduledFor).toLocaleString("id-ID")}</p><p className="mt-1 truncate font-mono text-[10px] text-[#66756c]">{item.id}</p>{item.lastError && <p className="mt-2 text-xs text-[#9a3d2f]">{item.lastError}</p>}</button>) : <Empty text="Belum ada schedule." />}</div></section>
        <section className="mt-5 rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-5"><h2 className="text-xl font-semibold">Request log</h2><pre className="mt-3 max-h-48 overflow-auto rounded-xl bg-[#183f38] p-4 text-xs text-[#f4f1e8]">{logs.length ? JSON.stringify(logs, null, 2) : "Belum ada request."}</pre></section>
      </div>
    </main>
  );
}

function localDateTime(minutes: number) { const date = new Date(Date.now() + minutes * 60_000); const pad = (value: number) => String(value).padStart(2, "0"); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function errorText(status: number, body: unknown) { const value = body as { error?: unknown; message?: unknown } | null; const error = typeof value?.error === "string" ? value.error : typeof value?.message === "string" ? value.message : "Request gagal"; return `${status}: ${error}`; }
function connectionLabel(value: unknown) { const connection = (value as { connection?: { status?: string } } | null)?.connection; return connection?.status ?? "unknown"; }
function Metric({ label, value }: { label: string; value: string | number }) { return <article className="metric-card"><p>{label}</p><strong>{value}</strong></article>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#dfe4dc] p-3 text-xs"><p className="text-[#88958c]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Status({ value }: { value: string }) { return <span className="status-pill">{value}</span>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-[#cfd9ce] px-4 py-8 text-center text-sm text-[#88958c]">{text}</div>; }
