import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/middlewares/auth-provider'

import { internshipColumns } from '@/components/data-table-internships/columns'
import { DataTableInternships } from '@/components/data-table-internships/table'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressSection } from '@/components/progress-section'
import { InternshipCard } from '@/components/internship-card'

import registroDeEstagiosData from '@/backend/registro_de_estagios.json';
import noticiasData from '@/backend/noticias.json'; // Importa o arquivo de notícias

import { InternshipStatus, Internship, InternshipWithExtra } from '@/types/internship';
import { InternshipDetailsModal } from '@/components/internship-details-modal'


function parseDateString(dateStr: string): string | null {
  if (!dateStr || dateStr === '-' || dateStr === '#VALUE!' || dateStr.toLowerCase() === 'em ser') {
    return null;
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return dateStr;
  }
  return null;
}

function deriveStatus(internshipJson: any): InternshipStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDateStr = parseDateString(internshipJson.inicio_tce_aprovado);
  const endDateStr = parseDateString(internshipJson.termino_previsto);
  const conclusionDateStr = parseDateString(internshipJson.conclusao_do_estagio?.data_realizado);

  if (conclusionDateStr) {
    return 'Concluído';
  }

  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (today >= startDate && today <= endDate) {
      return 'Em andamento';
    } else if (today > endDate) {
      return 'Pendente';
    }
  }

  if (startDateStr && new Date(startDateStr) > today) {
    return 'Pendente';
  }

  return 'Pendente';
}

function mapJsonToInternship(jsonItem: any, id: number): InternshipWithExtra {
  const startDate = parseDateString(jsonItem.inicio_tce_aprovado) || '';
  const endDate = parseDateString(jsonItem.termino_previsto) || '';
  const status = deriveStatus(jsonItem);

  const prorrogacoesCount = Object.values(jsonItem.prorrogacoes_do_estagio || {}).filter(Boolean).length;
  const prorrogacoesText = prorrogacoesCount > 0 ? `${prorrogacoesCount} vez(es)` : 'Nenhuma';

  return {
    id: id,
    company: jsonItem.empresa || 'N/A',
    status: status,
    startDate: startDate,
    endDate: endDate,
    studentName: jsonItem.nome_aluno || 'N/A',
    tceEntregue: jsonItem.tce_entregue && jsonItem.tce_entregue !== '-' && jsonItem.tce_entregue !== '#VALUE!' && jsonItem.tce_entregue.toLowerCase() !== 'em ser' ? true : false,
    prazoMaximo: parseDateString(jsonItem.prazo_maximo) || 'N/A',
    orientadorAtual: jsonItem.orientador_designado_por_articulador_atual || 'N/A',
    orientadorAnterior: jsonItem.orientador_designado_por_articulador_anterior || undefined,
    fpe: jsonItem.fpe?.realizado || 'N/A',
    relatorios: {
      parcial1: parseDateString(jsonItem.relatorios?.parcial_1?.entregue) || 'Pendente',
      parcial2: parseDateString(jsonItem.relatorios?.parcial_2?.entregue) || 'Pendente',
      parcial3: parseDateString(jsonItem.relatorios?.parcial_3?.entregue) || 'Pendente',
      final: parseDateString(jsonItem.relatorios?.final?.entregue) || 'Pendente',
    },
    prorrogacoes: prorrogacoesText,
    supervisor: jsonItem.supervisor_na_empresa || 'N/A',
    obrigatorio: jsonItem.obrig?.toLowerCase() === 'sim' ? true : false,
    rawJson: jsonItem,
  };
}

// Remove o mockNews e passa a usar o noticiasData importado
const news = noticiasData;

const initialAllInternships: InternshipWithExtra[] = registroDeEstagiosData.map((item: any, index: number) => mapJsonToInternship(item, index + 1));

