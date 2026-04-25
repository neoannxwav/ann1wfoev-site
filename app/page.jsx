"use client";
import { useState } from "react";
import Nav from "../components/Nav";

export default function Home() {
  const [current, setCurrent] = useState(1);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative min-h-screen px-6 py-7 md:px-14 md:py-10">
        <Background />

        <header className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-xs tracking-[0.32em] text-white/80">
            ANN1WFOEV.COM
          </div>
          <Nav current={current} setCurrent={setCurrent} />
        </header>

        <div className="relative z-20">
          {current === 1 && <Hero />}
          {current === 2 && <NextProject />}
          {current === 3 && <OneW4V />}
        </div>
      </div>
    </main>
  );
}

function Background() {
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute top-1/2 left-[58%] -translate-y-1/2 h-[92vh] w-auto object-contain opacity-70 md:opacity-78"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/72 to-black/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-transparent to-black/35" />
    </>
  );
}

function Hero() {
  return (
   <section className="min-h-[72vh] md:min-h-[78vh] flex flex-col justify-center max-w-xl pt-10 md:pt-0">
   <h1 className="text-[2.35rem] sm:text-[3rem] md:text-[5.6rem] leading-none font-light tracking-[0.08em] md:tracking-[0.12em] mb-6">
        ANN1WFOEV
      </h1>

      <p className="text-sm md:text-base tracking-[0.35em] text-white/70 mb-7">
        ARTIST / PRODUCER
      </p>

      <div className="w-12 h-px bg-white/60 mb-7" />

      <p className="text-sm md:text-base text-white/55 tracking-[0.08em] mb-16">
        one way forever
      </p>

      <div className="grid grid-cols-1 gap-4 text-xs md:text-sm tracking-[0.18em] text-white/80 max-w-xs">
        <a href="#" className="flex justify-between hover:text-white transition">
          INSTAGRAM <span>↗</span>
        </a>
        <a href="#" className="flex justify-between hover:text-white transition">
          SPOTIFY <span>↗</span>
        </a>
        <a href="#" className="flex justify-between hover:text-white transition">
          YOUTUBE <span>↗</span>
        </a>
        <a href="#" className="flex justify-between hover:text-white transition">
          SOUNDCLOUD <span>↗</span>
        </a>
        <a href="#" className="flex justify-between hover:text-white transition">
          CONTACT <span>↗</span>
        </a>
      </div>
    </section>
  );
}

function NextProject() {
  return (
    <section className="min-h-[78vh] flex flex-col justify-center max-w-2xl">
      <p className="text-xs tracking-[0.35em] text-white/40 mb-5">02</p>
      <h2 className="text-4xl md:text-6xl font-light tracking-[0.18em] mb-8">
        NEXT PROJECT
      </h2>
      <p className="text-white/55 tracking-[0.2em]">COMING SOON</p>
    </section>
  );
}

function OneW4V() {
  return (
    <section className="min-h-[78vh] flex flex-col justify-center max-w-2xl">
      <p className="text-xs tracking-[0.35em] text-white/40 mb-5">03</p>
      <h2 className="text-4xl md:text-6xl font-light tracking-[0.16em] mb-8">
        1W4V AUDIO
      </h2>

      <p className="text-white/60 leading-8 mb-10 max-w-xl">
        1W4V Audio is an evolving sound platform built around music production,
        sonic identity and artist-focused design.
      </p>

      <div className="space-y-4 text-sm tracking-[0.18em] text-white/75">
        <p>Custom Beats</p>
        <p>Vocal Production</p>
        <p>Mixing</p>
        <p>Sound Design</p>
      </div>
    </section>
  );
}
