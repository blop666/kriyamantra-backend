"use client";

import { FormEvent, useState } from "react";
import { BrandMark } from "../../components/brand-mark";

type Mode = "signin" | "signup";

type AuthResponse = {
  error?: string;
  details?: string;
  confirmationRequired?: boolean;
};

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<"auth" | "onboarding">("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(result.details ? `${result.error}: ${result.details}` : result.error);
      }

      if (result.confirmationRequired) {
        setMessage("Cek email untuk konfirmasi akun sebelum masuk.");
      } else if (mode === "signin") {
        const profileResponse = await fetch("/api/business");
        const profile = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profile.error ?? "Profil usaha tidak dapat dimuat.");
        }

        window.location.href = profile.business ? "/dashboard" : "/auth?setup=1";
      } else {
        setStep("onboarding");
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      businessName: form.get("businessName"),
      category: form.get("category"),
      location: form.get("location"),
      story: form.get("story"),
      tone: form.get("tone"),
      languages: ["id", "en"],
      consentPolicyVersion: "2026-01",
    };

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(result.details ? `${result.error}: ${result.details}` : result.error);
      }

      setMessage("Profil usaha tersimpan. Fondasi KriyaMantra siap digunakan.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell min-h-screen px-4 py-4 text-[#25231f] sm:px-8 sm:py-8">
      <div className="auth-card mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.03fr_0.97fr]">
        <section className="auth-aside flex flex-col justify-between p-7 text-[#fffaf0] sm:p-12">
          <div>
            <BrandMark dark />
            <p className="eyebrow mt-16">Teman tumbuh untuk karya lokal</p>
            <h1 className="mt-4 max-w-sm font-serif text-4xl font-semibold leading-[1.08] sm:text-6xl">
              Ceritakan karya. Kami bantu memasarkannya.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-[#eadfca]">
              Ruang kerja sederhana untuk perajin Bali membangun cerita, konten, dan kebiasaan marketing.
            </p>
          </div>
          <div className="aside-note"><span>✦</span><p>Mulai dari profil usaha. Tidak perlu langsung menyiapkan semuanya.</p></div>
        </section>

        <section className="auth-panel p-7 sm:p-12 lg:p-16">
          {step === "auth" ? (
            <div className="panel-enter" key={mode}>
              <p className="text-sm font-medium text-[#b27832]">Langkah 01 / 02</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Masuk ke ruang usahamu</h2>
              <p className="mt-3 max-w-md leading-7 text-[#66756c]">Buat akun atau lanjutkan pekerjaan yang sudah tersimpan.</p>

              <div className="mt-8 flex gap-6 border-b border-[#dfe4dc] text-sm font-semibold" role="tablist" aria-label="Jenis akses">
                {(["signup", "signin"] as Mode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setError("");
                      setMessage("");
                    }}
                    role="tab"
                    aria-selected={mode === item}
                    className={`min-h-12 border-b-2 pb-3 transition-colors duration-150 ${mode === item ? "border-[#1e4034] text-[#1e4034]" : "border-transparent text-[#88958c]"}`}
                  >
                    {item === "signup" ? "Buat akun" : "Masuk"}
                  </button>
                ))}
              </div>

              <form className="mt-8 space-y-5" onSubmit={submitAuth}>
                <label className="block text-sm font-semibold">
                  Email
                  <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className="block text-sm font-semibold">
                  Password
                  <input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
                  <span className="mt-2 block text-xs font-normal text-[#88958c]">Minimal 8 karakter.</span>
                </label>
                <button className="primary-button" disabled={isLoading} type="submit">
                  {isLoading ? "Memproses..." : mode === "signup" ? "Mulai membangun profil" : "Masuk ke akun"}
                </button>
              </form>
            </div>
          ) : (
            <div className="panel-enter" key="onboarding">
              <p className="text-sm font-medium text-[#b27832]">Langkah 02 / 02</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Kenalkan usahamu</h2>
              <p className="mt-3 max-w-md leading-7 text-[#66756c]">Jawab singkat. Detail lainnya bisa dilengkapi nanti.</p>

              <form className="mt-8 space-y-5" onSubmit={submitOnboarding}>
                <label className="block text-sm font-semibold">Nama usaha<input className="form-input" name="businessName" placeholder="Contoh: Tenun Sari Dewi" required /></label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">Jenis produk<input className="form-input" name="category" placeholder="Tenun, ukiran, kuliner..." required /></label>
                  <label className="block text-sm font-semibold">Lokasi<input className="form-input" name="location" placeholder="Kabupaten / kota" /></label>
                </div>
                <label className="block text-sm font-semibold">Cerita singkat<textarea className="form-input min-h-28 resize-y" name="story" placeholder="Apa yang membuat karya ini berarti?" /></label>
                <label className="block text-sm font-semibold">Gaya bahasa<textarea className="form-input min-h-20 resize-y" name="tone" placeholder="Hangat, sederhana, dekat dengan pembeli" /></label>
                <button className="primary-button" disabled={isLoading} type="submit">{isLoading ? "Menyimpan..." : "Simpan profil usaha"}</button>
              </form>
            </div>
          )}

          {message && <p className="mt-6 rounded-xl bg-[#e6f0e5] p-4 text-sm leading-6 text-[#28563f]">{message}</p>}
          {error && <p className="mt-6 rounded-xl bg-[#fbe9e4] p-4 text-sm leading-6 text-[#9a3d2f]">{error}</p>}
        </section>
      </div>
    </main>
  );
}
