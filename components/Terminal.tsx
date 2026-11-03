"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import profile from "@/data/profile.json";
import { setTheme } from "@/lib/useTheme";

/**
 * The hero's showcase: a terminal you can actually use. It types `whoami` and
 * `help` on its own, then hands over. Every answer comes from profile.json.
 * A visually hidden input takes the keystrokes, so mobile keyboards and screen
 * readers work; ↑/↓ walk history and Tab completes.
 */

type Line = { kind: "in" | "out"; text: React.ReactNode };

const { name, about, stack, links, projects } = profile;
const COMMANDS = ["help", "whoami", "about", "projects", "stack", "contact", "resume", "theme", "siuuu", "clear"];

function run(cmd: string): React.ReactNode[] | "clear" {
  const c = cmd.trim().split(/\s+/)[0].toLowerCase();
  switch (c) {
    case "":
      return [];
    case "help":
      return [`commands: ${COMMANDS.join("  ")}`];
    case "whoami":
      return [`${name.display}, ${name.role.toLowerCase()}. ${name.now}, ${name.location}.`];
    case "about":
      return about;
    case "projects":
      return projects.map((p) => `${p.name.padEnd(16)} ${p.blurb.split(". ")[0].replace(/\.$/, "")}.`);
    case "stack":
      return Object.entries(stack).map(([group, items]) => `${group.toLowerCase().padEnd(10)} ${items.join(", ")}`);
    case "contact":
      return links.map((l) => `${l.label.toLowerCase().padEnd(10)} ${l.href.replace("mailto:", "")}`);
    case "resume":
      window.open(profile.resume, "_blank", "noopener");
      return ["opening resume.pdf…"];
    case "theme": {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
      return [`theme: ${next}`];
    }
    case "siu":
    case "siuuu":
      return [
        <span key="siu" className="inline-flex text-accent-text">
          {[..."SIUUUUU"].map((ch, i) => (
            <span key={i} className="siu inline-block" style={{ animationDelay: `${i * 55}ms` }}>
              {ch}
            </span>
          ))}
        </span>,
      ];
    case "sudo":
      return ["nice try."];
    case "clear":
      return "clear";
    default:
      return [`command not found: ${c}. try 'help'`];
  }
}

function exec(cmd: string, setLines: Dispatch<SetStateAction<Line[]>>) {
  const out = run(cmd);
  setLines((ls) => (out === "clear" ? [] : [...ls, { kind: "in", text: cmd }, ...out.map((text) => ({ kind: "out" as const, text }))]));
}

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const intro = useRef<number[]>([]);

  // The intro types itself; any real interaction cancels what's left of it.
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = intro.current;
    let at = 700;
    for (const cmd of ["whoami", "help"]) {
      const speed = reduced ? 0 : 75;
      [...cmd].forEach((_, i) => timers.push(window.setTimeout(() => setValue(cmd.slice(0, i + 1)), at + i * speed)));
      at += cmd.length * speed + (reduced ? 0 : 300);
      timers.push(
        window.setTimeout(() => {
          setValue("");
          exec(cmd, setLines);
        }, at),
      );
      at += reduced ? 0 : 700;
    }
    return () => timers.splice(0).forEach(clearTimeout);
  }, []);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [lines]);

  const takeOver = () => {
    if (!intro.current.length) return;
    intro.current.splice(0).forEach(clearTimeout);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(value, setLines);
      if (value.trim()) setHistory((h) => [value, ...h]);
      setValue("");
      setCursor(-1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(-1, Math.min(history.length - 1, cursor + (e.key === "ArrowUp" ? 1 : -1)));
      setCursor(next);
      setValue(next < 0 ? "" : history[next]);
    } else if (e.key === "Tab") {
      const match = COMMANDS.find((c) => value && c.startsWith(value.toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match);
      }
    }
  };

  const prompt = (
    <span aria-hidden className="select-none">
      <span className="text-accent-text">~</span> <span className="text-foreground-subtle">$</span>{" "}
    </span>
  );

  return (
    <div
      className="card mx-auto w-full max-w-4xl cursor-text overflow-hidden text-left transition-shadow duration-300 focus-within:shadow-[0_0_0_1px_var(--accent),0_24px_48px_-28px_rgb(0_0_0/0.3)]"
      onClick={() => input.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {/* macOS window controls: literal colours, not theme tokens. */}
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center font-mono text-xs text-foreground-subtle">rainz@arch: ~</span>
        <span className="w-12" />
      </div>

      <div
        ref={body}
        aria-live="polite"
        className="h-[19rem] overflow-y-auto px-5 py-4 font-mono text-[0.75rem] leading-relaxed sm:h-[22rem] sm:text-[0.82rem]"
      >
        {lines.map((l, i) =>
          l.kind === "in" ? (
            <p key={i} className="text-heading">
              {prompt}
              {l.text}
            </p>
          ) : (
            <p key={i} className="mb-1 whitespace-pre-wrap text-foreground-muted">
              {l.text}
            </p>
          ),
        )}
        <p className="text-heading">
          {prompt}
          {value}
          <span aria-hidden className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-accent" />
        </p>
      </div>

      <input
        ref={input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        onFocus={takeOver}
        aria-label="Terminal. Type help and press Enter."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="sr-only"
      />
    </div>
  );
}
