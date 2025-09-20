export default function Nav(){
  const items = [
    { name: "主页 Home", href: "#home" },
    { name: "服务 Services", href: "#services" },
    { name: "作品 Works", href: "#works" },
    { name: "关于 About", href: "#about" },
    { name: "网易云 Netease", href: "/netease" }, 
    { name: "联系 Contact", href: "#contact" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/50">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="flex items-center gap-2 font-semibold tracking-wide">
            <div className="h-7 w-7 rounded-xl bg-zinc-900 dark:bg-white" />
            <span>Ann1wfoev / NEoANNx</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {items.map(i => <a key={i.name} href={i.href} className="hover:opacity-80">{i.name}</a>)}
          </nav>
          <a
  href="/netease"
  className="ml-4 px-4 py-2 rounded-2xl font-medium text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition"
>
  网易云
</a>

          <a href="#contact" className="btn btn-primary rounded-2xl">洽谈项目</a>
        </div>
      </div>
    </header>
  );
}
