"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function Home() {
  const [current, setCurrent] = useState(1);

  return (
    <main className="bg-black text-white min-h-screen p-10">
      <div className="flex justify-between items-center mb-20">
        <div className="text-sm tracking-widest">ANN1WFOEV.COM</div>
        <Nav current={current} setCurrent={setCurrent} />
      </div>

      {current === 1 && <Hero />}
      {current === 2 && <NextProject />}
      {current === 3 && <OneW4V />}
    </main>
  );
}

function Hero() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-6xl font-light tracking-widest mb-6">
          ANN1WFOEV
        </h1>
        <p className="text-gray-400 mb-2">ARTIST / PRODUCER</p>
        <p className="text-gray-600 text-sm mb-10">one way forever</p>

        <div className="space-y-3 text-sm">
          <p>Instagram ↗</p>
          <p>Spotify ↗</p>
          <p>YouTube ↗</p>
          <p>SoundCloud ↗</p>
          <p>Apple Music ↗</p>
          <p>Contact ↗</p>
        </div>
      </div>

      <img src="/hero.jpg" className="w-[40%] object-cover" />
    </div>
  );
}

function NextProject() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-3xl mb-6">NEXT PROJECT</h2>
      <div className="w-60 h-60 bg-gray-800 mb-4"></div>
      <p className="text-gray-400">COMING SOON</p>
    </div>
  );
}

function OneW4V() {
  return (
    <div className="max-w-xl">
      <h2 className="text-3xl mb-6">1W4V AUDIO</h2>
      <p className="text-gray-400 mb-6">
        1W4V Audio is an evolving sound platform built around music production,
        sonic identity and artist-focused design.
      </p>

      <div className="space-y-2 text-sm text-gray-300">
        <p>• Custom Beats</p>
        <p>• Vocal Production</p>
        <p>• Mixing</p>
        <p>• Sound Design</p>
      </div>
    </div>
  );
}
