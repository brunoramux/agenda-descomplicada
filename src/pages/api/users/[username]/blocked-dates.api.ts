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

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT 
         EXTRACT(DAY FROM S.date) AS date,
         COUNT(S.date) AS amount,
         ((UT.time_end_in_minutes - UT.time_start_in_minutes) / 60) AS size
    FROM schedulings S

    LEFT JOIN user_time_intervals UT
      ON UT.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY)) 

    WHERE S.user_id = ${user.id}
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
    
    GROUP BY EXTRACT(DAY FROM S.date),
             ((UT.time_end_in_minutes - UT.time_start_in_minutes) / 60)

    HAVING amount >= size
  ` // query para trazer schedules do usuario junto com os respectivos horarios

  console.log(blockedDatesRaw)
  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({
    blockedWeekDays,
    blockedDates,
  })
}
