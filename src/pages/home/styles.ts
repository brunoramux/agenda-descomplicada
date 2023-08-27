import { styled, Heading, Text } from '@brunoramos-ui/react'

export const Container = styled('div', {
  maxWidth: 'calc(100vw - (100vw - 1160px) / 2)', // o max width utiliza o tamanho da janela para verificar o tamanho maximo permitido
  marginLeft: 'auto', // faz com que o lado esquerdo nao suma quando redimensionamos a tela
  height: '100vh',
  display: 'flex',
  //   display: 'inline-grid',
  //   gridTemplateColumns: 'repeat(2, 1fr)',
  alignItems: 'center',
  gap: 150,
})

export const Hero = styled('div', {
  maxWidth: 520,
  padding: '0 $10',

  [`> ${Heading}`]: {
    color: 'white',
    '@media(max-width: 600px)': {
      fontSize: '6xl',
    },
  },
  [`> ${Text}`]: {
    marginTop: '$2',
    color: '$gray200',
  },
})

export const Preview = styled('div', {
  paddingRight: '$8',
  overflow: 'hidden',

  '@media(max-width: 600px)': {
    display: 'none',
  },
})
