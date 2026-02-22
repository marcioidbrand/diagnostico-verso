export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  // Placeholder: in produção, usar Playwright, Puppeteer ou serviço dedicado.
  // Mantemos fallback em HTML para não interromper o fluxo.
  return Buffer.from(html, "utf-8");
}
