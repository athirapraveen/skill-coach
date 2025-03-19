import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "./blue-theme.css"

export const metadata: Metadata = {
  title: "Skill Coach",
  description: "Master any skill with personalized learning roadmaps",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'