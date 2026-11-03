"use client";

import { useEffect, useRef, useState } from "react";
import { useInterval, useTimers, type DemoProps } from "@/components/demos/hooks";

/**
 * SongSpot, small, with real music. A plain <audio> plays local files from
 * public/audio (no third-party requests); the room only shares an anchor
 * (position + when it was set). Play, pause, seek and track changes publish a
 * new anchor; the two simulated listeners receive it after their network lag
 * and work out "now" from it, the clock-offset correction settling to ~0.
 *
 * Opening the demo from the dock is a click, so it starts playing at 15%
 * volume; if a browser still blocks it, Play works. It pauses when scrolled
 * away and stops when you switch apps (the element unmounts).
 */

// CC BY 4.0: each track is credited, with a link, in the list below.
const TRACKS = [
  { src: "/audio/under-the-rain.m4a", title: "Under the Rain", artist: "migfus20", page: "https://opengameart.org/content/under-the-rain-lofi" },
  { src: "/audio/cold-and-rainy.m4a", title: "Cold & Rainy", artist: "Purrple Cat", page: "https://opengameart.org/content/cold-rainy" },
  { src: "/audio/up-all-night.m4a", title: "Up All Night", artist: "Purrple Cat", page: "https://opengameart.org/content/up-all-night-0" },
];
const VOLUME = 15;
const LISTENERS = [
  { name: "ana", lag: 240, err: 96 },
  { name: "kabir", lag: 410, err: 141 },
];

type Anchor = { pos: number; at: number; playing: boolean };
type Seen = { anchor: Anchor; synced: number };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const position = (a: Anchor, now: number) => Math.max(0, a.playing ? a.pos + (now - a.at) / 1000 : a.pos);

