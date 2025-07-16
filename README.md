# Passos para utilização
1. Na pasta raiz '.../internship-platform', execute o comando abaixo para instalar as dependências do frontend:
```bash
npm install
```

2. Execute o mesmo comando na pasta '.../internship-platform/src/backend' para instalar as dependências do script que traz os dados da planilha.

3. Execute o seguinte comando na pasta '.../internship-platform/src/backend':
```bash
node start.js
```
- Esse comando executa a leitura e criação dos arquivos *.json*, dos dados da [planilha](https://docs.google.com/spreadsheets/d/1IaAbCsXgjQY4n4C1Oujfxiy1Lg4VcCNe-vVt1kHJL8c/edit?gid=228468765#gid=228468765), assim como executa uma *cron*, para buscar os dados a cada minuto.

4. Execute o comando abaixo para iniciar a execução do frontend:
```bash
npm run dev
```
- Após sua execução o terminal mostrará a URL onde a aplicação está disponível.

## Observação
Para poder executar o script de busca dos dados, é necessário o arquivo 'credentials.json' na pasta '.../internship-platform/src/backend'.

Este arquivo, por questões de segurança, visto que que o mesmo da acesso a conta google, de um dos colaboradores, não está no repositório, e deve ser solicitado conforme for necessário.