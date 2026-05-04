import type { Metadata } from "next"
import { DM_Serif_Display, Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
})

const inter = Inter({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "PUBBY — La tua città, dopo il tramonto",
  description:
    "Scopri i migliori locali, bar e ristoranti della tua città. PUBBY ti guida verso la notte giusta, stasera.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="it"
      className={`${dmSerifDisplay.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-night text-cream antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
