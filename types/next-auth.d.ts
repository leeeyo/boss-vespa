import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role?: 'customer' | 'admin'
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role?: 'customer' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'customer' | 'admin'
  }
}

