export function getWeekDays() {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  return Array.from(Array(7).keys())
    .map(
      (day) => formatter.format(new Date(Date.UTC(2021, 5, day))), // retorna dia da semana de uma determinada data
    )
    .map((weekDay) => {
      return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1)) // funcao para colocar a primeira letra em maiuscula e concatenar com o resto da string
    })
}
