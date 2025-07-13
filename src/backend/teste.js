const { inicializarPlanilha } = require('./ler_planilhas.js');

async function rodarMeuPrograma() {
    console.log("Iniciando aplicação...");
    console.log("Aguardando a sincronização inicial com a Planilha Google...");
    
    const planilha = await inicializarPlanilha();

    if (!planilha) {
        console.error("\nNão foi possível inicializar a planilha. Encerrando.");
        return;
    }

    console.log("Sincronização inicial concluída com sucesso!");
    console.log("\n--- Coletando dados dos arquivos locais ---");

    const usuarios = await planilha.coletarUsuarios();
    if (usuarios) {
        console.log(`✅ [Usuários]: ${usuarios.length} registros encontrados.`);
    }

    const estagios = await planilha.coletarEstagios();
    if (estagios) {
        console.log(`✅ [Estágios]: ${estagios.length} registros encontrados.`);
    }
    
    console.log("\n--- Demonstração concluída ---");
    console.log("O programa principal terminou, mas o agendador continuará rodando em segundo plano.");
    console.log("Pressione Ctrl+C para encerrar o processo.");
}

rodarMeuPrograma();