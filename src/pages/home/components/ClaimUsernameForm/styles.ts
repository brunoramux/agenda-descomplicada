import { Box, Text, styled } from '@brunoramos-ui/react'

export const Form = styled(Box, {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '$2',
  marginTop: '$4',
  justifyContent: 'center',

  '@media(max-width: 600px)': {
    gridTemplateColumns: '1fr',
  },
})

export const FormAnnotation = styled('div', {
  marginTop: '$2',

  [`> ${Text}`]: {
    color: '$gray400',
  },
})

export const FormAnnotationRed = styled('div', {
  marginTop: '$2',

  [`> ${Text}`]: {
    color: '#752b2b',
  },
})