export function SongSpot({ live }: DemoProps) {
  const t = useTimers();
  const audio = useRef<HTMLAudioElement>(null);
  const resume = useRef(false); // play once the next track has loaded
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(VOLUME);
  // No Date.now() during render: SSR and hydration must agree, so time starts at 0.
  const [now, setNow] = useState(0);
  const [mine, setMine] = useState({ pos: 0, len: 0 });
  const [server, setServer] = useState<Anchor>({ pos: 0, at: 0, playing: false });
  const [seen, setSeen] = useState<Seen[]>(LISTENERS.map(() => ({ anchor: { pos: 0, at: 0, playing: false }, synced: -1e9 })));

  const publish = (anchor: Anchor) => {
    setServer(anchor);
    LISTENERS.forEach((l, i) =>
      t.later(l.lag, () => setSeen((list) => list.map((s, k) => (k === i ? { anchor, synced: Date.now() } : s)))),
    );
  };

  // Opened from the dock (a click), so sound may start; otherwise wait for Play.
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = VOLUME / 100;
    const clicked = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    if (clicked) a.play().catch(() => {});
  }, []);

  // Scrolled away: pause, and don't resume by surprise.
  useEffect(() => {
    if (!live) audio.current?.pause();
  }, [live]);

  useInterval(() => setNow(Date.now()), live ? 250 : null);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };
  const seek = (pos: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = pos;
    setMine((m) => ({ ...m, pos }));
    publish({ pos, at: Date.now(), playing: !a.paused });
  };
  const pick = (i: number) => {
    resume.current = true;
    setTrack(i);
    setMine({ pos: 0, len: 0 });
  };
  const changeVolume = (v: number) => {
    const a = audio.current;
    setVolume(v);
    if (!a) return;
    a.volume = v / 100;
    if (a.muted && v > 0) {
      a.muted = false;
      setMuted(false);
    }
  };
  const toggleMute = () => {
    const a = audio.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const onState = (on: boolean) => {
    setPlaying(on);
    publish({ pos: audio.current?.currentTime ?? 0, at: Date.now(), playing: on });
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <audio
        ref={audio}
        src={TRACKS[track].src}
        preload="metadata"
        onPlay={() => onState(true)}
        onPause={() => onState(false)}
        onLoadedMetadata={(e) => {
          setMine({ pos: 0, len: e.currentTarget.duration || 0 });
          if (resume.current) {
            resume.current = false;
            e.currentTarget.play().catch(() => {});
          }
        }}
        onTimeUpdate={(e) => setMine({ pos: e.currentTarget.currentTime, len: e.currentTarget.duration || 0 })}
        onEnded={() => pick((track + 1) % TRACKS.length)}
      />

      <div>
        <div className="well flex items-center gap-4 p-4">
          {/* A quiet equaliser: moving while it plays. */}
          <div aria-hidden className="flex h-10 w-10 shrink-0 items-end justify-center gap-[3px] rounded-lg bg-background p-2">
            {[0.6, 1, 0.75, 0.9].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-heading ${playing ? "eq" : ""}`}
                style={{ height: `${h * 100}%`, animationDelay: `${i * 140}ms`, opacity: playing ? 1 : 0.35 }}
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-heading">{TRACKS[track].title}</p>
            <p className="font-mono text-[0.66rem] text-foreground-subtle">
              {TRACKS[track].artist} · {clock(mine.pos)} / {mine.len ? clock(mine.len) : "–:––"}
            </p>
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-1">
          {TRACKS.map((tr, i) => (
            <li key={tr.src} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => pick(i)}
                className={`flex min-w-0 flex-1 items-baseline justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-xs transition-colors duration-300 ${
                  i === track ? "bg-heading text-background" : "text-foreground-muted hover:bg-[var(--inset)] hover:text-heading"
                }`}
              >
                <span className="truncate">{tr.title}</span>
                <span className={`shrink-0 font-mono text-[0.62rem] ${i === track ? "opacity-70" : "text-foreground-subtle"}`}>{tr.artist}</span>
              </button>
              <a
                href={tr.page}
                target="_blank"
                rel="noreferrer"
                title={`${tr.title} by ${tr.artist}, CC BY 4.0`}
                className="shrink-0 px-1 font-mono text-[0.58rem] text-foreground-subtle hover:text-heading"
              >
                CC BY
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={toggle} className="rounded-full bg-heading px-4 py-2 text-xs font-medium text-background">
            {playing ? "Pause for everyone" : "Play for everyone"}
          </button>
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="pill grid h-8 w-8 place-items-center text-heading">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 9v6h4l5 4V5L8 9z" />
              {muted ? <path d="m17 9 4 6m0-6-4 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7" />}
            </svg>
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-20 accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-[var(--inset)] px-3 py-1.5 font-mono text-xs text-heading">room K4M9TQ</span>

        <div className="rounded-xl bg-[var(--inset)] px-3 py-3">
          <div className="flex items-baseline justify-between font-mono text-[0.68rem]">
            <span className="text-heading">you</span>
            <span className="tabular-nums text-foreground-subtle">
              {clock(mine.pos)} / {mine.len ? clock(mine.len) : "–:––"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(mine.len))}
            step={1}
            value={Math.floor(mine.pos)}
            disabled={!mine.len}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek for everyone"
            className="mt-2 w-full accent-[var(--accent)] disabled:opacity-40"
          />
        </div>

        {LISTENERS.map((l, i) => {
          const s = seen[i];
          const pos = Math.min(mine.len || Infinity, position(s.anchor, now));
          const pending = s.anchor !== server;
          const residual = l.err * Math.exp(-Math.max(0, now - s.synced) / 600);
          return (
            <div key={l.name} className="rounded-xl bg-[var(--inset)] px-3 py-3">
              <div className="flex items-baseline justify-between font-mono text-[0.68rem]">
                <span className="text-heading">{l.name}</span>
                <span className="tabular-nums text-foreground-subtle">
                  {clock(pos)} · {pending ? <span className="text-accent-text">syncing…</span> : `±${Math.round(residual)}ms`}
                </span>
              </div>
              <span className="mt-2 block h-1.5 rounded-full bg-background">
                <span
                  className="block h-full rounded-full bg-foreground-subtle transition-[width] duration-200"
                  style={{ width: `${mine.len ? Math.min(100, (pos / mine.len) * 100) : 0}%` }}
                />
              </span>
            </div>
          );
        })}

        <p className="mt-1 font-mono text-[0.64rem] leading-relaxed text-foreground-subtle">
          The room only shares {"{"} pos, at, playing {"}"}; everyone works out &ldquo;now&rdquo; from it.
        </p>
      </div>
    </div>
  );
}
