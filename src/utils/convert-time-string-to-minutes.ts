export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number) // separa a string em um array e converte os itens deste array para numero

  return hours * 60 + minutes // retorna quantidade de minutos
}
