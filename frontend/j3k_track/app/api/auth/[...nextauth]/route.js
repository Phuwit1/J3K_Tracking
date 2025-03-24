import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/prisma/prisma'
import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'

// const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        
        if (!credentials) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        console.log('User from DB:', user);   
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return {
            id: user.id,
            firstName : user.firstName,
            lastName : user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phoneNumber,
            role: user.isAdmin ? 'admin' : 'user',
            idCard: user.idCard,
          }
        } else {
          throw new Error('Invalid email or password')
        }
      },
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.fullName = `${user.firstName} ${user.lastName}`
        token.phone = user.phone 
        token.role = user.role
        token.idCard = user.idCard
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.fullName = token.fullName
        session.user.phone = token.phone
        session.user.role = token.role
        session.user.idCard = token.idCard
      }
      return session
    },
    // async redirect({ url, baseUrl }) {
    //   // Allows relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`
    //   // Allows callback URLs on the same origin
    //   else if (new URL(url).origin === baseUrl) return url
    //   return baseUrl
    // }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
