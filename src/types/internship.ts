export type InternshipStatus = 'Em andamento' | 'Concluído' | 'Pendente';

export type Internship = {
  id: number;
  company: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string;
  studentName: string;
};

export type InternshipWithExtra = Internship & {
  tceEntregue?: boolean;
  prazoMaximo?: string;
  orientadorAtual?: string;
  orientadorAnterior?: string;
  fpe?: string;
  relatorios?: {
    parcial1?: string;
    parcial2?: string;
    parcial3?: string;
    final?: string;
  };
  prorrogacoes?: string; 
  supervisor?: string;
  obrigatorio?: boolean;
  rawJson?: any; 
};
