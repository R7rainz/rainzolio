"use client";

import { useState } from "react";
import { useTimers } from "@/components/demos/hooks";

/**
 * AuraMail, small: three placement emails (invented companies). Opening one
 * streams the extraction field by field, like the real app's SSE updates,
 * highlighting where each value came from; "Add to calendar" marks the
 * deadline on a month view.
 */

type Field = [label: string, value: string, phrase: string];
const MAILS: { subject: string; body: string; fields: Field[]; day: number }[] = [
  {
    subject: "Northwind Labs · SDE Intern · apply by 18 Jul",
    body: "Northwind Labs is hiring Software Development Engineer Interns for the summer. Stipend of ₹1.2L per month. Open to CSE and IT students with a CGPA of 7.5 or above. Register on the portal before 18 July, 11:59 PM.",
    fields: [
      ["company", "Northwind Labs", "Northwind Labs"],
      ["role", "SDE Intern", "Software Development Engineer Interns"],
      ["deadline", "18 Jul, 11:59 PM", "18 July, 11:59 PM"],
      ["ctc", "₹1.2L / month", "₹1.2L per month"],
      ["eligibility", "CSE/IT · CGPA ≥ 7.5", "CSE and IT students with a CGPA of 7.5 or above"],
    ],
    day: 18,
  },
  {
    subject: "Globex Systems · Backend Engineer (full-time)",
    body: "Globex Systems will visit campus for Backend Engineer roles. The package is ₹18 LPA. All branches from the 2027 batch may apply. Last date to register is 22 July, 5:00 PM.",
    fields: [
      ["company", "Globex Systems", "Globex Systems"],
      ["role", "Backend Engineer", "Backend Engineer"],
      ["deadline", "22 Jul, 5:00 PM", "22 July, 5:00 PM"],
      ["ctc", "₹18 LPA", "₹18 LPA"],
      ["eligibility", "All branches · 2027", "All branches from the 2027 batch"],
    ],
    day: 22,
  },
  {
    subject: "Initech · Data Platform Intern",
    body: "Initech is looking for Data Platform Interns. Stipend: ₹60k per month. CSE and ECE students with a CGPA of 8.0 or above are eligible. Apply by 25 July, 10:00 AM.",
    fields: [
      ["company", "Initech", "Initech"],
      ["role", "Data Platform Intern", "Data Platform Interns"],
      ["deadline", "25 Jul, 10:00 AM", "25 July, 10:00 AM"],
      ["ctc", "₹60k / month", "₹60k per month"],
      ["eligibility", "CSE/ECE · CGPA ≥ 8.0", "CSE and ECE students with a CGPA of 8.0 or above"],
    ],
    day: 25,
  },
];

/** The body with each extracted phrase highlighted once its field has arrived. */
function Body({ text, fields, shown }: { text: string; fields: Field[]; shown: number }) {
  const parts: React.ReactNode[] = [];
  let rest = text;
  for (let k = 0; ; k++) {
    const hits = fields
      .map(([, , phrase], i) => ({ i, at: rest.indexOf(phrase), phrase }))
      .filter((h) => h.at >= 0)
      .sort((a, b) => a.at - b.at);
    if (!hits.length) break;
    const h = hits[0];
    parts.push(rest.slice(0, h.at));
    parts.push(
      <mark
        key={k}
        className={`rounded px-0.5 transition-colors duration-500 ${h.i < shown ? "bg-accent-subtle text-heading" : "bg-transparent text-inherit"}`}
      >
        {h.phrase}
      </mark>,
    );
    rest = rest.slice(h.at + h.phrase.length);
  }
  parts.push(rest);
  return <p className="text-sm leading-relaxed text-foreground-muted">{parts}</p>;
}

export function AuraMail() {
  const t = useTimers();
  const [open, setOpen] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [added, setAdded] = useState(false);

  const pick = (i: number) => {
    t.clear();
    setOpen(i);
    setShown(0);
    setAdded(false);
    MAILS[i].fields.forEach((_, k) => t.later(450 * (k + 1), () => setShown(k + 1)));
  };

  const mail = open === null ? null : MAILS[open];
  const done = mail !== null && shown === mail.fields.length;

  return (
    <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[15rem_minmax(0,1fr)]">
      <ul className="flex flex-col gap-1.5">
        {MAILS.map((m, i) => (
          <li key={m.subject}>
            <button
              type="button"
              onClick={() => pick(i)}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors duration-300 ${
                i === open ? "bg-heading text-background" : "bg-[var(--inset)] text-heading hover:bg-accent-subtle"
              }`}
            >
              <span className={`block font-mono text-[0.6rem] uppercase tracking-wider ${i === open ? "opacity-70" : "text-foreground-subtle"}`}>
                placement cell
              </span>
              <span className="mt-0.5 block text-xs leading-snug">{m.subject}</span>
            </button>
          </li>
        ))}
      </ul>

      {!mail ? (
        <div className="well grid min-h-64 place-items-center p-6 text-center text-sm text-foreground-subtle">
          Open an email to extract the opportunity from it.
        </div>
      ) : (
        <div key={open} className="rise flex flex-col gap-4">
          <div className="well p-4">
            <p className="text-sm font-medium text-heading">{mail.subject}</p>
            <div className="mt-2">
              <Body text={mail.body} fields={mail.fields} shown={shown} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div aria-live="polite">
              <p className="font-mono text-[0.62rem] uppercase tracking-wider text-foreground-subtle">
                {done ? "extracted · 5 fields" : "ai extract · streaming over SSE…"}
              </p>
              <dl className="mt-2 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-y-1.5 text-xs">
                {mail.fields.slice(0, shown).map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="rise font-mono text-foreground-subtle">{label}</dt>
                    <dd className="rise text-heading">{value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                disabled={!done || added}
                onClick={() => setAdded(true)}
                className="mt-4 rounded-full bg-heading px-4 py-2 text-xs font-medium text-background disabled:opacity-40"
              >
                {added ? "Added to calendar ✓" : "Add to calendar"}
              </button>
            </div>

            <div aria-label="July" className="well grid w-fit grid-cols-7 gap-1 p-3 font-mono text-[0.6rem] text-foreground-subtle">
              {Array.from({ length: 31 }, (_, d) => d + 1).map((d) => (
                <span
                  key={d}
                  style={d === 1 ? { gridColumnStart: 3 } : undefined}
                  className={`grid h-6 w-6 place-items-center rounded-md transition-all duration-500 ${
                    added && d === mail.day ? "scale-110 bg-accent text-background" : ""
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
