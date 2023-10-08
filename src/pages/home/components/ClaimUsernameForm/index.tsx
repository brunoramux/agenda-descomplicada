import { Button, Text, TextInput } from '@brunoramos-ui/react'
import { Form, FormAnnotation, FormAnnotationRed } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Usuário inválido!' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'Usuário inválido. Utilize apenas letras e/ou hifen!',
    })
    .transform((username) => username.toLowerCase()),
})

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema),
  })

  const router = useRouter()

  async function handleClaimUsername(data: ClaimUsernameFormData) {
    const { username } = data

    await router.push(`/register?username=${username}`)
  }

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="agendadescomplicada.com/"
          placeholder="seu-usuário"
          {...register('username')}
        />
        <Button size="sm" type="submit" disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>
      {errors.username ? (
        <FormAnnotationRed>
          <Text size="sm">{errors.username.message}</Text>
        </FormAnnotationRed>
      ) : (
        <FormAnnotation>
          <Text size="sm">Digite seu nome de usuário</Text>
        </FormAnnotation>
      )}
    </>
  )
}
