import { prisma } from '@/src/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, username } = req.body

  const userExits = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (userExits) {
    return res.status(400).json({
      message: 'Username already taken',
    })
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
    },
  })

  setCookie({ res }, '@ignitecall:userId', user.id, {
    // cookie enviado junto ao resultado
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/', // todas as rotas podem acessar esses cookies
  })

  return res.status(201).json(user)
}
