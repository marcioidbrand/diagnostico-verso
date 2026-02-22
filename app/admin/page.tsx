import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getDiagnostics() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("diagnosticos_verso")
    .select("id, created_at, nome, email, empresa, segmento, nota_final, classificacao, notas, pdf_link")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data;
}

export default async function AdminPage() {
  const token = cookies().get("admin_session")?.value;
  if (token !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login");
  }

  const diagnostics = await getDiagnostics();

  return (
    <main className="admin-shell">
      <h1>Painel — Diagnóstico VERSO</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Empresa</th>
            <th>Lead</th>
            <th>Segmento</th>
            <th>Nota</th>
            <th>Classificação</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.created_at).toLocaleString("pt-BR")}</td>
              <td>{item.empresa}</td>
              <td>{item.nome}<br />{item.email}</td>
              <td>{item.segmento}</td>
              <td>{item.nota_final}</td>
              <td>{item.classificacao}</td>
              <td>{item.pdf_link ? <a href={item.pdf_link}>Abrir</a> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
