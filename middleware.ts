import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isAdmin = (req.auth?.user as { role?: string })?.role === 'ADMIN'

  if (req.nextUrl.pathname.startsWith('/gerenciar') && !isAdmin) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/gerenciar/:path*'],
}
