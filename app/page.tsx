import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero-card">
        <h1>Diagnóstico VERSO</h1>
        <p>Uma conversa guiada para avaliar a maturidade da sua marca em 7 pilares práticos.</p>
        <div className="hero-actions">
          <Link className="button" href="/diagnostico">
            Iniciar diagnóstico
          </Link>
          <Link className="ghost-link" href="/privacy">
            Política de Privacidade
          </Link>
        </div>
      </section>
    </main>
  );
}
