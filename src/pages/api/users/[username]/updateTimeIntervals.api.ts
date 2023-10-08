import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
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

  const { intervals } = timeIntervalsBodySchema.parse(req.body)

  await prisma.userTimeInterval.deleteMany({
    where: {
      user_id: user.id,
    },
  })

  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeInterval.create({
        data: {
          week_day: interval.weekDay,
          time_start_in_minutes: interval.startTimeInMinutes,
          time_end_in_minutes: interval.endTimeInMinutes,
          user_id: user.id,
        },
      })
    }),
  )

  return res.status(200).end()
}
