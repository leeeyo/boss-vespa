import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { User as NextAuthUser } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from './mongodb'
import User from '@/models/User'
import type { IUser } from '@/models/User'

interface AuthorizedUser extends NextAuthUser {
  role: 'customer' | 'admin'
}

export const authOptions: NextAuthConfig = {
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}

