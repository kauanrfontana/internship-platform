import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Briefcase, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Internship = {
  id: number
  company: string
  position: string
  status: 'Em andamento' | 'Concluído' | 'Pendente'
  startDate: string
  endDate: string
}

const internships: Internship[] = [
  {
    id: 1,
    company: 'Empresa XPTO',
    position: 'Frontend',
    status: 'Em andamento',
    startDate: '2025-03-01',
    endDate: '2025-09-01',
  },
  {
    id: 2,
    company: 'Empresa Y',
    position: 'Backend',
    status: 'Concluído',
    startDate: '2024-01-01',
    endDate: '2024-07-01',
  },
]

const mockNews = [
  {
    id: 1,
    title: 'Novo edital de estágio publicado!',
    content: 'Aproveite as novas oportunidades abertas para 2025.',
  },
  {
    id: 2,
    title: 'Documentação obrigatória atualizada',
    content: 'Confira os novos requisitos para o relatório parcial.',
  },
]

const statusColors: Record<Internship['status'], string> = {
  'Em andamento': 'bg-yellow-100 text-yellow-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Pendente': 'bg-red-100 text-red-800',
}

export function StudentHome() {
  const [progress, setProgress] = useState(0)

  // Pega o estágio em andamento
  const currentInternship = internships.find(i => i.status === 'Em andamento')

  useEffect(() => {
    if (!currentInternship) return

    const start = new Date(currentInternship.startDate).getTime()
    const end = new Date(currentInternship.endDate).getTime()
    const today = Date.now()

    const percent = Math.min(100, Math.max(0, ((today - start) / (end - start)) * 100))
    setProgress(percent)
  }, [currentInternship])

  function handleAccessInternship(id: number) {
    alert(`Acessar detalhes do estágio ${id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Olá, aluno!</h1>
      <p className="text-muted-foreground">Acompanhe seu estágio e fique por dentro das novidades.</p>

      {/* Progresso e Notícias */}
      {currentInternship && (
        <div className="flex gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Progresso do Estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} />
              <p className="text-sm mt-2 text-muted-foreground">
                {currentInternship.status} • Início: {currentInternship.startDate} • Término: {currentInternship.endDate}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Notícias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-48 overflow-y-auto">
              {mockNews.map(news => (
                <div key={news.id}>
                  <h3 className="font-medium">{news.title}</h3>
                  <p className="text-sm text-muted-foreground">{news.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estágio atual */}
      {currentInternship && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Estágio Atual</h2>
          <Card>
            <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <InfoRow icon={<Briefcase className="w-5 h-5 text-muted-foreground" />} label="Empresa" value={currentInternship.company} />
                <InfoRow icon={<Clock className="w-5 h-5 text-muted-foreground" />} label="Função" value={currentInternship.position} />
                <InfoRow icon={<CheckCircle className="w-5 h-5 text-muted-foreground" />} label="Status" value={
                  <Badge className={`${statusColors[currentInternship.status]} px-2 py-0.5 text-sm`}>
                    {currentInternship.status}
                  </Badge>
                } />
                <InfoRow icon={<Calendar className="w-5 h-5 text-muted-foreground" />} label="Período" value={`${currentInternship.startDate} → ${currentInternship.endDate}`} />
              </div>

              <div className="w-full md:w-auto">
                <Button onClick={() => handleAccessInternship(currentInternship.id)} size="lg" className="w-full md:w-auto">
                  Acessar Estágio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estágios anteriores */}
      {internships.some(i => i.status !== 'Em andamento') && (
        <div className="space-y-2 mt-6">
          <h2 className="text-lg font-semibold">Estágios Anteriores</h2>
          {internships
            .filter(i => i.status !== 'Em andamento')
            .map(internship => (
              <Card key={internship.id}>
                <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <InfoRow icon={<Briefcase className="w-5 h-5 text-muted-foreground" />} label="Empresa" value={internship.company} />
                    <InfoRow icon={<Clock className="w-5 h-5 text-muted-foreground" />} label="Função" value={internship.position} />
                    <InfoRow icon={<CheckCircle className="w-5 h-5 text-muted-foreground" />} label="Status" value={
                      <Badge className={`${statusColors[internship.status]} px-2 py-0.5 text-sm`}>
                        {internship.status}
                      </Badge>
                    } />
                    <InfoRow icon={<Calendar className="w-5 h-5 text-muted-foreground" />} label="Período" value={`${internship.startDate} → ${internship.endDate}`} />
                  </div>

                  <div className="w-full md:w-auto">
                    <Button onClick={() => handleAccessInternship(internship.id)} size="sm" variant="secondary">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
