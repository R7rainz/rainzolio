import type { Metadata } from "next";
import { Google_Sans, Google_Sans_Code } from "next/font/google";
import "./globals.css";

// Google Sans for everything readable: geometric, calm, and it tracks tight at
// display sizes. Google Sans Code for labels, stats, and diagrams.
// Names deliberately differ from Tailwind's --font-sans / --font-mono theme
// keys; reusing those would make the @theme mapping reference itself.
const sans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Google_Sans_Code({
  variable: "--font-google-sans-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ronak Kamboj — Full-stack Developer",
  description:
    "Full-stack developer building with React, Next.js, Go, Node.js, PostgreSQL, Redis, and Kafka. Currently a full-stack intern at InboxKit.",
};

// Runs before first paint so a stored theme never flashes the other palette,
// and so scroll reveals start hidden instead of popping out of view.
// No stored choice: follow the system. If storage throws, no data-theme is set
// and the CSS falls back to the system preference on its own.
const BOOT_THEME = `
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('reveal-on');
try {
  var t = localStorage.getItem('rainz-theme');
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_THEME }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
