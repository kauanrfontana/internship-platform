
import { Briefcase, Calendar, CheckCircle, UserRound } from 'lucide-react' // Adicionado UserRound, removido Clock
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InternshipWithExtra } from '@/types/internship' // Importa o tipo existente

type InternshipCardProps = {
  internship: InternshipWithExtra; // Recebe o objeto de estágio completo
  onClick?: () => void;
}

const statusColors = {
  'Em andamento': 'bg-yellow-100 text-yellow-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Pendente': 'bg-red-100 text-red-800',
}

export function InternshipCard({ internship, onClick }: InternshipCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            {internship.company}
          </h3>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <UserRound className="w-4 h-4" />
            {internship.studentName}
          </p>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            {internship.startDate} &rarr; {internship.endDate}
          </p>

          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle className="w-4 h-4" />
            <Badge className={`${statusColors[internship.status as keyof typeof statusColors]} text-xs`}>
              {internship.status}
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
