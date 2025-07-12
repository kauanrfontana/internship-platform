import { Helmet } from 'react-helmet-async';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HoveredEvent = {
  title: string;
};

export function Calendar() {
  const [hoveredEvent, setHoveredEvent] = useState<HoveredEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const handleEventMouseEnter = (info: any) => {
    const rect = info.el.getBoundingClientRect();
    setHoveredEvent(info.event);
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

  return (
    <>
      <Helmet title='Calendário' />
      <TooltipProvider>
        <div style={{ position: 'relative' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptLocale}
            events={[
              { title: 'Evento 1', date: '2025-06-27' },
              { title: 'Evento 2', date: '2025-06-20', color: "red", end: "2025-06-26" },
            ]}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
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
                {hoveredEvent.title}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </>
  );
}