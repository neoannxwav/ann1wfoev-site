import Link from "next/link";

const accounts = [
  {
    role: "Artist profile",
    name: "Ann1wfoev",
    desc: "个人作品",
    link: "https://163cn.tv/5PDHnrb",
  },
  {
    role: "Producer profile",
    name: "neo1Annx",
    desc: "海量伴奏与制作案例",
    link: "https://163cn.tv/5PDL3fu",
  },
];

export default function NeteasePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-14 md:py-10">
        <header className="mb-16 flex items-center justify-between text-xs tracking-[0.32em] text-white/70">
          <Link href="/">ANN1WFOEV.COM</Link>
          <span>NETEASE</span>
        </header>

        <section className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="max-w-md">
            <p className="mb-5 text-xs tracking-[0.35em] text-white/35">01 / ENTRY</p>
            <h1 className="mb-8 text-4xl font-light tracking-[0.16em] md:text-6xl">
              网易云
            </h1>
          </div>

          <div className="grid gap-6">
            {accounts.map((account) => (
              <a
                key={account.name}
                href={account.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-white/12 bg-white/[0.03] p-7 transition hover:border-white/28 hover:bg-white/[0.05]"
              >
                <p className="mb-4 text-[0.68rem] tracking-[0.28em] text-white/40">
                  {account.role}
                </p>
                <h2 className="mb-4 text-2xl font-light tracking-[0.12em] md:text-3xl">
                  {account.name}
                </h2>
                <p className="max-w-lg leading-7 text-white/55">{account.desc}</p>
                <div className="mt-8 flex items-center justify-between text-xs tracking-[0.28em] text-white/72">
                  <span>OPEN PROFILE</span>
                  <span className="transition group-hover:translate-x-1">↗</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