export function Home() {
  const { isAuthenticated, role, user } = useAuth()
  const navigate = useNavigate()

  const [allInternships] = useState<InternshipWithExtra[]>(initialAllInternships);
  const [filteredInternships, setFilteredInternships] = useState<InternshipWithExtra[]>([]);
  const [progress, setProgress] = useState(0)
  const [selectedInternship, setSelectedInternship] = useState<InternshipWithExtra | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!user || !allInternships.length) {
      setFilteredInternships([]);
      return;
    }

    let currentFiltered: InternshipWithExtra[] = [];
    const normalizeName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const userNameNormalized = normalizeName(user.nome);


    if (role === 'student') {
      currentFiltered = allInternships.filter(
        (internship) => normalizeName(internship.studentName) === userNameNormalized
      );
    } else if (role === 'advisor') {
      currentFiltered = allInternships.filter(
        (internship) =>
          normalizeName(internship.orientadorAtual || '') === userNameNormalized ||
          normalizeName(internship.orientadorAnterior || '') === userNameNormalized
      );
    } else if (role === 'articulator') {
      currentFiltered = allInternships;
    }
    setFilteredInternships(currentFiltered);
  }, [allInternships, role, user]);

  const currentInternship = filteredInternships.find(i => i.status === 'Em andamento');

  useEffect(() => {
    if (!currentInternship) {
      setProgress(0);
      return;
    }
    // A data está no formato DD/MM/AAAA, então precisamos reformatá-la para o cálculo
    const startParts = currentInternship.startDate.split('/');
    const endParts = currentInternship.endDate.split('/');
    const startDate = new Date(`${startParts[2]}-${startParts[1]}-${startParts[0]}`).getTime();
    const endDate = new Date(`${endParts[2]}-${endParts[1]}-${endParts[0]}`).getTime();
    const today = Date.now();
    const percent = Math.min(100, Math.max(0, ((today - startDate) / (endDate - startDate)) * 100));
    setProgress(percent);
  }, [currentInternship]);

  if (!isAuthenticated) return null


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Olá, {user?.nome || (role === 'student' ? 'aluno' : role === 'advisor' ? 'orientador' : 'articulador')}!
      </h1>
      <p className="text-muted-foreground">
        {role === 'student' && 'Acompanhe seu estágio e fique por dentro das novidades.'}
        {role === 'advisor' && 'Gerencie seus orientandos e monitore prazos.'}
        {role === 'articulator' && 'Acompanhe o andamento dos estágios.'}
      </p>

      <div className="flex gap-6 flex-col md:flex-row">
        {currentInternship && (
          <ProgressSection
            progress={progress}
            startDate={currentInternship.startDate}
            endDate={currentInternship.endDate}
            status={currentInternship.status}
          />
        )}
        {!currentInternship && role === 'student' && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Nenhum estágio em andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Você não possui um estágio ativo no momento.</p>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Notícias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-48 overflow-y-auto">
            {news.map((item, index) => ( // Altera de mockNews para news
              <div key={index}>
                <h3 className="font-medium">{item.titulo}</h3> {/* Usa .titulo */}
                <p className="text-sm text-muted-foreground">{item.descricao}</p> {/* Usa .descricao */}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {role === 'student' && currentInternship && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Estágio Atual</h2>
          <InternshipCard
            internship={currentInternship}
            onClick={() => setSelectedInternship(currentInternship)}
          />
        </section>
      )}

      {role === 'student' && filteredInternships.some(i => i.status !== 'Em andamento') && (
        <section className="space-y-2 mt-6">
          <h2 className="text-lg font-semibold">Estágios Anteriores</h2>
          {filteredInternships
            .filter(i => i.status !== 'Em andamento')
            .map(internship => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onClick={() => setSelectedInternship(internship)}
              />
            ))}
        </section>
      )}

      {(role === 'advisor' || role === 'articulator') && (
        <section className="space-y-2 mt-6">
          <h2 className="text-lg font-semibold">Histórico de Estágios</h2>
          <DataTableInternships columns={internshipColumns} data={filteredInternships} />
        </section>
      )}

      {selectedInternship && (
        <InternshipDetailsModal
          internship={selectedInternship}
          open={!!selectedInternship}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedInternship(null)
          }}
        />
      )}
    </div>
  )
}