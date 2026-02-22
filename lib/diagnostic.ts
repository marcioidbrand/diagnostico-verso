export type LeadData = {
  nome: string;
  email: string;
  empresa: string;
  segmento: string;
  porte?: string;
  siteInstagram?: string;
  consentimento: boolean;
};

export type Choice = "A" | "B" | "C";

export const QUESTIONS = [
  "Q1. Sua marca possui visão estratégica clara para os próximos 12 meses?",
  "Q2. O posicionamento e a essência da marca estão bem definidos e documentados?",
  "Q3. O discurso da marca gera identificação emocional com o público?",
  "Q4. Há consistência entre promessa, experiência e comunicação?",
  "Q5. Existem processos e playbooks para marketing/comercial?",
  "Q6. Vocês medem indicadores e usam dados para ajustar o posicionamento?",
  "Q7. A operação interna sustenta crescimento com qualidade?"
] as const;

export const OPTIONS: Record<Choice, string> = {
  A: "A) Não / muito pouco estruturado",
  B: "B) Parcialmente estruturado",
  C: "C) Bem estruturado e consistente"
};

const SCORE_MAP: Record<Choice, number> = { A: 0, B: 5, C: 10 };

export function scoreChoice(choice: Choice): number {
  return SCORE_MAP[choice];
}

export function classify(score: number): string {
  if (score >= 8) return "Maturidade elevada";
  if (score >= 5) return "Maturidade em evolução";
  return "Base crítica a desenvolver";
}

export function computePillars(answers: Choice[]) {
  const points = answers.map(scoreChoice);
  const visao = points[0];
  const essencia = points[1];
  const ressonancia = (points[2] + points[3]) / 2;
  const sistema = (points[4] + points[5]) / 2;
  const organizacao = points[6];
  const final = Number(((visao + essencia + ressonancia + sistema + organizacao) / 5).toFixed(2));

  return {
    visao,
    essencia,
    ressonancia,
    sistema,
    organizacao,
    final,
    classificacao: classify(final)
  };
}

export function buildPremiumReportHtml(input: {
  lead: LeadData;
  answers: Choice[];
  pillars: ReturnType<typeof computePillars>;
  pdfUrl?: string;
}) {
  const { lead, pillars } = input;

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /><title>Relatório Premium VERSO</title>
<style>
body{font-family:Arial,sans-serif;margin:28px;color:#0f172a} h1,h2{margin:0 0 10px}
section{margin:20px 0;padding:14px;border:1px solid #e2e8f0;border-radius:8px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
strong{color:#1e293b}
</style></head><body>
<section><h1>Diagnóstico VERSO — Relatório Premium</h1><p><strong>Empresa:</strong> ${lead.empresa}</p><p><strong>Lead:</strong> ${lead.nome} (${lead.email})</p></section>
<section><h2>Resumo Executivo</h2><p>Nota final: <strong>${pillars.final}</strong> — ${pillars.classificacao}.</p></section>
<section><h2>Radar / Pilares</h2><div class="grid"><p>Visão: <strong>${pillars.visao}</strong></p><p>Essência: <strong>${pillars.essencia}</strong></p><p>Ressonância: <strong>${pillars.ressonancia}</strong></p><p>Sistema: <strong>${pillars.sistema}</strong></p><p>Organização: <strong>${pillars.organizacao}</strong></p></div></section>
<section><h2>Forças e Oportunidades</h2><p>Forças: pilares com nota ≥ 8. Oportunidades: pilares com nota ≤ 5.</p></section>
<section><h2>Plano 30 / 60 / 90</h2><p>30 dias: alinhamento estratégico; 60 dias: implementação de rituais e governança; 90 dias: otimização e escala orientada por dados.</p></section>
<section><h2>Próximo passo</h2><p>Agendar call estratégica para aprofundar o diagnóstico e plano tático.</p><p>${input.pdfUrl ? `PDF: ${input.pdfUrl}` : "PDF será disponibilizado após processamento."}</p></section>
</body></html>`;
}
