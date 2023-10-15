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
  const { date } = req.query // pega parametro

  if (!date) {
    // verifica se a data foi passada via parametro
    return res.status(400).json({ message: 'Data não informada.' })
  }

  const user = await prisma.user.findUnique({
    // busca usuario no banco
    where: {
      username,
    },
  })

  if (!user) {
    // verifica se usuario existente
    return res.status(400).json({ message: 'Uuário não encontrado!.' })
  }

  const referenceDate = dayjs(String(date)) // pega parametro date e transforma em data usando do dayjs

  const isPastDate = referenceDate.endOf('day').isBefore(new Date()) // verifica se a data informada e antes que a data de hoje

  if (isPastDate) {
    return res.json({
      possibleTimes: [],
      availableTimes: [],
    }) // retorna array vazio
  }

  const userAvailability = await prisma.userTimeInterval.findFirst({
    // pega no banco os horarios disponiveis do usuario
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    // se nao achar horarios disponiveis, retorna vazio
    return res.json({
      possibleTimes: [],
      availableTimes: [],
    })
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability // desestrutura o resultado da busca do banco pegando os horarios

  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i // logica necessaria para tratamento dos horarios (Ex: 09, 10, 11, 12, 13, 14) e nao 09, 10, 11, 12, 13, 14, 15 => no exemplo o horario termina as 15
    },
  )

  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.startOf('day').toDate(),
        lte: referenceDate.endOf('day').toDate(),
      },
    },
  })
  console.log(referenceDate.startOf('day').toDate())
  const unavailableTimes = blockedTimes.map((schedules) => {
    return schedules.date
  })

  // const availableTimes = possibleTimes.filter((time) => {
  //   // retornar apenas horarios que nao estiverem bloqueados
  //   const isTimeBlocked = blockedTimes.some(
  //     (blockedTime) => blockedTime.date.getHours() === time,
  //   )

  //   const isTimePast = referenceDate.set('hour', time).isBefore(new Date())

  //   return !isTimeBlocked && !isTimePast
  // })

  return res.json({
    possibleTimes,
    unavailableTimes,
  })
}
