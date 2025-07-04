export type Internship = {
  id: number
  company: string
  position: string
  status: 'Em andamento' | 'Concluído' | 'Pendente'
  startDate: string
  endDate: string
}

export type InternshipWithExtra = Internship & {
  tceEntregue: boolean
  prazoMaximo: string
  orientadorAtual: string
  orientadorAnterior?: string
  fpe: string
  relatorios: {
    parcial1?: string
    parcial2?: string
    parcial3?: string
    final?: string
  }
  prorrogações?: string
  supervisor?: string
  obrigatorio: boolean
}