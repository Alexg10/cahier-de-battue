import { Barlow, Barlow_Condensed } from "next/font/google";

/** Typo du texte courant de la vitrine. */
export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

/** Typo des titres de la vitrine (condensée, signalétique « extérieur »). */
export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});
