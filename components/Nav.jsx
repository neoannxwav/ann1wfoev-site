export default function Nav({ current, setCurrent }) {
  const tabs = [
    { id: 1, name: "ANN1WFOEV" },
    { id: 2, name: "NEXT" },
    { id: 3, name: "1W4V AUDIO" },
  ];

  return (
    <nav className="flex flex-wrap gap-5 md:gap-10 text-xs md:text-sm tracking-widest">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrent(tab.id)}
          className={`pb-2 transition ${
            current === tab.id
              ? "text-white border-b border-white"
              : "text-gray-500 hover:text-white"
          }`}
        >
          {String(tab.id).padStart(2, "0")} {tab.name}
        </button>
      ))}
    </nav>
  );
}
