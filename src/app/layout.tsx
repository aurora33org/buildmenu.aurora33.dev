import type { Metadata } from "next"
import { Inter, Cormorant, Lora } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/shared/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

// Load serif fonts for Elegant template
const cormorant = Cormorant({ subsets: ["latin"], display: "swap", variable: "--font-cormorant" })
const lora = Lora({ subsets: ["latin"], display: "swap", variable: "--font-lora" })

export const metadata: Metadata = {
  title: "Menu Builder - Crea menús digitales para restaurantes",
  description: "Plataforma para crear y gestionar menús digitales de restaurantes",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${lora.variable}`}>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
