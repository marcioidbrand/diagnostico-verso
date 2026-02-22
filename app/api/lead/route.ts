import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Choice, computeScores } from "@/lib/questions";

type LeadRequestBody = {
  name?: string;
  email?: string;
  company?: string;
  segment?: string;
  size?: string;
  website?: string;
  instagram?: string;
  answers?: Choice[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadRequestBody;

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "E-mail obrigatório e válido." }, { status: 400 });
    }

    if (!body.name || !body.company) {
      return NextResponse.json({ error: "Nome e empresa são obrigatórios." }, { status: 400 });
    }

    if (!body.answers || body.answers.length !== 7) {
      return NextResponse.json({ error: "Respostas incompletas." }, { status: 400 });
    }

    const scores = computeScores(body.answers);

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await supabase.from("leads").insert({
      name: body.name,
      email: body.email,
      company: body.company,
      segment: body.segment ?? null,
      size: body.size ?? null,
      website: body.website ?? null,
      instagram: body.instagram ?? null,
      answers: body.answers,
      scores,
      total_score: scores.total
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, scores });
  } catch {
    return NextResponse.json({ error: "Falha ao processar lead." }, { status: 500 });
  }
}
