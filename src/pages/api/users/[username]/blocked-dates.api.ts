import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username) // pega parametro
  const { year, month } = req.query // pega parametro

  if (!year || !month) {
    // verifica se a data foi passada via parametro
    return res.status(400).json({ message: 'Year or Month not informed.' })
  }

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

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDays) => availableWeekDays.week_day === weekDay,
    )
  })

  const query = `SELECT *
  FROM schedulings S

  WHERE S.user_id = ${user.id}
    AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}`

  console.log(query)
  const blockedDatesRaw = await prisma.$queryRaw`
    SELECT *
    FROM schedulings S

    WHERE S.user_id = ${user.id}
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
  `

  return res.json({
    blockedWeekDays,
    blockedDatesRaw,
  })
}
