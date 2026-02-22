import { NextResponse } from "next/server";
import { buildPremiumReportHtml, Choice, computePillars, LeadData } from "@/lib/diagnostic";
import { sendTransactionalEmail } from "@/lib/email";
import { htmlToPdfBuffer } from "@/lib/pdf";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lead: LeadData;
      answers: Choice[];
    };

    if (!body.lead?.consentimento) {
      return NextResponse.json({ error: "Consentimento LGPD é obrigatório." }, { status: 400 });
    }

    if (!body.answers || body.answers.length !== 7) {
      return NextResponse.json({ error: "É necessário responder as 7 perguntas." }, { status: 400 });
    }

    const pillars = computePillars(body.answers);
    const reportHtml = buildPremiumReportHtml({ lead: body.lead, answers: body.answers, pillars });
    const pdfBuffer = await htmlToPdfBuffer(reportHtml);

    const supabase = getSupabaseAdmin();

    const { data: created, error } = await supabase
      .from("diagnosticos_verso")
      .insert({
        nome: body.lead.nome,
        email: body.lead.email,
        empresa: body.lead.empresa,
        segmento: body.lead.segmento,
        porte: body.lead.porte,
        site_instagram: body.lead.siteInstagram,
        consentimento: body.lead.consentimento,
        respostas: body.answers,
        notas: pillars,
        nota_final: pillars.final,
        classificacao: pillars.classificacao,
        report_html: reportHtml,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    const fakePdfLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/diagnostico/${created.id}/pdf`;

    await sendTransactionalEmail({
      to: body.lead.email,
      subject: `Seu Diagnóstico VERSO — ${body.lead.empresa}`,
      html: `<p>Olá ${body.lead.nome},</p><p>Seu diagnóstico foi concluído com nota final <strong>${pillars.final}</strong> (${pillars.classificacao}).</p><p>Link do relatório: <a href="${fakePdfLink}">${fakePdfLink}</a></p>`,
      attachment: {
        filename: `diagnostico-verso-${body.lead.empresa}.pdf`,
        content: pdfBuffer
      }
    });

    const { error: updateError } = await supabase
      .from("diagnosticos_verso")
      .update({ pdf_link: fakePdfLink })
      .eq("id", created.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ ok: true, id: created.id, pdfLink: fakePdfLink, pillars });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao processar diagnóstico." }, { status: 500 });
  }
}
