import os.path
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SAMPLE_SPREADSHEET_ID = "1IaAbCsXgjQY4n4C1Oujfxiy1Lg4VcCNe-vVt1kHJL8c" 

TAB_NAMES = [
    "Registro de Estágios",
    "Visitas do Articulador",
    "Visitas do Orientador",
    "Usuários"
]

START_LINES_MAP = {
    "Registro de Estágios": 9,
    "Visitas do Articulador": 2,
    "Visitas do Orientador": 2,
    "Usuários": 2
}

# MAPIAR a chave do JSON para o ÍNDICE da coluna (A=0, B=1, C=2, etc.)
# Para aninhar, use um ponto (.), como em "conclusao_do_estagio.motivo"
COLUMNS_MAP_BY_TAB = {
    "Registro de Estágios": {
        # Chave no JSON final : Índice da Coluna
        "nome_aluno": 0,
        "obrig": 1,
        "empresa": 2,
        "tce_entregue": 3,

        # Exemplo para o objeto aninhado "conclusao_do_estagio"
        "conclusao_do_estagio.data_realizado": 4,
        "conclusao_do_estagio.motivo": 5,

        "prazo_maximo": 6,
        "orientador_designado_por_articulador_atual": 7,
        "orientador_designado_por_articulador_anterior": 8,
        "fpe.limite": 9,
        "fpe.realizado": 10,
        "inicio_tce_aprovado": 11,
        "termino_previsto": 12,
        
        # Exemplo para outro objeto aninhado
        "relatorios.parcial_1.limite": 13,
        "relatorios.parcial_1.entregue": 14,
        "relatorios.parcial_1.realizado": 15,
        "relatorios.parcial_2.limite": 16,
        "relatorios.parcial_2.entregue": 17,
        "relatorios.parcial_2.realizado": 18,
        "relatorios.parcial_3.limite": 19,
        "relatorios.parcial_3.entregue": 20,
        "relatorios.parcial_3.realizado": 21,
        "relatorios.final.limite": 22,
        "relatorios.final.entregue": 23,
        "relatorios.final.realizado": 24,
        "prorrogacoes_do_estagio.data_1": 25,
        "prorrogacoes_do_estagio.data_2": 26,
        "prorrogacoes_do_estagio.data_3": 27,

        "supervisor_na_empresa": 28
    },
    "Visitas do Articulador": {
        "data_visita": 0,
        "periodo_visita": 1,
        "tipo_visita": 2,
        "efetivada": 3,
        "empresa": 4,
        "tipificacao_empresa": 5,
        "supervisor_na_empresa": 6,
        "cargo": 7,
        "estagiarios_ativos.obrigatorios": 8, 
        "estagiarios_ativos.nao_obrigatorios": 9,
        "resumo_instalacoes": 10,
        "atividades_principais": 11,
        "tecnologias_principais": 12,
        "perfil_desejado_estagiarios": 13,
        "consideracoes_encaminhamentos": 14
    },
    "Visitas do Orientador": {
        "cargo": 0,
        "nome_estagiario": 1,
        "obrigatorio": 2,
        "tempo_transcorrido_estagio": 3,
        "atividades_principais_atuais": 4,
        "progresso_atividades_anteriores": 5,
        "comentarios_supervisor_estagiario": 6,
        "comentarios_estagiario": 7,
        "consideracoes_encaminhamentos": 8
    },
    "Usuários": {
        "nome": 0,
        "tipo": 1,
        "login": 2,
        "senha": 3,
    },
}

def get_creds()-> Credentials:
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return creds

def create_json_file(nome_arquivo: str, dados: str):
    with open(nome_arquivo, "w", encoding="utf-8") as f:
        f.write(dados)

def spreadsheet_is_empty(values: list, linha_inicial: int)-> bool:
    if len(values) < linha_inicial:
        return True
    else:
        return False

def get_data_from_tab(tab_name: str, service)-> list:
    sheet = service.spreadsheets()
    # Adicione aspas simples ao redor do nome da aba para garantir que seja interpretado corretamente
    result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID, range=f"'{tab_name}'").execute()
    values = result.get("values", [])

    linha_inicial_dados = START_LINES_MAP[tab_name] # Corrected: Used START_LINES_MAP[tab_name]

    if spreadsheet_is_empty(values, linha_inicial_dados):
        return []
    
    data_rows = values[linha_inicial_dados - 1:]

    object_list = []
    for i, row in enumerate(data_rows):
        # Ignora linhas completamente vazias
        if not any(row):
            continue
        
        obj = {}
        for maped_key, column_index in COLUMNS_MAP_BY_TAB[tab_name].items():
            valor = row[column_index].strip() if column_index < len(row) and column_index < len(row) else "" # Added column_index < len(row) check
            
            # Lógica de aninhamento corrigida para múltiplos níveis
            parts = maped_key.split('.')
            current_level = obj
            for j, part in enumerate(parts):
                if j == len(parts) - 1: # Se for a última parte, atribui o valor
                    current_level[part] = valor
                else: # Se não for a última parte, navega ou cria o nível
                    if part not in current_level:
                        current_level[part] = {}
                    current_level = current_level[part]
        
        # Adiciona o objeto somente se houver um valor para o nome do aluno/estagiário/empresa,
        # para evitar adicionar objetos vazios ou incompletos.
        if tab_name == "Registro de Estágios" and obj.get("nome_aluno"):
            object_list.append(obj)
        elif tab_name == "Visitas do Articulador" and obj.get("empresa"):
            object_list.append(obj)
        elif tab_name == "Visitas do Orientador" and obj.get("nome_estagiario"):
            object_list.append(obj)
        elif tab_name == "Usuários" and obj.get("nome"):
            object_list.append(obj)
        # If none of the specific primary identifiers are found, but the row has some data,
        # you might still want to include it. This is a design choice.
        # For now, I'm sticking to the more robust check.

    return object_list

def get_data_from_spreadsheet()-> dict:
    full_data = {}
    creds = get_creds()
    try:
        service = build("sheets", "v4", credentials=creds)
        for tab in TAB_NAMES:
            full_data[tab] = get_data_from_tab(tab, service) # Corrected: Pass service object
        
        return full_data
    except HttpError as err:
        print(f"Ocorreu um erro ao acessar a planilha: {err}")
        return {}

def main():
    all_spreadsheet_data = get_data_from_spreadsheet()

    if not all_spreadsheet_data:
        print("Não foi possível obter dados da planilha. Verifique a conexão ou permissões.")
        return

    for tab_name, data_list in all_spreadsheet_data.items():
        file_name = tab_name.lower().replace(" ", "_").replace("ã", "a").replace("á","a").replace("ç", "c").replace("í", "i") + ".json"
        json_output = json.dumps(data_list, indent=2, ensure_ascii=False)
        create_json_file(file_name, json_output)
        print(f"Dados da aba '{tab_name}' salvos em '{file_name}'")
     

if __name__ == "__main__":
    main()