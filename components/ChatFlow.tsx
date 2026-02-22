"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { Choice, computeScores, getClassification, LeadPayload, QUESTIONS } from "@/lib/questions";
import { Progress } from "@/components/Progress";

type LeadForm = Omit<LeadPayload, "answers">;

type ResultState = {
  total: number;
  classification: string;
  scores: ReturnType<typeof computeScores>;
};

const LEAD_FIELDS: Array<{ key: keyof LeadForm; label: string; required?: boolean; type?: string }> = [
  { key: "name", label: "Qual seu nome?", required: true },
  { key: "email", label: "Qual seu melhor e-mail?", required: true, type: "email" },
  { key: "company", label: "Empresa", required: true },
  { key: "segment", label: "Segmento (opcional)" },
  { key: "size", label: "Porte (opcional)" },
  { key: "website", label: "Site (opcional)", type: "url" },
  { key: "instagram", label: "Instagram (opcional)" }
];

export function ChatFlow() {
  const [step, setStep] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [lead, setLead] = useState<LeadForm>({
    name: "",
    email: "",
    company: "",
    segment: "",
    size: "",
    website: "",
    instagram: ""
  });
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string>("");

  const leadDone = step >= LEAD_FIELDS.length;
  const questionIndex = step - LEAD_FIELDS.length;
  const inQuestions = leadDone && questionIndex < QUESTIONS.length;
  const progressCurrent = Math.min(Math.max(questionIndex + 1, 1), 7);

  const activeField = LEAD_FIELDS[step];

  const transcript = useMemo(() => {
    const lines: Array<{ role: "bot" | "user"; text: string }> = [];

    LEAD_FIELDS.forEach((field, index) => {
      if (index <= step) {
        lines.push({ role: "bot", text: field.label });
      }
      const val = lead[field.key];
      if (val && index < step) {
        lines.push({ role: "user", text: String(val) });
      }
    });

    QUESTIONS.forEach((q, i) => {
      if (leadDone && i <= questionIndex) {
        lines.push({ role: "bot", text: q.text });
      }
      if (answers[i]) {
        lines.push({ role: "user", text: `${answers[i]}) ${q.options[answers[i]]}` });
      }
    });

    return lines;
  }, [answers, lead, leadDone, questionIndex, step]);

  function validateLeadField(key: keyof LeadForm, value: string) {
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Digite um e-mail válido.";
    }
    if ((key === "name" || key === "email" || key === "company") && !value.trim()) {
      return "Este campo é obrigatório.";
    }
    return "";
  }

  function submitLeadField() {
    if (!activeField) return;
    const value = currentInput.trim();
    const validationError = validateLeadField(activeField.key, value);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLead((prev) => ({ ...prev, [activeField.key]: value }));
    setCurrentInput("");
    setStep((prev) => prev + 1);
  }

  async function finishFlow(finalAnswers: Choice[]) {
    const scores = computeScores(finalAnswers);
    const classification = getClassification(scores.total);

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, answers: finalAnswers, scores })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Falha ao salvar lead.");
      }

      setResult({ total: scores.total, classification, scores });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha inesperada.");
    } finally {
      setLoading(false);
    }
  }

  function chooseOption(choice: Choice) {
    if (!inQuestions || loading) return;

    const nextAnswers = [...answers, choice];
    setAnswers(nextAnswers);
    setStep((prev) => prev + 1);

    if (nextAnswers.length === 7) {
      void finishFlow(nextAnswers);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitLeadField();
    }
  }

  if (result) {
    return (
      <section className="chat-card">
        <header className="chat-header">
          <h2>Diagnóstico VERSO</h2>
          <Progress current={7} total={7} />
        </header>
        <div className="chat-body">
          <div className="result-card">
            <h3>Resultado final</h3>
            <p className="score">{result.total.toFixed(2)}</p>
            <p className="classification">Classificação: <strong>{result.classification}</strong></p>
            <ul>
              <li>Visão: {result.scores.visao}</li>
              <li>Essência: {result.scores.essencia}</li>
              <li>Ressonância: {result.scores.ressonancia}</li>
              <li>Sistema: {result.scores.sistema}</li>
              <li>Organização: {result.scores.organizacao}</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-card">
      <header className="chat-header">
        <h2>Diagnóstico VERSO</h2>
        <Progress current={progressCurrent} total={7} />
      </header>

      <div className="chat-body">
        <div className="messages">
          {transcript.map((line, index) => (
            <div key={`${line.role}-${index}`} className={`bubble ${line.role}`}>
              {line.text}
            </div>
          ))}
        </div>

        {error ? <p className="error-msg">{error}</p> : null}

        {!leadDone && activeField ? (
          <div className="composer">
            <input
              className="input"
              placeholder={activeField.label}
              type={activeField.type ?? "text"}
              value={currentInput}
              onChange={(event) => setCurrentInput(event.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <button className="button" type="button" onClick={submitLeadField}>
              Avançar
            </button>
          </div>
        ) : null}

        {inQuestions ? (
          <div className="options-grid">
            {(["A", "B", "C"] as Choice[]).map((option) => {
              const question = QUESTIONS[questionIndex];
              return (
                <button key={option} className="option-btn" onClick={() => chooseOption(option)} disabled={loading}>
                  <strong>{option}</strong> {question.options[option]}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
