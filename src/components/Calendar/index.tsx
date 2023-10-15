import { CaretLeft, CaretRight } from 'phosphor-react'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

interface CalendarProps {
  selectedDate: Date | null
  onDateSelected: (date: Date) => void
}

interface BlockedDates {
  blockedWeekDays: number[]
  blockedDates: number[]
}

export function Calendar({ onDateSelected, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1)
  })

  const router = useRouter()

  function handlePreviewMonth() {
    // funcao do botao de mes anterior
    const previousMonthDate = currentDate.subtract(1, 'month') // pego o mes anterior
    setCurrentDate(previousMonthDate)
  }

  function handleNextMonth() {
    // funcao do botao de proximo mes
    const nextMonthDate = currentDate.add(1, 'month')
    setCurrentDate(nextMonthDate)
  }

  const shortWeekDays = getWeekDays({ short: true }) // pega os dias da semana da forma curta (DOM, SEG, TER ...)
  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')
  const username = String(router.query.username)

  const { data: blockedDates } = useQuery<BlockedDates>( // hook do react para chamadas de api. Substitui o useEffect. Possui camada de cache, tornando a aplicacao mais rapida
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: {
          year: currentDate.get('year'),
          month: currentDate.get('month') + 1,
        },
      })
      return response.data
    },
  )

  const calendarWeeks = useMemo(() => {
    if (!blockedDates) {
      return []
    }
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      return currentDate.set('date', i + 1) // cria um array com numero de dias do mes da variavel currentDate (array original seria de 0 a 30 portanto fazemos um map somando 1 ao indice do array para chegar aos 31 dias corretamente)
    })

    const firstWeekDay = currentDate.get('day') // em qual dia da semana o mes comeca

    const previousMonthFillArray = Array.from({
      // funcao para pegar os dias do mes anterior que fazem parte da mesma semana. Primeiro verificamos o tamanho do array do dia da semana onde esta o dia 1 do mes e calculamos quantas posicoes serao necessarias para completar o calendario
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day')
      })
      .reverse() // invertemos o array para mostrar corretamente em tela

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    ) // pega o timestamp do ultima dia do mes
    const lastWeekDay = lastDayInCurrentMonth.get('day') // pega o dia da semana da variavel acima
    // Domingo = 0
    // Segunda-Feira = 1
    // Terca-Feira = 2
    // Quarta-Feira = 3
    // Quinta-Feira = 4
    // Sexta-Feira = 5
    // Sabado = 6

    const nextMonthFillArray = Array.from({
      // funcao para calcular numero de dias necessarios do proximo mes para completar o calendario
      length: 7 - (lastWeekDay + 1),
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day')
    })

    const calendarDays = [
      ...previousMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        return {
          date,
          disabled:
            date.endOf('day').isBefore(new Date()) || // bloqueia dias anteriores ao dia atual
            blockedDates.blockedWeekDays.includes(date.get('day')) ||
            blockedDates.blockedDates.includes(date.get('date')), // desabilita os dias bloqueados, retornados pela consulta a API
        }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ]

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        const isNewWeek = i % 7 === 0 // verifica se a semana esta comecando (DOM). Resto da divisao por 7 e 0

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1,
            days: original.slice(i, i + 7), // pega 7 posicoes do array principal slice(inicio, fim) fim nao e incluido. Ex.: slice(0, 7) => pega do 0 ao 6 Ex2.: slice(7, 14) => pega do 7 ao 13
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate, blockedDates])

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviewMonth}>
            <CaretLeft />
          </button>
          <button>
            <CaretRight onClick={handleNextMonth} />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((days) => (
              <th key={days}>{days}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            /* Percorre o objeto com dias do mes */
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        onClick={
                          () =>
                            onDateSelected(
                              date.toDate(),
                            ) /* aciona a tela de selecao de horario atraves da funcao passada via parametro */
                        }
                        disabled={disabled}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
