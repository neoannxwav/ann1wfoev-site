import Link from "next/link";

const drops = [
  {
    label: "Visual edits",
    value: "Process clips, atmosphere cuts, unfinished moods.",
  },
  {
    label: "Music diary",
    value: "Sketches, fragments, and moments around new releases.",
  },
  {
    label: "Archive direction",
    value: "A more open room for the world behind ANN1WFOEV.",
  },
];

export default function BilibiliPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-14 md:py-10">
        <header className="mb-16 flex items-center justify-between text-xs tracking-[0.32em] text-white/70">
          <Link href="/">ANN1WFOEV.COM</Link>
          <span>BILIBILI</span>
        </header>

        <section className="grid gap-16 md:grid-cols-[1fr_0.9fr] md:items-start">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs tracking-[0.35em] text-white/35">02 / CHANNEL</p>
            <h1 className="mb-8 text-4xl font-light tracking-[0.16em] md:text-6xl">
              Bilibili
            </h1>
            <p className="max-w-xl leading-8 text-white/58">
              Not a content feed in the usual sense. More like a moving notebook
              for visuals, edits, and unfinished air around the music.
            </p>
          </div>

          <div className="space-y-5">
            {drops.map((item) => (
              <div key={item.label} className="border border-white/12 px-6 py-5">
                <p className="mb-2 text-[0.68rem] tracking-[0.28em] text-white/38">
                  {item.label}
                </p>
                <p className="leading-7 text-white/62">{item.value}</p>
              </div>
            ))}

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-3 text-xs tracking-[0.3em] text-white/78"
            >
              CHANNEL LINK COMING SOON <span>↗</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
