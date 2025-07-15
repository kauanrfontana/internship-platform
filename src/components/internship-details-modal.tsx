import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InternshipWithExtra } from '@/types/internship'

export function InternshipDetailsModal({
  internship,
  open,
  onOpenChange,
}: {
  internship: InternshipWithExtra
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Estágio</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          <Section title="Informações Gerais">
            <Detail label="Obrigatório" value={internship.obrigatorio ? 'Sim' : 'Não'} />
            <Detail label="Início" value={internship.startDate} />
            <Detail label="Término Previsto" value={internship.endDate} />
            <Detail label="Prazo Máximo" value={internship.prazoMaximo ?? '-'} /> {/* Corrigido aqui */}
          </Section>

          {/* 2. Orientação */}
          <Section title="Orientação">
            <Detail label="Orientador Atual" value={internship.orientadorAtual ?? '-'} /> {/* Corrigido aqui */}
            <Detail label="Orientador Anterior" value={internship.orientadorAnterior ?? '-'} />
          </Section>

          {/* 3. Empresa */}
          <Section title="Empresa">
            <Detail label="Nome da Empresa" value={internship.company} />
            <Detail label="Supervisor" value={internship.supervisor ?? '-'} />
          </Section>

          {/* 4. Documentação */}
          <Section title="Documentação">
            <Detail label="TCE Entregue" value={internship.tceEntregue ? 'Sim' : 'Não'} />
            <Detail label="FPE" value={internship.fpe ?? '-'} /> {/* Corrigido aqui */}
            <Detail label="Prorrogações" value={internship.prorrogacoes ?? 'Nenhuma'} />
          </Section>

          {/* 5. Relatórios */}
          <Section title="Relatórios">
            <Detail label="Parcial 1" value={internship.relatorios?.parcial1 ?? '-'} />
            <Detail label="Parcial 2" value={internship.relatorios?.parcial2 ?? '-'} />
            <Detail label="Parcial 3" value={internship.relatorios?.parcial3 ?? '-'} />
            <Detail label="Final" value={internship.relatorios?.final ?? '-'} />
          </Section>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold text-foreground mb-3 border-b border-muted pb-1">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mt-2">
        {children}
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
