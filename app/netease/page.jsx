export const metadata = {
  title: "网易云 | Ann1wfoev / NEoANNx",
};

export default function NeteasePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10">网易云账号</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 制作人账号 Ann1wfoev */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition">
            <h2 className="text-2xl font-semibold mb-2">制作人账号 · Ann1wfoev</h2>
            <p className="text-zinc-400 mb-4">
              播放量已破 <span className="text-white font-bold">8000万</span>，收录海量伴奏与合作作品。
            </p>
            <a
              href="https://163cn.tv/Kg6Av5P"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              前往网易云
            </a>
          </div>

          {/* 个人创作账号 NEoANNx */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition">
            <h2 className="text-2xl font-semibold mb-2">个人创作账号 · NEoANNx</h2>
            <p className="text-zinc-400 mb-4">
              聚焦独立音乐与自我表达，展现更纯粹的声音与个人风格。
            </p>
            <a
              href="https://163cn.tv/Kg6Zyn0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              前往网易云
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
