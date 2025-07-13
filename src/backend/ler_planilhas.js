const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const schedule = require('node-schedule');

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SPREADSHEET_ID = "1IaAbCsXgjQY4n4C1Oujfxiy1Lg4VcCNe-vVt1kHJL8c";
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const TAB_NAMES = ["Registro de Estágios", "Visitas do Articulador", "Visitas do Orientador", "Usuários", "FAQ"];

const START_LINES_MAP = {
    "Registro de Estágios": 9,
    "Visitas do Articulador": 2,
    "Visitas do Orientador": 2,
    "Usuários": 2,
    "FAQ": 2,
};

const COLUMNS_MAP_BY_TAB = {
    "Registro de Estágios": { "nome_aluno": 0, "obrig": 1, "empresa": 2, "tce_entregue": 3, "conclusao_do_estagio.data_realizado": 4, "conclusao_do_estagio.motivo": 5, "prazo_maximo": 6, "orientador_designado_por_articulador_atual": 7, "orientador_designado_por_articulador_anterior": 8, "fpe.limite": 9, "fpe.realizado": 10, "inicio_tce_aprovado": 11, "termino_previsto": 12, "relatorios.parcial_1.limite": 13, "relatorios.parcial_1.entregue": 14, "relatorios.parcial_1.realizado": 15, "relatorios.parcial_2.limite": 16, "relatorios.parcial_2.entregue": 17, "relatorios.parcial_2.realizado": 18, "relatorios.parcial_3.limite": 19, "relatorios.parcial_3.entregue": 20, "relatorios.parcial_3.realizado": 21, "relatorios.final.limite": 22, "relatorios.final.entregue": 23, "relatorios.final.realizado": 24, "prorrogacoes_do_estagio.data_1": 25, "prorrogacoes_do_estagio.data_2": 26, "prorrogacoes_do_estagio.data_3": 27, "supervisor_na_empresa": 28 },
    "Visitas do Articulador": { "data_visita": 0, "periodo_visita": 1, "tipo_visita": 2, "efetivada": 3, "empresa": 4, "tipificacao_empresa": 5, "supervisor_na_empresa": 6, "cargo": 7, "estagiarios_ativos.obrigatorios": 8, "estagiarios_ativos.nao_obrigatorios": 9, "resumo_instalacoes": 10, "atividades_principais": 11, "tecnologias_principais": 12, "perfil_desejado_estagiarios": 13, "consideracoes_encaminhamentos": 14 },
    "Visitas do Orientador": { "orientador": 0, "data_visita": 1, "periodo_visita": 2, "tipo_visita": 3, "efetivada": 4, "empresa": 5, "tipificacao_empresa": 6, "supervisor_na_empresa": 7, "cargo": 8, "nome_estagiario": 9, "obrigatorio": 10, "tempo_transcorrido_estagio": 11, "atividade_principais_atuais": 12, "progresso_atividades_anteriores": 13, "comentario_supervisor": 14, "comentario_estagiario": 15, "consideracoes_encaminhamentos": 16 },
    "Usuários": { "nome": 0, "tipo": 1, "login": 2, "senha": 3, },
    "FAQ": { "pergunta": 0, "resposta": 1, },
};

class Planilha {
    
    async coletarEstagios() { return this._lerArquivoJSON('registro_de_estagios'); }
    async coletarVisitasArticulador() { return this._lerArquivoJSON('visitas_do_articulador'); }
    async coletarVisitasOrientador() { return this._lerArquivoJSON('visitas_do_orientador'); }
    async coletarUsuarios() { return this._lerArquivoJSON('usuarios'); }
    async coletarFaq() { return this._lerArquivoJSON('faq'); }

