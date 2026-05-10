import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Galeria ESTA | Sztuka Współczesna | Gliwice",
  description:
    "Galeria Sztuki Współczesnej ESTA w Gliwicach. 28 lat prezentacji najważniejszych zjawisk sztuki współczesnej w Polsce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${cormorant.variable} ${instrument.variable}`}>
        {children}
      </body>
    </html>
  );
}
