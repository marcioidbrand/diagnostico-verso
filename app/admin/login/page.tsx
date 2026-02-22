"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError("Senha inválida");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="main-shell">
      <section className="chat-card" style={{ maxWidth: 420 }}>
        <div className="chat-body">
          <h2>Login Admin</h2>
          <form className="form-stack" onSubmit={onSubmit}>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <small>{error}</small> : null}
            <button className="button" type="submit">Entrar</button>
          </form>
        </div>
      </section>
    </main>
  );
}
