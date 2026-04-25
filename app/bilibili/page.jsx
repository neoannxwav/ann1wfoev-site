import Link from "next/link";

export default function BilibiliPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-14 md:py-10">
        <header className="mb-16 flex items-center justify-between text-xs tracking-[0.32em] text-white/70">
          <Link href="/">ANN1WFOEV.COM</Link>
          <span>BILIBILI</span>
        </header>

        <section className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="max-w-md">
            <p className="mb-5 text-xs tracking-[0.35em] text-white/35">02</p>
            <h1 className="mb-8 text-4xl font-light tracking-[0.16em] md:text-6xl">
              Bilibili
            </h1>
            <p className="leading-8 text-white/58">海量伴奏试听</p>
          </div>

          <div className="grid gap-6">
            <div className="border border-white/12 bg-white/[0.03] p-7">
              <p className="mb-4 text-[0.68rem] tracking-[0.28em] text-white/40">
                Channel link
              </p>
              <h2 className="mb-4 text-2xl font-light tracking-[0.12em] md:text-3xl">
                neo1Annx
              </h2>
              <p className="max-w-lg leading-7 text-white/55">
                伴奏试听
              </p>
              <a
                href="https://b23.tv/CHMjUht"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-between text-xs tracking-[0.28em] text-white/72 transition hover:text-white"
              >
                <span>OPEN CHANNEL</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
