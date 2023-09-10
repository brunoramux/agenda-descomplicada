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
    return res.status(400).json({ message: 'Date not provided.' })
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

  const referenteDate = dayjs(String(date)) // pega parametro date e transforma em data usando do dayjs

  const isPastDate = referenteDate.endOf('day').isBefore(new Date()) // verifica se a data informada e antes que a data de hoje

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
      week_day: referenteDate.get('day'),
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
    // verifica se ha horarios ja marcados
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenteDate.set('hour', startHour).toDate(),
        lte: referenteDate.set('hour', endHour).toDate(),
      },
    },
  })

  const availableTimes = possibleTimes.filter((time) => {
    // retornar apenas horarios que nao estiverem bloqueados
    return !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
  })

  return res.json({
    possibleTimes,
    availableTimes,
  })
}
