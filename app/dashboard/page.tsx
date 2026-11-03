"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "../../components/brand-mark";

type Business = {
  name: string;
  category: string;
  location: string | null;
  story: string | null;
};

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/business")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Profil tidak dapat dimuat.");
        setBusiness(result.business);
      })
      .catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : "Terjadi kesalahan."));
  }, []);

  return (
    <main className="dashboard-shell min-h-screen bg-[#f4efe6] text-[#23352d]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="dashboard-sidebar hidden w-64 shrink-0 flex-col p-6 lg:flex">
          <div>
            <BrandMark />
            <p className="mt-3 text-xs text-[#82786b]">Teman marketing usaha</p>
          </div>
          <nav className="mt-12 space-y-2" aria-label="Navigasi utama">
            <Link className="nav-item nav-item-active" href="/dashboard"><span>⌂</span> Beranda</Link>
            <Link className="nav-item" href="/dashboard"><span>✦</span> Buat konten</Link>
            <Link className="nav-item" href="/dashboard"><span>◫</span> Jadwal</Link>
            <Link className="nav-item" href="/dashboard"><span>▦</span> Produk</Link>
          </nav>
          <div className="mt-auto border-t border-[#dfe4dc] pt-5">
            <Link className="nav-item" href="/auth"><span>↪</span> Keluar</Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-6 pb-24 sm:px-8 lg:px-12 lg:py-8 lg:pb-8">
          <header className="flex items-center justify-between border-b border-[#dfe4dc] pb-5 lg:border-0 lg:pb-0">
            <div className="lg:hidden"><BrandMark /><p className="mt-1 text-xs text-[#82786b]">Ruang kerja usaha</p></div>
            <div className="hidden lg:block"><p className="text-sm text-[#66756c]">Senang melihatmu kembali.</p></div>
            <button className="avatar-chip" aria-label="Profil usaha">KM</button>
          </header>

        {error ? (
          <p className="mt-8 rounded-xl bg-[#fbe9e4] p-4 text-sm text-[#9a3d2f]">{error}</p>
        ) : business ? (
          <>
            <section className="dashboard-enter mt-8 flex flex-col justify-between gap-8 md:flex-row md:items-end lg:mt-6">
              <div>
                <p className="text-sm font-medium text-[#b27832]">Selamat datang kembali</p>
                <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-6xl">Halo, {business.name}</h1>
                <p className="mt-4 text-[#66756c]">{business.category}{business.location ? ` · ${business.location}` : ""}</p>
              </div>
              <button className="primary-button max-w-xs">+ Buat konten baru</button>
            </section>

            <section className="mt-10 grid gap-4 sm:grid-cols-3">
              <article className="metric-card"><p>Produk aktif</p><strong>0</strong><span>Tambahkan produk pertama</span></article>
              <article className="metric-card"><p>Konten terbit</p><strong>0</strong><span>Mulai dari satu cerita</span></article>
              <article className="metric-card"><p>Tugas minggu ini</p><strong>1</strong><span>Menunggu langkah kecilmu</span></article>
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-2xl bg-[#1e4034] p-6 text-[#f8f1e5] sm:p-8">
                <p className="text-sm font-medium text-[#e6b86a]">Langkah berikutnya</p>
                <h2 className="mt-4 max-w-lg text-2xl font-semibold sm:text-3xl">Tambahkan produk pertama untuk mulai bercerita.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#d8e2d9]">Foto dan detail produk akan menjadi bahan untuk membuat caption serta konsep poster yang sesuai dengan usaha kamu.</p>
                <button className="mt-8 min-h-12 rounded-xl bg-[#e6b86a] px-5 py-3 text-sm font-bold text-[#23352d] transition hover:bg-[#f0ca82]">Tambah produk</button>
              </article>
              <article className="rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-6 sm:p-7">
                <p className="text-sm font-medium text-[#66756c]">Profil usaha</p>
                <div className="mt-6 space-y-4 text-sm">
                  <div><p className="text-[#88958c]">Kategori</p><p className="mt-1 font-semibold">{business.category}</p></div>
                  <div><p className="text-[#88958c]">Lokasi</p><p className="mt-1 font-semibold">{business.location || "Belum diisi"}</p></div>
                </div>
                <Link className="mt-8 inline-block text-sm font-bold text-[#1e4034] underline-offset-4 hover:underline" href="/auth">Edit profil</Link>
              </article>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-6 sm:p-7">
                <div className="flex items-center justify-between"><p className="text-sm font-medium text-[#b27832]">Tugas minggu ini</p><span className="status-pill">Baru</span></div>
                <h2 className="mt-4 text-xl font-semibold">Ceritakan satu produk yang paling kamu banggakan.</h2>
                <p className="mt-3 text-sm leading-6 text-[#66756c]">Jawab singkat. KriyaMantra akan membantu mengubahnya menjadi bahan cerita.</p>
                <button className="mt-5 text-sm font-bold text-[#1e4034] underline-offset-4 hover:underline">Mulai tugas →</button>
              </article>
              <article className="rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6] p-6 sm:p-7">
                <p className="text-sm font-medium text-[#b27832]">Cerita usaha</p>
                <h2 className="mt-3 text-xl font-semibold">Memori yang akan dipakai KriyaMantra</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#66756c]">{business.story || "Tambahkan cerita usaha agar konten terasa lebih dekat dan khas."}</p>
              </article>
            </section>
          </>
        ) : (
          <p className="mt-12 text-[#66756c]">Memuat ruang kerja...</p>
        )}
        </div>
      </div>
      <nav className="mobile-nav fixed inset-x-4 bottom-4 z-10 flex justify-around rounded-2xl border border-[#dfe4dc] bg-[#fbfaf6]/95 p-2 shadow-lg backdrop-blur lg:hidden" aria-label="Navigasi mobile">
        <Link className="mobile-nav-item mobile-nav-active" href="/dashboard"><span>⌂</span>Beranda</Link>
        <Link className="mobile-nav-item" href="/dashboard"><span>✦</span>Buat</Link>
        <Link className="mobile-nav-item" href="/dashboard"><span>◫</span>Jadwal</Link>
        <Link className="mobile-nav-item" href="/auth"><span>•••</span>Lainnya</Link>
      </nav>
    </main>
  );
}
