"use client";
import Nav from "../components/Nav";
import { ArrowRight, PlayCircle, Music4, Palette, PenTool, Headphones, Mail, Link as LinkIcon, ExternalLink, Star, Sparkles } from "lucide-react";
import "./globals.css";

const services = [
  { icon: <Music4 className="w-6 h-6" />,  title: "定制伴奏 / Custom Beats", desc: "UDG / Y2K / Emo / Alt-Pop：风格细分、编曲到母带的一体化交付", bullets: ["商用授权","专属音色设计","交付 Stems/Project"]},
  { icon: <Headphones className="w-6 h-6" />, title: "人声制作 / Vocal Production", desc: "录音指导、自动/手动调音、混音与母带", bullets: ["参考审美对齐","快速迭代","Demo→Master"]},
  { icon: <PenTool className="w-6 h-6" />, title: "填词与概念 / Writing & Concept", desc: "Hook 导向、品牌化叙事、跨中英创作", bullets: ["词曲共创","企划/视觉走向","发行策略建议"]},
  {icon: <Palette className="w-6 h-6" />,title: "艺人品牌 / Artist Branding",desc: "打造独特的艺术声音，从视觉到声音的完整统一，塑造你的专属艺术产品。",bullets: ["独家 音色包/鼓包/MIDI Loop Kit", "个人品牌构建", "定制化投放与宣传素材"]}
},
];
const works = [
  { cover: "/falling.jpg", title: "Single · falling heart", link: "#" },
  { cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop", title: "Beat Pack · Road to Never", link: "#" },
  { cover: "https://images.unsplash.com/photo-1518365050014-70fe7232897f?q=80&w=1200&auto=format&fit=crop", title: "Type Beats · Lazy / Jerk", link: "#" },
  { cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop", title: "EPK · NEoANNx", link: "#" },
];

function Badge({ children }) {
  return <span className="badge"><Sparkles className="w-3 h-3"/>{children}</span>;
}
function Button({ children, href, variant="primary", className="" }) {
  const base = "btn";
  const styles = { primary: "btn-primary", secondary: "btn-secondary", ghost: "btn-ghost" };
  return <a href={href} className={`${base} ${styles[variant]} ${className}`}>{children}</a>;
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <Nav />

      {/* Hero */}
      <section id="home" className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge>Producer · Artist · Writer</Badge>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-tight">
                Ann1wfoev / NEoANNx
                <span className="block text-zinc-500 dark:text-zinc-400 text-xl sm:text-2xl mt-3">One Way Forever · Road to Never</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-300">
                专注 UDG / Y2K / Emo / Alt-Pop 的<strong>伴奏定制、录混母带、叙事概念</strong>与<strong>艺人品牌</strong>。让你的声音具备辨识度与商业落地性。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#services" className="rounded-2xl"><ArrowRight className="w-4 h-4 mr-1"/>查看服务</Button>
                <Button href="#works" variant="secondary" className="rounded-2xl"><PlayCircle className="w-4 h-4 mr-1"/>试听作品</Button>
                <Button href="#contact" variant="ghost" className="rounded-2xl"><Mail className="w-4 h-4 mr-1"/>获取报价</Button>
              </div>
              <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
                已合作：独立音乐人 / 内容创作者 / 小型厂牌 · 快速交付 · 版权清晰
              </div>
            </div>
            <div className="relative">
              <img className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/5]" src="/falling.jpg" alt="Hero" />
              <div className="absolute -bottom-4 -right-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl p-4 shadow">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Next Drop</div>
                <div className="font-semibold">“falling heart” Preview</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section bg-zinc-50/60 dark:bg-zinc-950/40">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold">服务与定价思路 <span className="text-zinc-500">Services</span></h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-2xl">以下为标准包，可按需求定制。下单前将进行 15–20 分钟的需求访谈，锁定风格、参考曲与交付节奏。</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(s => (
              <div key={s.title} className="card">
                <div className="flex items-center gap-2 text-base font-semibold">{s.icon}<span>{s.title}</span></div>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{s.desc}</p>
                <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {s.bullets.map((b,i)=><li key={i}>{b}</li>)}
                </ul>
                <div className="mt-4">
                  <a href="#contact" className="inline-flex items-center text-sm font-medium hover:underline">获取报价 <ExternalLink className="w-3 h-3 ml-1"/></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works */}
      <section id="works" className="section">
        <div className="container">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">代表作品 <span className="text-zinc-500">Selected Works</span></h2>
            <a className="text-sm hover:underline inline-flex items-center" href="#" title="更多作品">Beatstore <LinkIcon className="w-3 h-3 ml-1"/></a>
          </div>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {works.map(w => (
              <a key={w.title} href={w.link} className="group block">
                <div className="overflow-hidden rounded-2xl">
                  <img src={w.cover} alt={w.title} className="aspect-[4/5] w-full object-cover group-hover:scale-105 transition"/>
                </div>
                <div className="mt-3 text-sm font-medium flex items-center justify-between">
                  <span>{w.title}</span><ExternalLink className="w-3 h-3"/>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section">
        <div className="container grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">关于 Ann1wfoev / NEoANNx <span className="text-zinc-500">About</span></h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              作为 Ann1wfoev（艺人）与 NEoANNx（制作人），我将“Road to Never”的哲学母题融入音乐，追求<strong>听不到的声音</strong>与<strong>干净的层次</strong>。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>• 擅长：UDG / Y2K / Emo / Alt-Pop / Indie-R&B</li>
              <li>• 常用：FL Studio / Studio One</li>
              <li>• 流程：需求访谈 → Demo 对齐 → 制作与迭代 → 交付与授权</li>
            </ul>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <div className="text-base font-semibold mb-2">品牌关键词</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {["One Way Forever","Road to Never","存在主义","Hook 识别度","快速交付"].map(k=>(
                  <Badge key={k}>{k}</Badge>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="text-base font-semibold mb-2">电子媒体包（EPK）</div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">将作品、头像、简介、舞台照、联系方式打包，便于投递/谈合作。</p>
              <div className="mt-3">
                <a className="inline-flex items-center text-sm font-medium hover:underline" href="#">下载示例 <ExternalLink className="w-3 h-3 ml-1"/></a>
              </div>
            </div>
          </div>
        </div>
      </section>

   {/* Contact */}
<section id="contact" className="section bg-zinc-50/60 dark:bg-zinc-950/40">
  <div className="container">
    <h2 className="text-2xl sm:text-3xl font-bold">
      联系与报价 <span className="text-zinc-500">Contact</span>
    </h2>
    <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-2xl">
      交付：WAV/MP3、Stems、可选工程文件 · 版权模式：独家/非独家/买断 · 修改轮次：2–3 次（大改另计）。
    </p>

    <div className="mt-6 flex flex-wrap gap-3 text-sm">
      {/* 发邮件 */}
      <a
        className="px-4 py-2 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        href="mailto:lailuxu503@gmail.com"
      >
        发邮件
      </a>

      {/* Instagram */}
      <a
        className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
        href="https://instagram.com/你的账号"
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram
      </a>

      {/* WeChat：点击复制微信号 */}
      <button
        className="px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
        onClick={() => {
          const id = 'NeoAnnx1wfoev';
          navigator.clipboard?.writeText(id);
          alert('已复制微信号：' + id);
        }}
      >
        WeChat
      </button>

      {/* Link-in-bio */}
      <a
        className="px-4 py-2 rounded-2xl hover:opacity-80"
        href="https://你的linkinbio地址"
        target="_blank"
        rel="noopener noreferrer"
      >
        Link-in-bio
      </a>
    </div>
  </div>
</section>


      <footer className="py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Ann1wfoev / NEoANNx. One Way Forever.
      </footer>
    </div>
  );
}
