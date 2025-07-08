import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/middlewares/auth-provider'

interface Props {
  progress: number
  startDate: string
  endDate: string
  status: string
}

export function ProgressSection({ progress, startDate, endDate, status }: Props) {
  const { role } = useAuth()

  if (role === 'advisor') {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Orientandos em Andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Você possui orientandos ativos.</p>
        </CardContent>
      </Card>
    )
  }

  if (role === 'articulator') {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Estágios sob supervisão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Monitore os prazos e documentos pendentes.</p>
        </CardContent>
      </Card>
    )
  }

  // Student
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Progresso do Estágio</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
        <p className="text-sm mt-2 text-muted-foreground">
          {status} • Início: {startDate} • Término: {endDate}
        </p>
      </CardContent>
    </Card>
  )
}