# Dashboard de Produtividade Full-Stack

Um backend completo em Node.js + TypeScript com Express, integrado ao Supabase e Gemini para analisar arquivos (PDF, CSV, XLSX) de produção MV (atendimentos por hora) e alimentar um painel de "Tabela Dinâmica".

## Estrutura do Pacote
- **`server.ts`**: Servidor Express unindo API de Backend e SPA do Frontend (Vite).
- **`src/routes/upload.ts`**: Rota `/api/upload` - recebe arquivo, lê com CSV/XLSX ou extrai PDF via Gemini, e salva na tabela `attendances`.
- **`src/routes/dashboard.ts`**: Rota `/api/dashboard` - consulta do Supabase, já agregando os dados por colaborador e hora.
- **`src/services/gemini.ts`**: Integração com API do Gemini para OCR e Parse de tabelas PDF.
- **`src/services/parser.ts`**: Parsing de CSV/XLSX e normalização na estrutura de tabelas.
- **`src/db/supabaseClient.ts`**: Cliente Supabase.
- **`supabase_schema.sql`**: Script SQL para banco do Supabase.
- **`src/App.tsx`**: Interface Dashboard em React que consome os endpoints criados.

## 🚀 Como Configurar e Rodar Localmente

1. **Extraia o código** 
   Extraia este `.zip` na sua máquina.

2. **Banco de Dados (Supabase)**
   Crie um projeto no seu [Supabase](https://supabase.com). 
   Na aba SQL Editor, execute todo o código de `supabase_schema.sql` para criar a tabela `attendances`.

3. **Arquivos de Ambiente (.env)**
   Renomeie o arquivo `.env.example` para `.env` (ou crie um novo) e preencha com suas chaves:
   ```env
   # Pegue essas chaves nas configurações (API) do seu projeto Supabase:
   SUPABASE_URL="https://seu-projeto.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="Sua-chave-secreta-service-role"

   # Pegue a chave do Gemini no Google AI Studio:
   GEMINI_API_KEY="AI..."
   ```

4. **Instale as dependências e inicie**
   Abra o terminal na pasta do projeto e rode:
   ```bash
   npm install
   npm run dev
   ```

5. **Acesse**
    O site rodará em `http://localhost:3000`. 
    - Na tela inicial, faça upload de um `.csv`, `.xlsx`, ou `.pdf`.
    - Os dados serão inseridos diretamente no seu banco Supabase.
    - O gráfico/tabela será atualizado chamando o endpoint `GET /api/dashboard`.

## Testando via Insomnia / Postman
Se quiser testar a API puro sem o dashboard React:
- **POST** `http://localhost:3000/api/upload` = Form-Data -> field: `file`
- **GET** `http://localhost:3000/api/dashboard?startDate=2026-03-01&endDate=2026-03-31`
