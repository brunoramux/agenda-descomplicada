import {
  Button,
  Text,
  TextArea,
  TextInput,
  ToastComponent,
} from '@brunoramos-ui/react'
import { ConfirmForm, FormActions, FormError, FormHeader } from './styles'
import { CalendarBlank, Clock } from 'phosphor-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'

const confirmFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  observations: z.string().nullable(),
})

interface schedulingDateProps {
  schedulingDate: Date
  onCancelForm: () => void
}

type ConfirmFormData = z.infer<typeof confirmFormSchema>
export function ConfirmStep({
  schedulingDate,
  onCancelForm,
}: schedulingDateProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  })

  const router = useRouter()
  const username = String(router.query.username)
  const novaHora = schedulingDate.getHours()
  const novaData = dayjs(schedulingDate).set('hour', novaHora - 3)

  async function handleConfirmScheduling(data: ConfirmFormData) {
    const { name, email, observations } = data
    await api.post(`/users/${username}/schedule`, {
      name,
      email,
      observations,
      date: novaData,
    })

    onCancelForm()
  }

  const fullDate = dayjs(schedulingDate).format('DD[ de ]MMMM[ de ]YYYY')
  const fullTime = dayjs(schedulingDate).format('HH:mm[h]')

  return (
    <>
      <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
        <FormHeader>
          <Text>
            <CalendarBlank />
            {fullDate}
          </Text>
          <Text>
            <Clock />
            {fullTime}
          </Text>
        </FormHeader>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register('name')} />
          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Endereço de e-mail</Text>
          <TextInput
            type="email"
            placeholder="Seu e-mail"
            {...register('email')}
          />
          {errors.email && (
            <FormError size="sm">{errors.email.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Observações</Text>
          <TextArea {...register('observations')} />
        </label>
        <FormActions>
          <Button type="button" variant="tertiary" onClick={onCancelForm}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting} id="child">
            Confirmar
          </Button>
        </FormActions>
      </ConfirmForm>
      <ToastComponent title="Agendamento realizado!!" content="">
        {' '}
      </ToastComponent>
    </>
  )
}
