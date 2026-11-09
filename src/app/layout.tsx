import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "IDOL SNAP CLUB · 4 CUT PHOTOBOOTH", description: "Take four pictures with your favourite member." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
