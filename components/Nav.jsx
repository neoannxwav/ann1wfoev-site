export default function Nav({ current, setCurrent }) {
  const tabs = [
    { id: 1, name: "ANN1WFOEV" },
    { id: 2, name: "NEXT" },
    { id: 3, name: "1W4V AUDIO" },
  ];

  return (
    <div className="flex gap-10 text-sm tracking-widest">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setCurrent(tab.id)}
          className={`cursor-pointer ${
            current === tab.id
              ? "text-white border-b border-white pb-1"
              : "text-gray-500"
          }`}
        >
          {String(tab.id).padStart(2, "0")} {tab.name}
        </div>
      ))}
    </div>
  );
}
