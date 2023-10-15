import {
  Button,
  Checkbox,
  Heading,
  Text,
  TextInput,
} from '@brunoramos-ui/react'
import { Container, Header } from '../../register/styles'
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles'
import { ArrowRight } from 'phosphor-react'
import { z } from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { getWeekDays } from '@/src/utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringToMinutes } from '@/src/utils/convert-time-string-to-minutes'
import { api } from '@/src/lib/axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '@/src/lib/prisma'
import { User, UserTimeInterval } from '@prisma/client'
import { useRouter } from 'next/router'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    // transforma o array trazendo apenas os itens com enabled === true
    .refine((intervals) => intervals.length > 0, {
      message: 'Para continuar, selecione ao menos um dia da semana',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h após o horário de início',
      },
    ),
})

interface UpdateTimeIntervalsProps {
  user: User
  timeIntervals: UserTimeInterval[]
}

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals({ user }: UpdateTimeIntervalsProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        {
          weekDay: 0,
          enabled: false,
          startTime: '08:00',
          endTime: '18:00',
        },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const weekDays = getWeekDays({ short: true })

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const intervals = watch('intervals') // verifica em tempo real o estado do array intervals dentro do form
  const router = useRouter()
  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput
    await api.post(`/users/${user.username}/updateTimeIntervals`, { intervals })
    router.push(`/schedule/${user.username}`)
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Atualize seus horários</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>
      </Header>
      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalsContainer>
          {fields.map((field, index) => {
            return (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller // componente do react hook form para controle de checkbox
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => {
                      // qual componente o Controller vai renderizar
                      return (
                        <Checkbox
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true)
                          }}
                          checked={field.value} // inicia o estado dos checkBox com dados do array
                        />
                      )
                    }}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.startTime`)}
                  />
                  <TextInput
                    type="time"
                    step={60}
                    disabled={intervals[index].enabled === false} // habilita e desabilita conforme estado do checkbox
                    {...register(`intervals.${index}.endTime`)}
                  />
                </IntervalInputs>
              </IntervalItem>
            )
          })}
        </IntervalsContainer>
        {errors.intervals && (
          <FormError size="sm">{errors.intervals?.message}</FormError>
        )}
        <Button type="submit" disabled={isSubmitting}>
          Atualizar
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return {
      notFound: true,
    }
  }

  const timeIntervals = await prisma.userTimeInterval.findMany({
    where: {
      user_id: user.id,
    },
  })

  return {
    props: {
      user: {
        id: user.id,
        username,
      },
      timeIntervals,
    },
    revalidate: 60 * 60 * 24, // 1 dia
  }
}
