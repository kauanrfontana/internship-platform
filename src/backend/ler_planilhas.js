const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const schedule = require('node-schedule');

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SAMPLE_SPREADSHEET_ID = "1IaAbCsXgjQY4n4C1Oujfxiy1Lg4VcCNe-vVt1kHJL8c";

const TAB_NAMES = [
    "Registro de Estágios",
    "Visitas do Articulador",
    "Visitas do Orientador",
    "Usuários",
    "FAQ",
];

const START_LINES_MAP = {
    "Registro de Estágios": 9,
    "Visitas do Articulador": 2,
    "Visitas do Orientador": 2,
    "Usuários": 2,
    "FAQ": 2,
};

const COLUMNS_MAP_BY_TAB = {
    "Registro de Estágios": {
        "nome_aluno": 0, "obrig": 1, "empresa": 2, "tce_entregue": 3,
        "conclusao_do_estagio.data_realizado": 4, "conclusao_do_estagio.motivo": 5,
        "prazo_maximo": 6,
        "orientador_designado_por_articulador_atual": 7,
        "orientador_designado_por_articulador_anterior": 8,
        "fpe.limite": 9, "fpe.realizado": 10,
        "inicio_tce_aprovado": 11, "termino_previsto": 12,
        "relatorios.parcial_1.limite": 13, "relatorios.parcial_1.entregue": 14, "relatorios.parcial_1.realizado": 15,
        "relatorios.parcial_2.limite": 16, "relatorios.parcial_2.entregue": 17, "relatorios.parcial_2.realizado": 18,
        "relatorios.parcial_3.limite": 19, "relatorios.parcial_3.entregue": 20, "relatorios.parcial_3.realizado": 21,
        "relatorios.final.limite": 22, "relatorios.final.entregue": 23, "relatorios.final.realizado": 24,
        "prorrogacoes_do_estagio.data_1": 25, "prorrogacoes_do_estagio.data_2": 26, "prorrogacoes_do_estagio.data_3": 27,
        "supervisor_na_empresa": 28
    },
    "Visitas do Articulador": {
        "data_visita": 0, "periodo_visita": 1, "tipo_visita": 2, "efetivada": 3, "empresa": 4,
        "tipificacao_empresa": 5, "supervisor_na_empresa": 6, "cargo": 7,
        "estagiarios_ativos.obrigatorios": 8, "estagiarios_ativos.nao_obrigatorios": 9,
        "resumo_instalacoes": 10, "atividades_principais": 11, "tecnologias_principais": 12,
        "perfil_desejado_estagiarios": 13, "consideracoes_encaminhamentos": 14
    },
    "Visitas do Orientador": {
        "orientador": 0, "data_visita": 1, "periodo_visita": 2, "tipo_visita": 3, "efetivada": 4,
        "empresa": 5, "tipificacao_empresa": 6, "supervisor_na_empresa": 7, "cargo": 8,
        "nome_estagiario": 9, "obrigatorio": 10, "tempo_transcorrido_estagio": 11,
        "atividade_principais_atuais": 12, "progresso_atividades_anteriores": 13,
        "comentario_supervisor": 14, "comentario_estagiario": 15, "consideracoes_encaminhamentos": 16
    },
    "Usuários": {
        "nome": 0, "tipo": 1, "login": 2, "senha": 3,
    },
     "FAQ": {
        "pergunta": 0, "resposta": 1,
    },
};

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');


async function getCreds() {
    try {
        const credentials = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(credentials).installed || JSON.parse(credentials).web;
        const client = google.auth.fromJSON(keys);
        
        let token;
        try {
            token = await fs.readFile(TOKEN_PATH);
            client.setCredentials(JSON.parse(token));
            return client;
        } catch (err) {
            // Se o token não existe ou é inválido, gera um novo.
            const authClient = await authenticate({
                scopes: SCOPES,
                keyfilePath: CREDENTIALS_PATH,
            });
            await fs.writeFile(TOKEN_PATH, JSON.stringify(authClient.credentials));
            console.log('Novo token de autenticação gerado e salvo em token.json');
            return authClient;
        }
    } catch (err) {
        console.error('Erro ao carregar o arquivo credentials.json. Certifique-se de que ele existe.', err);
        process.exit(1);
    }
}


/**
 * Cria um arquivo JSON com os dados fornecidos.
 */
async function createJsonFile(fileName, data) {
    await fs.writeFile(fileName, data, { encoding: "utf-8" });
}

/**
 * Busca e processa os dados de uma aba específica da planilha.
 */
async function getDataFromTab(auth, tabName) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SAMPLE_SPREADSHEET_ID,
        range: `'${tabName}'`,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
        return [];
    }
    
    const startLine = START_LINES_MAP[tabName];
    if (rows.length < startLine) {
        return [];
    }

    const dataRows = rows.slice(startLine - 1);
    const objectList = [];

    for (const row of dataRows) {
        if (row.every(cell => !cell)) { // Pula linha se estiver completamente vazia
            continue;
        }

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
        
        // Adiciona à lista apenas se o campo principal existir
        if ( (tabName === "Registro de Estágios" && obj.nome_aluno) ||
             (tabName === "Visitas do Articulador" && obj.empresa) ||
             (tabName === "Visitas do Orientador" && obj.nome_estagiario) ||
             (tabName === "Usuários" && obj.nome) ||
             (tabName === "FAQ" && obj.pergunta)
        ) {
            objectList.push(obj);
        }
    }
    return objectList;
}

/**
 * Orquestra a busca de dados de todas as abas.
 */
async function getDataFromSpreadsheet() {
    const fullData = {};
    const auth = await getCreds();
    try {
        for (const tab of TAB_NAMES) {
            fullData[tab] = await getDataFromTab(auth, tab);
        }
        return fullData;
    } catch (err) {
        console.error("Erro ao acessar a API do Google Sheets:", err);
        return {};
    }
}

/**
 * Função principal que é executada pelo agendador.
 */
async function runSpreadsheetDataJob() {
    console.log(`[${new Date().toLocaleString()}] Executando job de busca de dados da planilha...`);
    const allSpreadsheetData = await getDataFromSpreadsheet();

    if (Object.keys(allSpreadsheetData).length === 0) {
        console.log("Nenhum dado foi retornado. O job será encerrado.");
        return;
    }

    for (const [tabName, dataList] of Object.entries(allSpreadsheetData)) {
        const fileName = tabName.toLowerCase()
            .replace(/ /g, "_")
            .replace(/[ãá]/g, "a")
            .replace(/ç/g, "c")
            .replace(/í/g, "i") + ".json";
            
        const jsonOutput = JSON.stringify(dataList, null, 2);
        await createJsonFile(fileName, jsonOutput);
    }
    console.log("Arquivos JSON atualizados com sucesso.");
}

/**
 * Função principal para iniciar o agendador.
 */
function main() {
    console.log("Agendador iniciado. O trabalho será executado a cada minuto.");
    console.log("Pressione Ctrl+C para sair.");
    
    // Executa uma vez no início
    runSpreadsheetDataJob();
    
    // Agenda para executar a cada minuto
    schedule.scheduleJob('*/1 * * * *', runSpreadsheetDataJob);
}

main();