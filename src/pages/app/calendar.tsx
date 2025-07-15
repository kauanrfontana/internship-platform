import { Helmet } from 'react-helmet-async';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/middlewares/auth-provider';

import registroDeEstagiosData from '@/backend/registro_de_estagios.json';
import visitasDoArticuladorData from '@/backend/visitas_do_articulador.json';
import visitasDoOrientadorData from '@/backend/visitas_do_orientador.json';

type CalendarEvent = {
  title: string;
  date?: string;
  start?: string;
  end?: string;
  color?: string;
  extendedProps?: {
    type: 'estagio_inicio' | 'estagio_termino' | 'relatorio_parcial' | 'relatorio_final' | 'estagio_conclusao' | 'estagio_prorrogacao' | 'visita_articulador' | 'visita_orientador';
    studentName?: string;
    company?: string;
    orientador?: string;
    supervisor?: string;
    motivo?: string;
    periodo?: string;
    tipo?: string;
    reportType?: string;
  };
};

const normalizeName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function parseDateString(dateStr: string): string | null {
  if (!dateStr || dateStr === '-' || dateStr === '#VALUE!' || dateStr.toLowerCase() === 'em ser') {
    return null;
  }
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return null;
}

export function Calendar() {
  const { user, role } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!user || !role) {
      setEvents([]);
      return;
    }

    const allEvents: CalendarEvent[] = [];
    const userNameNormalized = normalizeName(user.nome);

    registroDeEstagiosData.forEach((internship: any) => {
      const studentNameNormalized = normalizeName(internship.nome_aluno || '');
      const orientadorAtualNormalized = normalizeName(internship.orientador_designado_por_articulador_atual || '');
      const orientadorAnteriorNormalized = normalizeName(internship.orientador_designado_por_articulador_anterior || '');

      const isRelevantToUser =
        (role === 'student' && studentNameNormalized === userNameNormalized) ||
        (role === 'advisor' && (orientadorAtualNormalized === userNameNormalized || orientadorAnteriorNormalized === userNameNormalized)) ||
        (role === 'articulator');

      if (isRelevantToUser) {
        const startDate = parseDateString(internship.inicio_tce_aprovado);
        if (startDate) {
          allEvents.push({
            title: `Início Estágio: ${internship.nome_aluno} (${internship.empresa})`,
            date: startDate,
            color: '#3498db',
            extendedProps: {
              type: 'estagio_inicio',
              studentName: internship.nome_aluno,
              company: internship.empresa,
            },
          });
        }

        const endDate = parseDateString(internship.termino_previsto);
        if (endDate) {
          allEvents.push({
            title: `Término Previsto: ${internship.nome_aluno} (${internship.empresa})`,
            date: endDate,
            color: '#e67e22',
            extendedProps: {
              type: 'estagio_termino',
              studentName: internship.nome_aluno,
              company: internship.empresa,
            },
          });
        }

        const conclusionDate = parseDateString(internship.conclusao_do_estagio?.data_realizado);
        if (conclusionDate) {
          allEvents.push({
            title: `Conclusão Estágio: ${internship.nome_aluno} (${internship.empresa})`,
            date: conclusionDate,
            color: '#27ae60',
            extendedProps: {
              type: 'estagio_conclusao',
              studentName: internship.nome_aluno,
              company: internship.empresa,
              motivo: internship.conclusao_do_estagio?.motivo,
            },
          });
        }

        const relatorios = internship.relatorios || {};
        ['parcial_1', 'parcial_2', 'parcial_3', 'final'].forEach(reportKey => {
          const reportDate = parseDateString(relatorios[reportKey]?.entregue);
          if (reportDate) {
            allEvents.push({
              title: `Relatório ${reportKey.replace('_', ' ').replace('parcial', 'Parcial').replace('final', 'Final')}: ${internship.nome_aluno}`,
              date: reportDate,
              color: '#f1c40f',
              extendedProps: {
                type: reportKey.includes('parcial') ? 'relatorio_parcial' : 'relatorio_final',
                studentName: internship.nome_aluno,
                reportType: reportKey,
              },
            });
          }
        });

        const prorrogacoes = internship.prorrogacoes_do_estagio || {};
        Object.keys(prorrogacoes).forEach(prorrogKey => {
          const prorrogDate = parseDateString(prorrogacoes[prorrogKey]);
          if (prorrogDate) {
            allEvents.push({
              title: `Prorrogação Estágio: ${internship.nome_aluno}`,
              date: prorrogDate,
              color: '#9b59b6',
              extendedProps: {
                type: 'estagio_prorrogacao',
                studentName: internship.nome_aluno,
              },
            });
          }
        });
      }
    });

    if (role === 'articulator') {
      visitasDoArticuladorData.forEach((visit: any) => {
        const visitDate = parseDateString(visit.data_visita);
        if (visitDate) {
          allEvents.push({
            title: `Visita Articulador: ${visit.empresa}`,
            date: visitDate,
            color: '#34495e',
            extendedProps: {
              type: 'visita_articulador',
              company: visit.empresa,
              periodo: visit.periodo_visita,
              tipo: visit.tipo_visita,
            },
          });
        }
      });
    }

    if (role === 'advisor') {
      visitasDoOrientadorData.forEach((visit: any) => {
        const orientadorVisitNormalized = normalizeName(visit.orientador || '');
        if (orientadorVisitNormalized === userNameNormalized) {
          const visitDate = parseDateString(visit.data_visita);
          if (visitDate) {
            allEvents.push({
              title: `Visita Orientador: ${visit.empresa} (${visit.nome_estagiario || 'N/A'})`,
              date: visitDate,
              color: '#16a085',
              extendedProps: {
                type: 'visita_orientador',
                company: visit.empresa,
                studentName: visit.nome_estagiario,
                periodo: visit.periodo_visita,
                tipo: visit.tipo_visita,
              },
            });
          }
        }
      });
    }

    setEvents(allEvents);
  }, [user, role]);

  const handleEventMouseEnter = (info: any) => {
    const rect = info.el.getBoundingClientRect();
    setHoveredEvent(info.event as CalendarEvent);
    setTooltipPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setTooltipPosition(null);
  };

  const renderTooltipContent = (event: CalendarEvent) => {
    if (!event.extendedProps) return event.title;

    switch (event.extendedProps.type) {
      case 'estagio_inicio':
        return (
          <>
            <p className="font-bold">Início do Estágio</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Empresa: {event.extendedProps.company}</p>
            <p>Data: {event.date}</p>
          </>
        );
      case 'estagio_termino':
        return (
          <>
            <p className="font-bold">Término Previsto do Estágio</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Empresa: {event.extendedProps.company}</p>
            <p>Data: {event.date}</p>
          </>
        );
      case 'estagio_conclusao':
        return (
          <>
            <p className="font-bold">Conclusão do Estágio</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Empresa: {event.extendedProps.company}</p>
            <p>Data: {event.date}</p>
            {event.extendedProps.motivo && <p>Motivo: {event.extendedProps.motivo}</p>}
          </>
        );
      case 'relatorio_parcial':
      case 'relatorio_final':
        return (
          <>
            <p className="font-bold">{event.title}</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Data de Entrega: {event.date}</p>
            {event.extendedProps.reportType && <p>Tipo: {event.extendedProps.reportType}</p>}
          </>
        );
      case 'estagio_prorrogacao':
        return (
          <>
            <p className="font-bold">Prorrogação de Estágio</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Data: {event.date}</p>
          </>
        );
      case 'visita_articulador':
        return (
          <>
            <p className="font-bold">Visita do Articulador</p>
            <p>Empresa: {event.extendedProps.company}</p>
            <p>Data: {event.date}</p>
            <p>Período: {event.extendedProps.periodo}</p>
            <p>Tipo: {event.extendedProps.tipo}</p>
          </>
        );
      case 'visita_orientador':
        return (
          <>
            <p className="font-bold">Visita do Orientador</p>
            <p>Empresa: {event.extendedProps.company}</p>
            <p>Aluno: {event.extendedProps.studentName}</p>
            <p>Data: {event.date}</p>
            <p>Período: {event.extendedProps.periodo}</p>
            <p>Tipo: {event.extendedProps.tipo}</p>
          </>
        );
      default:
        return event.title;
    }
  };

  return (
    <>
      <Helmet title='Calendário' />
      <TooltipProvider>
        <div style={{ position: 'relative' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptLocale}
            events={events}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            height="auto"
          />

          {hoveredEvent && tooltipPosition && (
            <Tooltip open>
              <TooltipTrigger asChild>
                <div
                  style={{
                    position: 'absolute',
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    width: tooltipPosition.width,
                    height: tooltipPosition.height,
                    zIndex: 9999,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                {renderTooltipContent(hoveredEvent)}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </>
  );
}
