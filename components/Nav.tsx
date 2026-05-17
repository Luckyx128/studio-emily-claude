'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export function Nav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN'

  return (
    <nav style={{ background: 'var(--darker)', height: 56 }}
      className="px-8 flex items-center justify-between">
      <span style={{ fontFamily: 'var(--font-playfair)', color: 'var(--blush)', fontSize: 20, letterSpacing: 1 }}>
        Studio Emily
      </span>

      <div className="flex gap-1 items-center">
        <NavTab href="/" active={pathname === '/'}>Agendar</NavTab>

        {isAdmin && (
          <NavTab href="/gerenciar" active={pathname === '/gerenciar'}>Gerenciar</NavTab>
        )}

        {isAdmin ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="ml-2 cursor-pointer"
            style={{
              background: 'none', border: 'none',
              color: 'var(--rose)', fontSize: 13, letterSpacing: 1.5,
              textTransform: 'uppercase', padding: '8px 16px', borderRadius: 4,
            }}
          >
            Sair
          </button>
        ) : (
          <NavTab href="/login" active={pathname === '/login'}>Login</NavTab>
        )}
      </div>
    </nav>
  )
}

function NavTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      color: active ? 'var(--white)' : 'var(--rose)',
      background: active ? 'rgba(232,201,184,0.2)' : 'none',
      fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase',
      padding: '8px 16px', borderRadius: 4, textDecoration: 'none',
      fontFamily: 'var(--font-lato)',
    }}>
      {children}
    </Link>
  )
}
