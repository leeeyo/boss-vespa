import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { User as NextAuthUser } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from './lib/mongodb'
import User from './models/User'
import type { IUser } from './models/User'

interface AuthorizedUser extends NextAuthUser {
  role: 'customer' | 'admin'
}

// Cookie name must be consistent - use standard next-auth cookie names
const useSecureCookies = process.env.NODE_ENV === 'production'
const cookiePrefix = useSecureCookies ? '__Secure-' : ''

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email }).lean<IUser>()

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (!user.password || typeof user.password !== 'string') {
          throw new Error('Invalid user data')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authorizedUser = user as AuthorizedUser
        token.id = authorizedUser.id
        token.role = authorizedUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id as string
        session.user.role = token.role as 'customer' | 'admin'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Default redirect behavior
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

