import { PrismaAdapter } from '@/src/lib/auth/prisma-adapter'
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res), // processo de autenticacao tambem chama o Adapter
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '', // keys obtidas dentro de API do Google
        // https://console.cloud.google.com/welcome?hl=pt-br&project=ignite-call-396822
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope:
              'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
          },
        },
        profile: (profile: GoogleProfile) => {
          // trazer dados de perfil do provider
          return {
            id: profile.sub,
            name: profile.name,
            username: '',
            email: profile.email,
            avatar_url: profile.picture,
          }
        },
      }),
    ],

    callbacks: {
      // o que acontece quando o processo de autenticacao retorna a nossa aplicacao
      async signIn({ account }) {
        if (
          !account?.scope?.includes('https://www.googleapis.com/auth/calendar') // verifica se autorizacao de calendario foi fornecida
        ) {
          return '/register/connect-calendar/?error=permissions' // retorna pagina de erro
        }

        return true
      },
      async session({ session, user }) {
        // configuracao para levar todos os dados para o front end
        return {
          ...session,
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res)) // funcao para exportar o req e o res que serao utilizados no Adapter
}
