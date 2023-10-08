import {
  Button,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@brunoramos-ui/react'
import { Container, Form, FormError, Header } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { api } from '@/src/lib/axios'
import { AxiosError } from 'axios'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Usuário inválido!' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'Usuário inválido. Utilize apenas letras e/ou hifen!',
    })
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, { message: 'Nome Inválido!' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })
  const router = useRouter()
  // const [open, setOpen] = useState(false)

  const [openDialog, setOpenDialog] = React.useState(false)

  const handleClickOpen = () => {
    setOpenDialog(true)
  }

  const handleClose = () => {
    setOpenDialog(false)
  }

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username)) // funcao para colocar usuario que veio via parametro dentro do form
    }
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })
      await router.push('/register/connect-calendar')
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        // setOpen(true)
        // setTimeout(() => setOpen(false), 3000)
        handleClickOpen()
      }
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem vindo ao App Agenda descomplicada</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, vocé pode
          editar essas informações depois.
        </Text>
        <MultiStep size={4} currentStep={1} />
      </Header>
      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="agendadescomplicada.com/"
            placeholder="seu-usuario"
            {...register('username')}
          />

          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register('name')} />
          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
      {/* <Collapse in={open}>
        <Alert
          severity="error"
          style={{
            backgroundColor: '#202024',
            color: 'red',
          }}
        >
          Usuário já existente!
        </Alert>
      </Collapse> */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        style={{ backgroundColor: 'transparent' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{
            backgroundColor: '#323238',
            color: '#fff',
            fontFamily: 'Roboto',
          }}
        >
          {'Erro'}
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#323238' }}>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              backgroundColor: '#323238',
              color: '#fff',
              fontFamily: 'Roboto',
            }}
            sx={{
              width: 500,
              borderRadius: '20px',
            }}
          >
            Usuário já existente
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: '#323238',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="secondary"
            style={{ display: 'flex', marginBottom: '10px' }}
            onClick={handleClose}
          >
            OK!
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
