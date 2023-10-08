import { Button, Heading, MultiStep, Text } from '@brunoramos-ui/react'
import { Container, Header } from '../styles'
import React, { useEffect } from 'react'
// import { api } from '@/src/lib/axios'
import { ArrowRight, Check } from 'phosphor-react'
import { AuthError, ConnectBox, ConnectItem } from './styles'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function ConnectCallendar() {
  const session = useSession()
  const router = useRouter()

  async function handleConnectCalendar() {
    await signIn('google', { callbackUrl: '/register/connect-calendar' })
  }

  async function handleNavigateToNextStep() {
    await router.push('/register/time-intervals')
  }

  const hasAuthError = !!router.query.error // retorna boolean. Se a autenticacao com o google der errado
  const isSignedIn = session.status === 'authenticated'
  return (
    <Container>
      <Header>
        <Heading as="strong">Bem vindo ao App Agenda descomplicada</Heading>
        <Text size="sm">
          Conecte o seu calendário Google para verificar automaticamente as
          horas ocupadas e os novos eventos a medida em que são agendados.
        </Text>
        <MultiStep size={4} currentStep={2} />
      </Header>
      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>
          {isSignedIn ? (
            <Button type="submit" disabled={isSignedIn}>
              Conectado
              <Check />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleConnectCalendar()}
            >
              Conectar <ArrowRight />
            </Button>
          )}
        </ConnectItem>

        {hasAuthError && (
          <AuthError>
            Falha ao se conectar ao Google, verifique se vocé habilitou as
            permissões de acesso ao Google Calendar
          </AuthError>
        )}
        <Button
          type="submit"
          disabled={!isSignedIn}
          onClick={handleNavigateToNextStep}
        >
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  )
}
