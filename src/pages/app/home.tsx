import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/middlewares/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Briefcase, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { InternshipDetailsModal } from '@/components/internship-details-modal'
import { InfoRow } from '@/components/info-row'
import { Internship, InternshipWithExtra } from '@/types/internship'
import { ProgressSection } from '@/components/progress-section'

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

const extraFields: Record<number, Omit<InternshipWithExtra, keyof Internship>> = {
  1: {
    tceEntregue: true,
    prazoMaximo: '2025-09-15',
    orientadorAtual: 'Prof. João da Silva',
    orientadorAnterior: 'Prof. Ana Souza',
    fpe: 'Sim',
    relatorios: {
      parcial1: '2025-05-01',
      parcial2: '2025-07-01',
      parcial3: 'Pendente',
      final: 'Pendente',
    },
    prorrogações: 'Nenhuma',
    supervisor: 'Carlos Menezes',
    obrigatorio: true,
  },
  2: {
    tceEntregue: true,
    prazoMaximo: '2024-07-15',
    orientadorAtual: 'Prof. Beatriz Costa',
    fpe: 'Sim',
    relatorios: {
      parcial1: '2024-03-01',
      parcial2: '2024-05-01',
      parcial3: '2024-06-15',
      final: '2024-07-01',
    },
    prorrogações: '1 vez',
    supervisor: 'Fernanda Oliveira',
    obrigatorio: false,
  },
}

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

export function Home() {
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [progress, setProgress] = useState(0)
  const [selectedInternship, setSelectedInternship] = useState<InternshipWithExtra | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  const currentInternship = internships.find(i => i.status === 'Em andamento')

  useEffect(() => {
    if (!currentInternship) return
    const start = new Date(currentInternship.startDate).getTime()
    const end = new Date(currentInternship.endDate).getTime()
    const today = Date.now()
    const percent = Math.min(100, Math.max(0, ((today - start) / (end - start)) * 100))
    setProgress(percent)
  }, [currentInternship])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Olá, {role === 'student' ? 'aluno' : role === 'advisor' ? 'orientador' : 'articulador'}!</h1>
      <p className="text-muted-foreground">
        {role === 'student' && 'Acompanhe seu estágio e fique por dentro das novidades.'}
        {role === 'advisor' && 'Gerencie seus orientandos e monitore prazos.'}
        {role === 'articulator' && 'Acompanhe o andamento dos estágios.'}
      </p>

      {currentInternship && (
        <div className="flex gap-6 flex-col md:flex-row">
          <ProgressSection
            progress={progress}
            startDate={currentInternship.startDate}
            endDate={currentInternship.endDate}
            status={currentInternship.status}
          />

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
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            {role === 'student' ? 'Estágio Atual' : 'Orientando Ativo'}
          </h2>
          <Card>
            <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <InfoRow icon={<Briefcase />} label="Empresa" value={currentInternship.company} />
                <InfoRow icon={<Clock />} label="Função" value={currentInternship.position} />
                <InfoRow
                  icon={<CheckCircle />}
                  label="Status"
                  value={
                    <Badge className={`${statusColors[currentInternship.status]} px-2 py-0.5 text-sm`}>
                      {currentInternship.status}
                    </Badge>
                  }
                />
                <InfoRow icon={<Calendar />} label="Período" value={`${currentInternship.startDate} → ${currentInternship.endDate}`} />
              </div>
              {role === 'student' && (
                <Button
                  onClick={() =>
                    setSelectedInternship({ ...currentInternship, ...extraFields[currentInternship.id] })
                  }
                >
                  Acessar Estágio
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Estágios anteriores */}
      {internships.some(i => i.status !== 'Em andamento') && (
        <section className="space-y-2 mt-6">
          <h2 className="text-lg font-semibold">
            {role === 'student' ? 'Estágios Anteriores' : 'Histórico de Estágios'}
          </h2>
          {internships
            .filter(i => i.status !== 'Em andamento')
            .map(internship => (
              <Card key={internship.id}>
                <CardContent className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <InfoRow icon={<Briefcase />} label="Empresa" value={internship.company} />
                    <InfoRow icon={<Clock />} label="Função" value={internship.position} />
                    <InfoRow
                      icon={<CheckCircle />}
                      label="Status"
                      value={
                        <Badge className={`${statusColors[internship.status]} px-2 py-0.5 text-sm`}>
                          {internship.status}
                        </Badge>
                      }
                    />
                    <InfoRow icon={<Calendar />} label="Período" value={`${internship.startDate} → ${internship.endDate}`} />
                  </div>
                  {role === 'student' && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setSelectedInternship({ ...internship, ...extraFields[internship.id] })
                      }
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </section>
      )}

      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          open={!!selectedInternship}
          onOpenChange={(open: any) => {
            if (!open) setSelectedInternship(null)
          }}
        />
      )}
    </div>
  )
}