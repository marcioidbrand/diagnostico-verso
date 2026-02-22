# Diagnóstico VERSO

App Next.js (App Router) com fluxo conversacional (estilo chat) para diagnóstico de marca em 7 perguntas e persistência no Supabase.

## Funcionalidades
- Página inicial `/` com CTA para iniciar o diagnóstico.
- Página `/diagnostico` com consentimento LGPD e chat com suporte a Enter para avançar nos campos de lead.
- Coleta de lead: `name`, `email`, `company`, `segment`, `size`, `website`, `instagram`.
- 7 perguntas A/B/C com score A=0, B=5, C=10.
- Cálculo de pilares:
  - Visão = Q1
  - Essência = Q2
  - Ressonância = média(Q3, Q4)
  - Sistema = média(Q5, Q6)
  - Organização = Q7
  - Total = média dos 5 pilares (0–10)
- Classificação:
  - 0–3.9: crítico
  - 4–6.9: em construção
  - 7–8.9: forte
  - 9–10: referência
- API Route `POST /api/lead` para gravação server-side no Supabase com `SUPABASE_SERVICE_ROLE_KEY`.
- Página `/privacy` com texto simples de privacidade (LGPD).

## Configuração
Crie o `.env.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Tabela esperada no Supabase

```sql
create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  company text not null,
  segment text,
  size text,
  website text,
  instagram text,
  answers jsonb not null,
  scores jsonb not null,
  total_score numeric not null
);
```

## Rodar localmente
```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Deploy na Vercel
1. Envie o projeto para o GitHub.
2. Importe na Vercel.
3. Configure as variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Faça deploy.
