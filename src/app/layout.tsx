import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/shared/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
