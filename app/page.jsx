"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";

const contactValue = "NeoAnnx1wfoev";

export default function Home() {
  const [current, setCurrent] = useState(1);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (contactRef.current && !contactRef.current.contains(event.target)) {
        setContactOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setContactOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleToggleContact(event) {
    event.preventDefault();
    setContactOpen((open) => !open);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative min-h-screen px-6 py-7 md:px-14 md:py-10">
        <Background />

        <header className="relative z-20 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs tracking-[0.32em] text-white/80">
            ANN1WFOEV.COM
          </div>
          <Nav current={current} setCurrent={setCurrent} />
        </header>

        <div className="relative z-20">
          {current === 1 && (
            <Hero
              contactOpen={contactOpen}
              contactRef={contactRef}
              onToggleContact={handleToggleContact}
            />
          )}
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
      <img
        src="/hero.jpg"
        alt=""
        className="absolute left-[58%] top-1/2 z-0 hidden h-[92vh] w-auto -translate-y-1/2 object-contain opacity-78 md:block"
      />

      <img
        src="/hero.jpg"
        alt=""
        className="absolute left-1/2 top-[48%] z-0 h-auto w-[82vw] -translate-x-1/2 -translate-y-1/2 object-contain opacity-45 md:hidden"
      />

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/72 to-black/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-transparent to-black/35" />
    </>
  );
}

function Hero(props) {
  return (
    <>
      <section className="flex min-h-[68vh] flex-col justify-center pt-8 md:hidden">
        <HeroCopy mobile />
        <SocialLinks mobile {...props} />
      </section>

      <section className="hidden min-h-[78vh] max-w-xl flex-col justify-center md:flex">
        <HeroCopy />
        <SocialLinks {...props} />
      </section>
    </>
  );
}

function HeroCopy({ mobile = false }) {
  return (
    <>
      <h1
        className={
          mobile
            ? "mb-6 text-[2.25rem] font-light leading-none tracking-[0.04em]"
            : "mb-6 text-[5.6rem] font-light leading-none tracking-[0.12em]"
        }
      >
        ANN1WFOEV
      </h1>

      <p
        className={
          mobile
            ? "mb-4 text-[0.9rem] font-semibold tracking-[0.18em] text-white/82"
            : "mb-4 text-[1.15rem] font-semibold tracking-[0.22em] text-white/82"
        }
      >
        neo1Annx
      </p>

      <p
        className={
          mobile
            ? "mb-6 text-[0.72rem] tracking-[0.26em] text-white/70"
            : "mb-7 text-base tracking-[0.35em] text-white/70"
        }
      >
        ARTIST / PRODUCER
      </p>

      <div className={mobile ? "mb-6 h-px w-12 bg-white/60" : "mb-7 h-px w-12 bg-white/60"} />

      <p
        className={
          mobile
            ? "mb-12 text-sm tracking-[0.08em] text-white/55"
            : "mb-16 text-base tracking-[0.08em] text-white/55"
        }
      >
        one way forever
      </p>
    </>
  );
}

function SocialLinks({ mobile = false, contactOpen, contactRef, onToggleContact }) {
  const containerClass = mobile
    ? "space-y-5 text-xs tracking-[0.2em] text-white/80"
    : "grid max-w-xs grid-cols-1 gap-4 text-sm tracking-[0.18em] text-white/80";
  const linkClass = mobile
    ? "flex justify-between"
    : "flex justify-between transition hover:text-white";
  const popupClass = mobile
    ? "mt-3 border border-white/14 bg-black/92 px-4 py-3"
    : "absolute left-0 top-full mt-3 min-w-[18rem] border border-white/14 bg-black/92 px-4 py-3 backdrop-blur";

  return (
    <div className={containerClass}>
      <a href="#" className={linkClass}>
        INSTAGRAM <span>↗</span>
      </a>

      <Link href="/netease" className={linkClass}>
        网易云 <span>↗</span>
      </Link>

      <Link href="/bilibili" className={linkClass}>
        Bilibili <span>↗</span>
      </Link>

      <Link href="/audio-lab" className={linkClass}>
        AUDIO LAB <span>↗</span>
      </Link>

      <a href="#" className={linkClass}>
        SOUNDCLOUD <span>↗</span>
      </a>

      <div ref={contactRef} className={mobile ? "relative" : "relative w-full"}>
        <button
          type="button"
          onClick={onToggleContact}
          className={`${linkClass} w-full bg-transparent text-left`}
        >
          CONTACT <span>{contactOpen ? "−" : "↗"}</span>
        </button>

        {contactOpen && (
          <div className={popupClass}>
            <p className="mb-2 text-[0.62rem] tracking-[0.2em] text-white/38">
              Wechat
            </p>
            <p className="text-[0.72rem] tracking-[0.18em] text-white/82">
              v: {contactValue}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NextProject() {
  return (
    <section className="min-h-[78vh] max-w-2xl flex-col justify-center md:flex">
      <h2 className="mb-8 text-4xl font-light tracking-[0.18em] md:text-6xl">
        NEXT PROJECT
      </h2>
      <p className="mb-8 text-4xl font-light tracking-[0.18em] md:text-6xl">
        EP/Aphrosole
      </p>
      <p className="tracking-[0.2em] text-white/55">COMING SOON</p>
    </section>
  );
}

function OneW4V() {
  return (
    <section className="min-h-[78vh] max-w-2xl flex-col justify-center md:flex">
      <h2 className="mb-8 text-4xl font-light tracking-[0.16em] md:text-6xl">
        1W4V AUDIO
      </h2>

      <div className="mb-10 max-w-xl space-y-5 text-white/60">
        <p className="leading-8">1W4V Audio 构建艺术家的声音身份。</p>
        <p className="leading-8">
          定制伴奏、人声制作、混音、声音设计——强调清晰度、质感与独特性。
        </p>
      </div>

      <div className="space-y-6 text-white/75">
        <div className="space-y-2">
          <p className="text-sm tracking-[0.18em]">Custom Beats</p>
          <p className="text-sm leading-7 text-white/52">围绕你的声音与方向构建</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm tracking-[0.18em]">Vocal Production</p>
          <p className="text-sm leading-7 text-white/52">编排、修音与人声质感</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm tracking-[0.18em]">Mixing</p>
          <p className="text-sm leading-7 text-white/52">干净、平衡、现代</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm tracking-[0.18em]">Sound Design</p>
          <p className="text-sm leading-7 text-white/52">定义声音的细节</p>
        </div>
      </div>
    </section>
  );
}
