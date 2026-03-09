# Automação de Precificação de Produtos

Automação para o processo de precificação de produtos. Dividido em um pipeline de dados (Python) e scripts de automação (TypeScript para Google Apps Script).

## Estrutura do Projeto

* `data_pipeline/`: Contém os scripts em Python responsáveis pela extração, transformação e carga (ETL) dos dados de precificação.
* `apps_script/`: Contém o código TypeScript focado na integração e automação com o ecossistema do Google Workspace.
* `.github/workflows/`: Arquivos de configuração de CI/CD via GitHub Actions.

## Pré-requisitos

* Node.js e npm instalados
* Clasp (`@google/clasp`) instalado para gerenciamento do Apps Script
* Python 3.8 ou superior para execução do pipeline de dados

## Instalação e Configuração

### Google Apps Script (TypeScript)

1. Instale as dependências Node:

```bash
npm install

```

2. Realize a autenticação no Clasp:

```bash
clasp login

```

3. Vincule o projeto local ao seu Google Apps Script (se necessário):

```bash
clasp clone <SCRIPT_ID>

```

4. Para enviar o código para o Google Apps Script:

```bash
clasp push

```

### Pipeline de Dados (Python)

1. Acesse o diretório do pipeline:

```bash
cd data_pipeline

```

2. Crie e ative um ambiente virtual (opcional, mas recomendado):

```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

```

3. Instale as dependências do Python contidas no diretório (ex: via `requirements.txt`, se disponível):

```bash
pip install -r requirements.txt

```
