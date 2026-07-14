import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Space Grotesk: geometric with odd, characterful details — reads as designed
// rather than default. JetBrains Mono: the terminal half of the identity.
// Names deliberately differ from Tailwind's --font-sans / --font-mono theme
// keys; reusing those would make the @theme mapping reference itself.
const sans = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ronak Kamboj — Developer",
  description:
    "Computer Science student at VIT Bhopal. Fedora KDE user who builds things for the web.",
};

// Runs before first paint so a stored dark theme never flashes light.
// Defaults to light when nothing is stored — the OS preference is deliberately
// ignored; the toggle is the only thing that decides.
const BOOT_THEME = `
try {
  var t = localStorage.getItem('rainz-theme');
  document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light';
} catch (e) {
  document.documentElement.dataset.theme = 'light';
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
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
