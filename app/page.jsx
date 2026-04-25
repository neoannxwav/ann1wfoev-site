"use client";
import { useState } from "react";
import Nav from "@/components/Nav";

export default function Home() {
  const [current, setCurrent] = useState(1);

  return (
    <main className="bg-black text-white min-h-screen p-10">
      {/* 顶部 */}
      <div className="flex justify-between items-center mb-20">
        <div className="text-sm tracking-widest">ANN1WFOEV.COM</div>
        <Nav current={current} setCurrent={setCurrent} />
      </div>

      {/* 内容 */}
      {current === 1 && <Hero />}
      {current === 2 && <NextProject />}
      {current === 3 && <OneW4V />}
    </main>
  );
}