    async sincronizar() {
        console.log(`[${new Date().toLocaleString('pt-BR')}] Sincronizando dados da Planilha Google...`);
        const auth = await this._getCreds();
        if (!auth) {
            console.error("Falha na autenticação. Sincronização cancelada.");
            return false;
        }

        try {
            for (const tabName of TAB_NAMES) {
                const dataList = await this._getDataFromTab(auth, tabName);
                const fileName = this._normalizeFileName(tabName) + ".json";
                const jsonOutput = JSON.stringify(dataList, null, 2);
                await fs.writeFile(fileName, jsonOutput, { encoding: "utf-8" });
            }
            console.log("Sincronização concluída com sucesso.");
            return true;
        } catch (err) {
            console.error("Ocorreu um erro durante a sincronização:", err.message);
            return false;
        }
    }

    async _lerArquivoJSON(nomeBase) {
        const nomeArquivo = `${nomeBase}.json`;
        try {
            const data = await fs.readFile(nomeArquivo, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(`AVISO: Arquivo '${nomeArquivo}' não encontrado. A sincronização ainda não ocorreu ou falhou.`);
            } else {
                console.error(`Erro ao ler ou parsear o arquivo '${nomeArquivo}':`, error);
            }
            return null;
        }
    }
    
    async _getCreds() {
        try {
            const auth = new google.auth.GoogleAuth({
                keyFile: CREDENTIALS_PATH,
                scopes: SCOPES,
            });
            const client = await auth.getClient();
            return client;
        } catch (err) {
            console.error('ERRO AO CARREGAR CREDENCIAIS DA CONTA DE SERVIÇO. Verifique se o arquivo "credentials.json" é de uma Conta de Serviço e se o caminho está correto.', err.message);
            return null;
        }
    }

    async _getDataFromTab(auth, tabName) {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${tabName}'`,
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            console.log(`   - Info: Aba '${tabName}' está vazia. Retornando lista vazia.`);
            return [];
        }
        
        const startLine = START_LINES_MAP[tabName];
        if (rows.length < startLine) {
            return [];
        }

        const dataRows = rows.slice(startLine - 1);
        const objectList = [];

        for (const row of dataRows) {
            if (row.every(cell => !cell)) continue;

            const obj = {};
            const columnMap = COLUMNS_MAP_BY_TAB[tabName];

            for (const [mappedKey, columnIndex] of Object.entries(columnMap)) {
                const value = columnIndex < row.length ? (row[columnIndex] || "").trim() : "";
                const parts = mappedKey.split('.');
                let currentLevel = obj;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        currentLevel[part] = value;
                    } else {
                        currentLevel[part] = currentLevel[part] || {};
                        currentLevel = currentLevel[part];
                    }
                }
            }
            
            if ((tabName === "Registro de Estágios" && obj.nome_aluno) || (tabName === "Visitas do Articulador" && obj.empresa) || (tabName === "Visitas do Orientador" && obj.nome_estagiario) || (tabName === "Usuários" && obj.nome) || (tabName === "FAQ" && obj.pergunta)) {
                objectList.push(obj);
            }
        }
        return objectList;
    }

    _normalizeFileName(tabName) {
        return tabName.toLowerCase().replace(/ /g, "_").replace(/[ãá]/g, "a").replace(/ç/g, "c").replace(/í/g, "i");
    }
}

let agendadorIniciado = false;

async function inicializarPlanilha() {
    const minhaPlanilha = new Planilha();
    const sucesso = await minhaPlanilha.sincronizar();

    if (!sucesso) {
        console.error("A sincronização inicial falhou. O agendador não será iniciado e a aplicação não poderá coletar dados.");
        return null;
    }

    if (!agendadorIniciado) {
        schedule.scheduleJob('*/1 * * * *', () => {
            console.log(`\n[Agendador - ${new Date().toLocaleTimeString('pt-BR')}] Executando sincronização periódica...`);
            minhaPlanilha.sincronizar();
        });
        agendadorIniciado = true;
        console.log("\nServiço de sincronização periódica agendado para cada minuto.");
    }
    
    return minhaPlanilha;
}

module.exports = { Planilha, inicializarPlanilha };