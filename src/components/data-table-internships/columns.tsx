import { Button } from '@/components/ui/button'
import { Internship } from '@/types/internship'
import { ColumnDef } from '@tanstack/react-table'
import { Check, X, ArrowUpDown } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'


function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

export const internshipColumns: ColumnDef<Internship>[] = [
  {
    accessorKey: 'studentName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Estagiário <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'company',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Empresa <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const badgeColor =
        status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
        status === 'Concluído' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'

      return <span className={`px-2 py-1 rounded-md text-sm ${badgeColor}`}>{status}</span>
    },
  },
  {
    accessorKey: 'startDate',  // Corrigido para accessorKey em vez de id, para evitar warning
    header: 'Início',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'endDate',  // Corrigido para accessorKey em vez de id, para evitar warning
    header: 'Fim',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    id: 'period',
    header: 'Período',
    cell: ({ row }) => {
      const startDate = row.getValue('startDate') as string
      const endDate = row.getValue('endDate') as string
      if (!startDate && !endDate) return '—'
      return `${formatDate(startDate)} → ${formatDate(endDate)}`
    },
  },
  {
    id: 'pendencias',
    header: 'Pendências',
    cell: ({ row }) => {
      const reports = (row.original as any).relatorios
      const tceEntregue = (row.original as any).tceEntregue

      const pendencias: string[] = []

      if (!tceEntregue) pendencias.push('TCE não entregue')

      if (reports) {
        Object.entries(reports).forEach(([key, value]) => {
          if (value === 'Pendente') {
            pendencias.push(`Relatório ${key} pendente`)
          }
        })
      }

      if (pendencias.length === 0) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Check className="text-green-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Sem pendências</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      } else {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <X className="text-red-600 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                {pendencias.map((pendencia, i) => (
                  <p key={i}>{pendencia}</p>
                ))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    }
  },
]
