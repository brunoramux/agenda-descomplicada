import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username) // pega parametro

  const user = await prisma.user.findUnique({
    // busca usuario no banco
    where: {
      username,
    },
  })

  if (!user) {
    // verifica se usuario existente
    return res.status(400).json({ message: 'User do not exist.' })
  }

  const timeIntervals = await prisma.userTimeInterval.findMany({
    where: {
      user_id: user.id,
    },
  })

  return res.json({
    timeIntervals,
  })
}
