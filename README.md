# AntiFraudApp - Plataforma Global de Prevenção de Fraudes Digitais

Proteção inteligente contra fraudes digitais com IA, análise comportamental, validação de dados e geolocalização segura.

## Arquitetura

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL) + Edge Functions
- **Autenticação**: Supabase Auth (Email/Password)
- **Banco de Dados**: Supabase PostgreSQL com Row Level Security

## Funcionalidades

✅ Análise de fraude em tempo real
✅ Deteção de emails suspeitos
✅ Validação de números de telefone
✅ Análise de links maliciosos
✅ Validação de endereços criptomoeda
✅ Sistema de denúncias com geolocalização
✅ Dashboard intuitivo
✅ Autenticação segura

## Setup Rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e preencha com suas credenciais Supabase:

```bash
cp .env.example .env
```

Adicione suas chaves Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Build para produção

```bash
npm run build
```

Os ficheiros otimizados estarão em `dist/`

## Análise de Fraude

### Tipos Suportados

1. **Email**: Deteta emails temporários, domínios suspeitos, padrões de phishing
2. **Telefone**: Valida formato, deteta spam, extorsão, vishing
3. **Link**: Identifica URLs encurtadas, malware, phishing, palavras-chave suspeitas
4. **Criptomoeda**: Valida endereços, deteta rug pulls, Ponzi, pump and dump

### Sistema de Risco

- **LOW (Baixo)**: Score < 30 - Seguro
- **MEDIUM (Médio)**: Score 30-60 - Requer atenção
- **HIGH (Alto)**: Score 60-80 - Provável fraude
- **CRITICAL (Crítico)**: Score > 80 - Fraude confirmada

## Estrutura do Projeto

```
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # App root
│   ├── lib/
│   │   ├── supabase.ts    # Cliente Supabase
│   │   └── fraud-api.ts   # API de análise
│   └── pages/
│       ├── AuthPage.tsx   # Login/Register
│       └── Dashboard.tsx  # Dashboard principal
├── supabase/
│   └── functions/
│       └── fraud-detection/  # Edge Function
├── dist/                  # Build output
└── index.html             # HTML template
```

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação segura com Supabase Auth
- Sem dados pessoais armazenados desnecessariamente
- HTTPS obrigatório em produção
- CORS configurado adequadamente

## Deploy

### Para antifraudapp.com

1. Fazer build: `npm run build`
2. Fazer deploy dos ficheiros em `dist/` para seu servidor
3. Configurar DNS:
   - A record: `antifraudapp.com` → IP do servidor
   - CNAME: `www.antifraudapp.com` → `antifraudapp.com`

### Edge Functions

As Edge Functions são automaticamente deployadas via Supabase:

```bash
npm run build
```

## Desenvolvimento

### Type Checking

```bash
npx tsc --noEmit
```

### Estrutura de Ficheiros

- Componentes em `src/pages/`
- Lógica de negócio em `src/lib/`
- Tipos TypeScript ao lado dos ficheiros

## Licença

MIT - Ver ficheiro LICENSE

## Contacto

Equipa HTenterprise
- Website: https://antifraudapp.com
- Email: support@antifraudapp.com

---

**Nota**: AntiFraudApp é uma ferramenta de apoio à prevenção de fraude. Não substitui sistemas oficiais nem aconselhamento profissional.
