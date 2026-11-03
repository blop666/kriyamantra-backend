"use client";
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, FormEvent, useState, type ReactNode } from "react";

type ApiResult = { status: number; body: unknown; error?: string };
type LogEntry = { time: string; method: string; path: string; result: ApiResult };
type AgentResult = { state: string; nextAction: string; missingFields: string[]; readyForGeneration: boolean };
type ChatMessage = { role: "user" | "assistant"; content: string; time: string };

export default function DummyTestConsole() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState({ businessName: "Kriya Ubud", category: "Kriya dan tenun Bali", location: "Ubud, Bali", story: "Produk kriya handmade dengan cerita lokal.", tone: "hangat dan autentik", instagramHandle: "@kriyaubud", contactPhone: "081234567890" });
  const [product, setProduct] = useState({ name: "Selendang Endek Bali", description: "Selendang tenun handmade dengan motif endek khas Bali.", materials: "Benang katun", price: "350000" });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [message, setMessage] = useState("Saya ingin membuat konten untuk produk ini.");
  const [angle, setAngle] = useState("fokus tekstur");
  const [format, setFormat] = useState<"feed" | "story">("feed");
  const [conversationId, setConversationId] = useState("");
  const [productId, setProductId] = useState("");
  const [generationId, setGenerationId] = useState("");
  const [agent, setAgent] = useState<AgentResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generation, setGeneration] = useState<Record<string, unknown> | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function call(path: string, options?: RequestInit): Promise<ApiResult> {
    const headers = new Headers(options?.headers);
    if (!(options?.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const response = await fetch(path, { ...options, headers });
    const body = await response.json().catch(() => null);
    const result = { status: response.status, body, ...(response.ok ? {} : { error: describeError(response.status, body) }) };
    setLogs((current) => [{ time: new Date().toLocaleTimeString(), method: options?.method ?? "GET", path, result }, ...current]);
    if (!response.ok) throw new Error(result.error);
    return result;
  }

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label); setError(""); setNotice("");
    try { await action(); setNotice(`${label} berhasil.`); } catch (caught) { setError(caught instanceof Error ? caught.message : "Request gagal. Lihat detail response di Request Log."); } finally { setBusy(""); }
  }

  async function auth(mode: "signup" | "signin") {
    await run(mode, async () => {
      if (!email || !password) throw new Error("Email dan password wajib diisi.");
      await call(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify({ email, password }) });
    });
  }

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();
    await run("onboarding", async () => { await call("/api/onboarding", { method: "POST", body: JSON.stringify({ ...business, languages: ["id", "en"], consentPolicyVersion: "dummy-1" }) }); });
  }

  async function createProduct(event: FormEvent) {
    event.preventDefault();
    await run("product", async () => {
      const result = await call("/api/products", { method: "POST", body: JSON.stringify({ ...product, price: Number(product.price) }) });
      const id = (result.body as { product?: { id?: string } }).product?.id;
      if (!id) throw new Error("Product ID tidak ditemukan.");
      setProductId(id);
    });
  }

  async function uploadImage(event: FormEvent) {
    event.preventDefault();
    await run("upload", async () => {
      if (!productId || !file) throw new Error("Buat product dan pilih image dulu.");
      const form = new FormData(); form.append("file", file);
      const result = await call(`/api/products/${productId}/image`, { method: "POST", body: form });
      setGeneration((current) => ({ ...(current ?? {}), productImage: result.body }));
    });
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    await run("chat", async () => { await sendMessage(message); });
  }

  async function generateCopy(event: FormEvent) {
    event.preventDefault();
    await run("copy", async () => {
      if (!conversationId || !productId) throw new Error("Conversation dan product wajib tersedia.");
      let currentAgent = agent;
      if (!currentAgent || currentAgent.state !== "confirm_generation" || !currentAgent.readyForGeneration) {
        const confirmation = `Saya memilih format ${format}, angle kreatif ${angle}. Data produk dan gambar sudah siap. Saya mengonfirmasi, generate copy dan creative brief sekarang.`;
        currentAgent = await sendMessage(confirmation);
      }
      if (currentAgent.state !== "confirm_generation" || !currentAgent.readyForGeneration) throw new Error(`AI belum menyatakan context lengkap. State: ${currentAgent.state}; missing: ${currentAgent.missingFields.join(", ") || "none"}. Baca pertanyaan AI lalu lengkapi melalui chat.`);
      const result = await call("/api/content-generations", { method: "POST", body: JSON.stringify({ conversationId, productId, format, angle, confirmed: true }) });
      const body = result.body as { generationId?: string; output?: Record<string, unknown> };
      if (body.generationId) setGenerationId(body.generationId);
      setGeneration(body.output ?? null);
    });
  }

  async function sendMessage(content: string) {
    const result = await call("/api/chat", { method: "POST", body: JSON.stringify({ conversationId: conversationId || undefined, productId: productId || undefined, message: content, channel: "web" }) });
    const body = result.body as { conversationId?: string; agent?: AgentResult; message?: { content?: string } };
    if (body.conversationId) setConversationId(body.conversationId);
    if (!body.agent) throw new Error("AI response tidak memiliki agent result.");
    setAgent(body.agent);
    setChatMessages((current) => [...current, { role: "user", content, time: new Date().toLocaleTimeString() }, ...(body.message?.content ? [{ role: "assistant" as const, content: body.message.content, time: new Date().toLocaleTimeString() }] : [])]);
    return body.agent;
  }

  async function startImage() {
    await run("image", async () => {
      if (!generationId) throw new Error("Generation ID belum tersedia.");
      const result = await call(`/api/content-generations/${generationId}/image`, { method: "POST" });
      const body = result.body as { imageUrl?: string };
      if (body.imageUrl) setImageUrl(body.imageUrl);
    });
  }

  async function pollImage() {
    await run("poll", async () => {
      if (!generationId) throw new Error("Generation ID belum tersedia.");
      const result = await call(`/api/content-generations/${generationId}/image`);
      const body = result.body as { imageUrl?: string };
      if (body.imageUrl) setImageUrl(body.imageUrl);
    });
  }

  async function generateImageUntilDone() {
    await run("image", async () => {
      if (!generationId) throw new Error("Generation ID belum tersedia.");
      const started = await call(`/api/content-generations/${generationId}/image`, { method: "POST" });
      let body = started.body as { imageStatus?: string; imageUrl?: string };
      for (let attempt = 0; attempt < 12 && body.imageStatus !== "succeeded" && body.imageStatus !== "failed"; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const result = await call(`/api/content-generations/${generationId}/image`);
        body = result.body as { imageStatus?: string; imageUrl?: string };
      }
      if (body.imageUrl) setImageUrl(body.imageUrl);
      if (body.imageStatus !== "succeeded") throw new Error(`Image belum selesai setelah polling. Status: ${body.imageStatus ?? "unknown"}. Klik Poll image untuk lanjut.`);
    });
  }

  return (
    <main className="min-h-screen bg-[#102e2a] px-4 py-6 text-[#f8f0df] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-white/15 pb-6 md:flex-row md:items-end">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-[#e6ad55]">Temporary test harness</p><h1 className="font-serif text-4xl tracking-tight sm:text-5xl">KriyaMantra <em className="text-[#e6ad55]">lab</em></h1><p className="mt-2 max-w-xl text-sm text-[#c8d6c9]">UI dummy untuk menjalankan alur backend dari auth sampai signed image URL. Bukan production screen.</p></div>
          <div className="rounded-full border border-[#e6ad55]/40 px-4 py-2 text-xs text-[#f4d895]">Route: /dummy-test</div>
        </header>

        {notice && <div className="mb-3 rounded-xl border border-emerald-300/30 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{notice}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-300/40 bg-red-950/40 px-4 py-3 text-sm text-red-100"><strong className="block">Request gagal</strong><span>{error}</span><p className="mt-1 text-xs text-red-200/70">Detail lengkap tersimpan di Request Log.</p></div>}
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <Section number="01" title="Account & business">
            <div className="grid gap-3 sm:grid-cols-2"><Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" /><Input label="Password" value={password} onChange={setPassword} type="password" placeholder="min. 8 karakter" /></div>
            <div className="mt-3 flex gap-2"><Button onClick={() => auth("signup")} disabled={!!busy}>Sign up</Button><Button onClick={() => auth("signin")} disabled={!!busy} secondary>Sign in</Button></div>
            <form onSubmit={saveBusiness} className="mt-5 space-y-3 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e6ad55]">Onboarding</p><Input label="Nama bisnis" value={business.businessName} onChange={(value) => setBusiness({ ...business, businessName: value })} /><Input label="Kategori" value={business.category} onChange={(value) => setBusiness({ ...business, category: value })} /><div className="grid gap-3 sm:grid-cols-2"><Input label="Lokasi" value={business.location} onChange={(value) => setBusiness({ ...business, location: value })} /><Input label="Tone" value={business.tone} onChange={(value) => setBusiness({ ...business, tone: value })} /></div><div className="grid gap-3 sm:grid-cols-2"><Input label="Instagram" value={business.instagramHandle} onChange={(value) => setBusiness({ ...business, instagramHandle: value })} /><Input label="Nomor kontak" value={business.contactPhone} onChange={(value) => setBusiness({ ...business, contactPhone: value })} /></div><Button disabled={!!busy}>Save business</Button></form>
          </Section>

          <Section number="02" title="Product context">
            <form onSubmit={createProduct} className="space-y-3"><Input label="Nama produk" value={product.name} onChange={(value) => setProduct({ ...product, name: value })} /><TextArea label="Deskripsi / story" value={product.description} onChange={(value) => setProduct({ ...product, description: value })} /><div className="grid gap-3 sm:grid-cols-2"><Input label="Material" value={product.materials} onChange={(value) => setProduct({ ...product, materials: value })} /><Input label="Harga" value={product.price} onChange={(value) => setProduct({ ...product, price: value })} type="number" /></div><Button disabled={!!busy}>Create product</Button></form>
            <form onSubmit={uploadImage} className="mt-5 space-y-3 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e6ad55]">Product image</p><input className="block w-full text-sm text-[#c8d6c9] file:mr-3 file:rounded-lg file:border-0 file:bg-[#e6ad55] file:px-3 file:py-2 file:font-bold file:text-[#102e2a]" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0] ?? null; setFile(selected); setFilePreview(selected ? URL.createObjectURL(selected) : ""); }} /><Button disabled={!!busy || !productId || !file}>Upload image</Button>{filePreview && <img src={filePreview} alt="Selected product" className="max-h-48 w-full rounded-xl object-contain" />}</form>
            <IdLine label="Product ID" value={productId} /><IdLine label="Conversation ID" value={conversationId} />
          </Section>

          <Section number="03" title="Guided agent">
            <form onSubmit={sendChat} className="space-y-3"><TextArea label="Pesan user" value={message} onChange={setMessage} /><Button disabled={!!busy || !productId || !message.trim()}>Send to agent</Button></form>
            <div className="mt-4 max-h-72 space-y-2 overflow-auto">{chatMessages.length ? chatMessages.map((item, index) => <div key={`${item.time}-${index}`} className={`rounded-xl p-3 text-sm ${item.role === "assistant" ? "bg-[#f8f0df] text-[#183f38]" : "ml-6 bg-white/10 text-white"}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] opacity-60">{item.role === "assistant" ? "KriyaMantra" : "You"} · {item.time}</p>{item.content}</div>) : <Empty text="Balasan AI akan tampil di sini." />}</div>
            {agent && <div className="mt-4 rounded-xl bg-[#f8f0df] p-4 text-[#183f38]"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-[#d7e5d7] px-2 py-1">{agent.state}</span><span className="rounded-full bg-[#f4d895] px-2 py-1">{agent.nextAction}</span></div><p className="mt-3 text-sm">Ready: {String(agent.readyForGeneration)}</p><p className="mt-2 text-xs text-[#60766a]">Missing: {agent.missingFields.length ? agent.missingFields.join(", ") : "none"}</p></div>}
            <form onSubmit={generateCopy} className="mt-5 space-y-3 border-t border-white/10 pt-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e6ad55]">Confirmed generation</p><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-[#c8d6c9]">Format<select className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white" value={format} onChange={(event) => setFormat(event.target.value as "feed" | "story")}><option value="feed">Feed</option><option value="story">Story</option></select></label><Input label="Creative angle" value={angle} onChange={setAngle} /></div><p className="text-xs text-[#8fa99a]">Pilihan ini akan dikirim ke AI sebagai konfirmasi nyata. AI tetap memvalidasi kelengkapan context sebelum generate.</p><Button disabled={!!busy || !conversationId || !productId}>Confirm with AI + generate</Button></form>
          </Section>

          <Section number="04" title="Draft output & image" className="lg:col-span-2">
            {generation ? <pre className="max-h-72 overflow-auto rounded-xl bg-[#09201d] p-4 text-xs leading-6 text-[#d8e8d8]">{JSON.stringify(generation, null, 2)}</pre> : <Empty text="Copy generation output muncul di sini." />}
            <div className="mt-4 flex flex-wrap gap-2"><Button onClick={generateImageUntilDone} disabled={!!busy || !generationId}>Generate image + wait</Button><Button onClick={startImage} disabled={!!busy || !generationId} secondary>Start job</Button><Button onClick={pollImage} disabled={!!busy || !generationId} secondary>Poll image</Button></div>
            {imageUrl && <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-[#09201d]"><img src={imageUrl} alt="Generated draft" className="max-h-[32rem] w-full object-contain" /><div className="break-all p-3 text-xs text-[#c8d6c9]">Signed URL: {imageUrl}</div></div>}
            <IdLine label="Generation ID" value={generationId} />
          </Section>

          <Section number="05" title="Request log"><div className="max-h-[28rem] space-y-2 overflow-auto">{logs.length ? logs.map((entry, index) => <details key={`${entry.time}-${index}`} className="rounded-lg border border-white/10 bg-white/5 p-3"><summary className="cursor-pointer text-xs"><strong className="mr-2 text-[#e6ad55]">{entry.result.status}</strong>{entry.method} {entry.path}</summary><pre className="mt-2 overflow-auto text-[11px] leading-5 text-[#c8d6c9]">{JSON.stringify(entry.result.body, null, 2)}</pre></details>) : <Empty text="Belum ada request." />}</div></Section>
        </div>
      </div>
    </main>
  );
}

function Section({ number, title, children, className = "" }: { number: string; title: string; children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-white/12 bg-white/[.07] p-5 shadow-2xl shadow-black/10 ${className}`}><div className="mb-5 flex items-center gap-3"><span className="font-mono text-xs text-[#e6ad55]">{number}</span><h2 className="font-serif text-2xl">{title}</h2></div>{children}</section>; }
function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label className="block text-xs text-[#c8d6c9]">{label}<input className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e6ad55]" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-xs text-[#c8d6c9]">{label}<textarea className="mt-1 min-h-24 w-full resize-y rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e6ad55]" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Button({ children, onClick, disabled, secondary = false }: { children: ReactNode; onClick?: () => void; disabled?: boolean; secondary?: boolean }) { return <button type={onClick ? "button" : "submit"} onClick={onClick} disabled={disabled} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-45 ${secondary ? "border border-white/20 bg-white/10 text-white" : "bg-[#e6ad55] text-[#102e2a]"}`}>{children}</button>; }
function IdLine({ label, value }: { label: string; value: string }) { return <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs"><span className="text-[#8fa99a]">{label}</span><code className="max-w-[70%] truncate text-[#e6ad55]">{value || "-"}</code></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#8fa99a]">{text}</div>; }
function describeError(status: number, body: unknown) {
  if (body && typeof body === "object") {
    const payload = body as { error?: unknown; details?: unknown; message?: unknown };
    const message = typeof payload.error === "string" ? payload.error : typeof payload.message === "string" ? payload.message : "Request gagal";
    const details = payload.details === undefined ? "" : ` | details: ${JSON.stringify(payload.details)}`;
    return `${status}: ${message}${details}`;
  }
  return `${status}: Request gagal tanpa response JSON`;
}
