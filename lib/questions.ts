export type Choice = "A" | "B" | "C";

export const SCORE_BY_CHOICE: Record<Choice, number> = {
  A: 0,
  B: 5,
  C: 10
};

export const QUESTIONS = [
  {
    id: "q1",
    pillar: "Visão",
    text: "Q1 (VISÃO): Em uma frase, sua marca existe para…",
    options: {
      A: "“A gente faz de tudo um pouco”",
      B: "“Temos um principal, mas a mensagem confunde”",
      C: "“É claro: para quem é, o que entrega e por que importa”"
    }
  },
  {
    id: "q2",
    pillar: "Essência",
    text: "Q2 (ESSÊNCIA): O que sustenta sua marca quando ninguém está olhando?",
    options: {
      A: "“Não sei dizer; cada pessoa fala uma coisa”",
      B: "“Temos valores, mas não viraram prática e linguagem”",
      C: "“Valores claros e isso aparece no atendimento e decisões”"
    }
  },
  {
    id: "q3",
    pillar: "Ressonância",
    text: "Q3 (RESSONÂNCIA): Quem é seu cliente ideal hoje?",
    options: {
      A: "“Qualquer um que pagar”",
      B: "“Tenho uma ideia, mas não está bem definido”",
      C: "“Está definido: perfil, dor, desejo, objeções e o que valoriza”"
    }
  },
  {
    id: "q4",
    pillar: "Ressonância",
    text: "Q4 (RESSONÂNCIA): O que prova que você é bom sem você precisar dizer?",
    options: {
      A: "“Poucos cases/depoimentos”",
      B: "“Tenho alguns, mas dispersos”",
      C: "“Provas organizadas: cases, depoimentos, números”"
    }
  },
  {
    id: "q5",
    pillar: "Sistema",
    text: "Q5 (SISTEMA): Sua marca é reconhecível em qualquer ponto de contato?",
    options: {
      A: "“Cada peça parece de uma marca diferente”",
      B: "“Tem base, mas falta padronização”",
      C: "“Existe um sistema visual e verbal consistente”"
    }
  },
  {
    id: "q6",
    pillar: "Sistema",
    text: "Q6 (SISTEMA): Sua oferta está vendável em 10 segundos?",
    options: {
      A: "“Difícil explicar; vira aula”",
      B: "“Explico, mas não é afiado”",
      C: "“Explico rápido: promessa, diferencial e próximo passo”"
    }
  },
  {
    id: "q7",
    pillar: "Organização",
    text: "Q7 (ORGANIZAÇÃO): Hoje, sua marca roda com consistência…",
    options: {
      A: "“No improviso”",
      B: "“Alguma rotina, sem processo”",
      C: "“Com processo e responsáveis”"
    }
  }
] as const;

export type LeadPayload = {
  name: string;
  email: string;
  company: string;
  segment?: string;
  size?: string;
  website?: string;
  instagram?: string;
  answers: Choice[];
};

export function computeScores(answers: Choice[]) {
  const [q1, q2, q3, q4, q5, q6, q7] = answers.map((a) => SCORE_BY_CHOICE[a]);

  const visao = q1;
  const essencia = q2;
  const ressonancia = Number(((q3 + q4) / 2).toFixed(2));
  const sistema = Number(((q5 + q6) / 2).toFixed(2));
  const organizacao = q7;
  const total = Number(((visao + essencia + ressonancia + sistema + organizacao) / 5).toFixed(2));

  return { visao, essencia, ressonancia, sistema, organizacao, total };
}

export function getClassification(total: number) {
  if (total <= 3.9) return "crítico";
  if (total <= 6.9) return "em construção";
  if (total <= 8.9) return "forte";
  return "referência";
}
