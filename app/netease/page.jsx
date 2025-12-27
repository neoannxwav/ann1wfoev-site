"use client";

import { Music4, ExternalLink } from "lucide-react";

export default function NeteasePage() {
  const accounts = [
    {
      role: "个人创作账号",
      name: "Ann1wfoev",
      desc: "聚焦独立音乐与自我表达，展现更纯粹的声音与个人风格。",
      link: "https://163cn.tv/Kg6Av5P",
    },
    {
      role: "制作人账号",
      name: "neo1Annx",
      desc: "播放量已破 1亿，收录海量伴奏与合作作品。",
      link: "https://163cn.tv/Kg6Zyn0",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-12 flex items-center gap-3">
          <Music4 className="w-8 h-8 text-red-500" />
          网易云账号
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {accounts.map((acc, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl shadow-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-2">{acc.role}</h2>
              <h3 className="text-2xl font-bold mb-4">{acc.name}</h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6">{acc.desc}</p>
              <a
                href={acc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                前往网易云 <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
