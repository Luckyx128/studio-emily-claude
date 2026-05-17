import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
})

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Studio Emily — Agendamento',
  description: 'Agende seu horário no Studio Emily',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-screen" style={{ background: 'var(--cream)' }}>
        <SessionProvider session={session}>
          <Nav />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
