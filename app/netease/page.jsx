"use client";

import { ExternalLink, Music } from "lucide-react";

function AccountCard({ title, name, desc, link }) {
  return (
    <div className="group rounded-2xl border border-zinc-200/40 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-900/60 backdrop-blur p-6 md:p-8 hover:shadow-xl hover:shadow-zinc-900/5 transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 grid place-items-center text-white">
          <Music size={18} />
        </div>
        <div>
          <p className="text-xs tracking-wide text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-lg md:text-xl font-semibold">{name}</h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {desc}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white
                     bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800
                     transition shadow-sm"
        >
          前往网易云
          <ExternalLink size={16} />
        </a>

        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          外部链接 · NetEase Cloud Music
        </span>
      </div>
    </div>
  );
}

export default function NeteasePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="container mx-auto px-4 py-14 md:py-20">
        {/* 顶部标题 */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-2xl md:text-3xl font-bold">网易云账号</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            两个账号用于不同的创作线：个人作品与制作人项目，点击进入对应主页。
          </p>
        </div>

        {/* 卡片列表：个人创作账号放前面 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <AccountCard
            title="个人创作账号"
            name="Ann1wfoev"
            desc="以个人表达为核心，聚焦独立音乐与纯粹乐感的呈现。"
            link="https://163cn.tv/Kg6Av5P"
          />

          <AccountCard
            title="制作人账号"
            name="NEoANNx"
            desc="服务艺人与项目制作，风格深度与声音品牌统一建设。"
            link="https://163cn.tv/Kg6Zyn0"
          />
        </div>

        {/* 返回首页 */}
        <div className="mt-10">
          <a
            href="/#home"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </main>
  );
}
