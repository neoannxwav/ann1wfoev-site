export default function Nav({ current, setCurrent }) {
  const tabs = [
    { id: 1, name: "ANN1WFOEV" },
    { id: 2, name: "NEXT" },
    { id: 3, name: "1W4V AUDIO" },
  ];

  return (
    <nav className="flex flex-wrap gap-6 md:gap-10 text-xs md:text-sm tracking-[0.22em]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrent(tab.id)}
          className={`pb-2 transition ${
            current === tab.id
              ? "text-white border-b border-white"
              : "text-white/40 hover:text-white"
          }`}
        >
          {String(tab.id).padStart(2, "0")} {tab.name}
        </button>
      ))}
    </nav>
  );
}
