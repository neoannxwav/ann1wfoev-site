export default function Nav({ current, setCurrent }) {
  const tabs = [
    { id: 1, name: "ANN1WFOEV" },
    { id: 2, name: "NEXT" },
    { id: 3, name: "1W4V AUDIO" },
  ];

  return (
    <nav className="grid grid-cols-3 gap-4 md:flex md:flex-wrap md:gap-10 text-[0.68rem] md:text-sm tracking-[0.18em] md:tracking-[0.22em]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrent(tab.id)}
          className={`text-left pb-2 transition whitespace-nowrap ${
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
