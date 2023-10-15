import { Heading, Text } from '@brunoramos-ui/react'
import { Container, Hero, Preview } from './styles'
import Image from 'next/image'
import previewImage from '../../assets/app-preview.png'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'

export default function Home() {
  return (
    <Container>
      <Hero>
        <Heading size="4xl">Agenda descomplicada</Heading>
        <Text size="xl">
          Conecte seu calendário do Google e permita que as pessoas marquem
          agendamentos em seus horários disponíveis.
        </Text>
        <ClaimUsernameForm />
      </Hero>
      <Preview>
        <Image
          src={previewImage}
          height={400}
          quality={100}
          priority
          alt="Calendádio simbolizando a aplicação em funcionamento"
        />
      </Preview>
    </Container>
  )
}
