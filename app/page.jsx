"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function Home() {
  const [current, setCurrent] = useState(1);

  return (
    <main className="min-h-screen bg-black text-white px-5 py-6 md:px-12 md:py-10 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 md:mb-20">
        <div className="text-xs tracking-[0.25em] text-gray-300">
          ANN1WFOEV.COM
        </div>
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
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center min-h-[70vh]">
      <div className="order-2 md:order-1">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.12em] mb-5">
          ANN1WFOEV
        </h1>
        <p className="text-gray-400 tracking-[0.22em] mb-5">
          ARTIST / PRODUCER
        </p>
        <p className="text-gray-500 text-sm mb-12">one way forever</p>

        <div className="space-y-4 text-sm tracking-widest text-gray-200">
          <p>Instagram ↗</p>
          <p>Spotify ↗</p>
          <p>YouTube ↗</p>
          <p>SoundCloud ↗</p>
          <p>Apple Music ↗</p>
          <p>Contact ↗</p>
        </div>
      </div>

      <div className="order-1 md:order-2 w-full">
        <img
          src="/hero.jpg"
          alt="Ann1wfoev"
          className="w-full max-h-[72vh] object-contain md:object-cover"
        />
      </div>
    </section>
  );
}

function NextProject() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h2 className="text-3xl md:text-5xl font-light tracking-[0.18em] mb-8">
        NEXT PROJECT
      </h2>
      <div className="w-64 h-64 md:w-80 md:h-80 bg-neutral-900 border border-neutral-800 mb-6" />
      <p className="text-gray-500 tracking-widest">COMING SOON</p>
    </section>
  );
}

function OneW4V() {
  return (
    <section className="max-w-2xl min-h-[70vh] flex flex-col justify-center">
      <h2 className="text-3xl md:text-5xl font-light tracking-[0.18em] mb-8">
        1W4V AUDIO
      </h2>

      <p className="text-gray-400 leading-8 mb-8">
        1W4V Audio is an evolving sound platform built around music production,
        sonic identity and artist-focused design.
      </p>

      <div className="space-y-3 text-sm text-gray-300 tracking-widest">
        <p>• Custom Beats</p>
        <p>• Vocal Production</p>
        <p>• Mixing</p>
        <p>• Sound Design</p>
      </div>
    </section>
  );
}
