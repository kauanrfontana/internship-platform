import { Briefcase, Calendar, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Internship = {
  id: number
  company: string
  position: string
  status: 'Em andamento' | 'Concluído' | 'Pendente'
  startDate: string
  endDate: string
  onClick?: () => void
}

const statusColors = {
  'Em andamento': 'bg-yellow-100 text-yellow-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Pendente': 'bg-red-100 text-red-800',
}

export function InternshipCard({ company, position, status, startDate, endDate, onClick }: Internship) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            {company}
          </h3>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            {position}
          </p>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            {startDate} &rarr; {endDate}
          </p>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle className="w-4 h-4" />
            <Badge className={`${statusColors[status as keyof typeof statusColors]} text-xs`}>
              {status}
            </Badge>
          </p>
        </div>

        <Button onClick={onClick} variant="secondary" size="sm" className="self-start md:self-auto">
          Ver estágio
        </Button>
      </CardContent>
    </Card>
  )
}
