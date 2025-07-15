import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/middlewares/auth-provider'

import registroDeEstagiosData from '@/backend/registro_de_estagios.json'

const downloadCsv = (data: any, filename: any, columns: any) => {
  if (!data.length) {
    alert("Nenhum dado para exportar.");
    return;
  }

  // Cria o cabeçalho do CSV
  const header = columns.map((col: any) => `"${col.header.replace(/"/g, '""')}"`).join(',') + '\n';

  // Converte os dados para o formato CSV
  const csvContent = data.map((row: any) =>
    columns.map((col: any) => {
      let value = row[col.key];
      if (value === null || value === undefined) {
        value = '';
      }
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = value.split('-');
        value = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  const fullCsvString = header + csvContent;
  const blob = new Blob([fullCsvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const normalizeName = (name: any) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function Reports() {
  const { role, user } = useAuth()

  // Função para exportar "Relatório de Orientados Antigos" para Orientadores
  const handleExportOldAdvisingReport = () => {
    if (!user) return;

    const userNameNormalized = normalizeName(user.nome);

    const filteredData = registroDeEstagiosData
      .filter(internship => {
        const orientadorAtualNormalized = normalizeName(internship.orientador_designado_por_articulador_atual || '');
        const orientadorAnteriorNormalized = normalizeName(internship.orientador_designado_por_articulador_anterior || '');
        
        const isPastAdvising = 
          (orientadorAnteriorNormalized === userNameNormalized && internship.conclusao_do_estagio?.data_realizado) ||
          (orientadorAtualNormalized === userNameNormalized && internship.conclusao_do_estagio?.data_realizado);

        return isPastAdvising;
      })
      .map(internship => ({
        'Nome do Aluno': internship.nome_aluno,
        'Empresa': internship.empresa,
        'Orientador Atual': internship.orientador_designado_por_articulador_atual,
        'Orientador Anterior': internship.orientador_designado_por_articulador_anterior,
        'Status de Conclusão': internship.conclusao_do_estagio?.data_realizado ? 'Concluído' : 'Não Concluído',
        'Data de Conclusão': internship.conclusao_do_estagio?.data_realizado,
      }));

    const columns = [
      { header: 'Nome do Aluno', key: 'Nome do Aluno' },
      { header: 'Empresa', key: 'Empresa' },
      { header: 'Orientador Atual', key: 'Orientador Atual' },
      { header: 'Orientador Anterior', key: 'Orientador Anterior' },
      { header: 'Status de Conclusão', key: 'Status de Conclusão' },
      { header: 'Data de Conclusão', key: 'Data de Conclusão' },
    ];
    
    downloadCsv(filteredData, 'relatorio_orientados_antigos.csv', columns);
  };
  
  const handleExportOldAdvisingByAdvisorReport = () => {
    const data: any = [];
    registroDeEstagiosData.forEach(internship => {
      if (internship.conclusao_do_estagio?.data_realizado) {
        if (internship.orientador_designado_por_articulador_atual) {
          data.push({
            'Orientador': internship.orientador_designado_por_articulador_atual,
            'Nome do Aluno': internship.nome_aluno,
            'Empresa': internship.empresa,
            'Status de Conclusão': 'Concluído',
            'Data de Conclusão': internship.conclusao_do_estagio.data_realizado,
          });
        }
        if (internship.orientador_designado_por_articulador_anterior && 
            internship.orientador_designado_por_articulador_anterior !== internship.orientador_designado_por_articulador_atual) {
          data.push({
            'Orientador': internship.orientador_designado_por_articulador_anterior,
            'Nome do Aluno': internship.nome_aluno,
            'Empresa': internship.empresa,
            'Status de Conclusão': 'Concluído',
            'Data de Conclusão': internship.conclusao_do_estagio.data_realizado,
          });
        }
      }
    });

    const columns = [
        { header: 'Orientador', key: 'Orientador' },
        { header: 'Nome do Aluno', key: 'Nome do Aluno' },
        { header: 'Empresa', key: 'Empresa' },
        { header: 'Status de Conclusão', key: 'Status de Conclusão' },
        { header: 'Data de Conclusão', key: 'Data de Conclusão' },
    ];

    downloadCsv(data, 'relatorio_orientados_antigos_por_orientador.csv', columns);
  };

  const handleExportOldAdvisorsReport = () => {
    const oldAdvisorsSet = new Set();
    
    registroDeEstagiosData.forEach(internship => {
      if (internship.orientador_designado_por_articulador_anterior) {
        oldAdvisorsSet.add(internship.orientador_designado_por_articulador_anterior);
      }
    });

    const data = Array.from(oldAdvisorsSet).map(advisorName => ({
      'Nome do Orientador': advisorName,
    }));
    
    const columns = [
      { header: 'Nome do Orientador', key: 'Nome do Orientador' },
    ];
    
    downloadCsv(data, 'relatorio_orientadores_antigos.csv', columns);
  };

  // Função para exportar "Relatório de todos os estágios" (Articulador)
  const handleExportAllInternshipsReport = () => {
    const data = registroDeEstagiosData.map(internship => ({
      'Nome do Aluno': internship.nome_aluno,
      'Empresa': internship.empresa,
      'Início do Estágio': internship.inicio_tce_aprovado,
      'Término Previsto': internship.termino_previsto,
      'Conclusão do Estágio': internship.conclusao_do_estagio?.data_realizado,
      'Orientador Atual': internship.orientador_designado_por_articulador_atual,
      'Orientador Anterior': internship.orientador_designado_por_articulador_anterior,
    }));
    
    const columns = [
      { header: 'Nome do Aluno', key: 'Nome do Aluno' },
      { header: 'Empresa', key: 'Empresa' },
      { header: 'Início do Estágio', key: 'Início do Estágio' },
      { header: 'Término Previsto', key: 'Término Previsto' },
      { header: 'Conclusão do Estágio', key: 'Conclusão do Estágio' },
      { header: 'Orientador Atual', key: 'Orientador Atual' },
      { header: 'Orientador Anterior', key: 'Orientador Anterior' },
    ];
    
    downloadCsv(data, 'relatorio_todos_estagios.csv', columns);
  };

  return (
    <>
      <Helmet title="Relatórios" />

      <div className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            <h1 className="text-2xl font-semibold text-center mb-8">Gerar Relatórios</h1>

            {/* Relatórios para Orientador */}
            {role === 'advisor' && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleExportOldAdvisingReport}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  EXPORTAR RELATÓRIO ORIENTADOS ANTIGOS
                </Button>
              </div>
            )}

            {/* Relatórios para Articulador */}
            {role === 'articulator' && (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={handleExportOldAdvisingByAdvisorReport}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full md:w-auto"
                >
                  EXPORTAR RELATÓRIO ORIENTADOS ANTIGOS POR ORIENTADOR
                </Button>
                <Button 
                  onClick={handleExportOldAdvisorsReport}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full md:w-auto"
                >
                  EXPORTAR RELATÓRIO ORIENTADORES ANTIGOS
                </Button>
                <Button 
                  onClick={handleExportAllInternshipsReport}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full md:w-auto"
                >
                  EXPORTAR RELATÓRIO DE TODOS OS ESTÁGIOS
                </Button>
              </div>
            )}

            <Card className="bg-gray-200 border-gray-300 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-800 font-semibold text-xl">
                  Gerar Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center text-gray-600">
                Selecione uma das opções acima para gerar e baixar o relatório desejado em formato CSV.
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}