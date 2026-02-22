"use client";

import Link from "next/link";
import { useState } from "react";
import { ChatFlow } from "@/components/ChatFlow";

export default function DiagnosticoPage() {
  const [consent, setConsent] = useState(false);
  const [started, setStarted] = useState(false);

  return (
    <main className="diagnostico-shell">
      {!started ? (
        <section className="hero-card">
          <h1>Diagnóstico VERSO</h1>
          <p>Antes de começar, precisamos do seu consentimento LGPD.</p>
          <label className="consent-label">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            Autorizo o tratamento dos meus dados para execução do diagnóstico e contato posterior.
          </label>
          <div className="hero-actions">
            <button className="button" disabled={!consent} onClick={() => setStarted(true)}>
              Iniciar diagnóstico
            </button>
            <Link className="ghost-link" href="/privacy">
              Ler política de privacidade
            </Link>
          </div>
        </section>
      ) : (
        <ChatFlow />
      )}
    </main>
  );
}
