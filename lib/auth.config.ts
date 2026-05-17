import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as unknown as { role: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as unknown as { role: string }).role = token.role as string
      return session
    },
  },
  providers: [],
}
