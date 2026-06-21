import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Where applications are delivered. */
const TO = "contact@astradaclub.com";
/**
 * Sender. Uses the `send.astradaclub.com` subdomain, which must be verified in
 * Resend (DKIM/SPF), keeping sending reputation separate from the root domain's
 * receiving mailbox.
 */
const FROM = "Astrada Applications <applications@send.astradaclub.com>";

interface ApplicationPayload {
  name?: string;
  email?: string;
  company?: string;
  link?: string;
  building?: string;
  stage?: string;
  why?: string;
}

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPE[c]);

export async function POST(request: NextRequest): Promise<Response> {
  let body: ApplicationPayload;
  try {
    body = (await request.json()) as ApplicationPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const company = (body.company ?? "").trim();
  const link = (body.link ?? "").trim();
  const building = (body.building ?? "").trim();
  const stage = (body.stage ?? "").trim();
  const why = (body.why ?? "").trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !company || !building) {
    return NextResponse.json(
      {
        error:
          "Please add your name, a valid email, your company, and what you're building.",
      },
      { status: 422 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[apply] RESEND_API_KEY is not set");
    return NextResponse.json(
      {
        error:
          "Applications are temporarily unavailable. Please email contact@astradaclub.com directly.",
      },
      { status: 503 },
    );
  }

  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["Company", company],
    ["Website / LinkedIn", link || "—"],
    ["Building", building],
    ["Stage / traction", stage || "—"],
    ["Why Astrada", why || "—"],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0e1b30;line-height:1.5;">
  <h2 style="margin:0 0 16px;font-size:18px;">New membership application</h2>
  <table style="border-collapse:collapse;font-size:14px;">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 16px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap;">${escapeHtml(
            k,
          )}</td><td style="padding:6px 0;">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
      )
      .join("")}
  </table>
</div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New application — ${name}${company ? ` · ${company}` : ""}`,
      text,
      html,
    });
    if (error) {
      console.error("[apply] resend error", error);
      return NextResponse.json(
        { error: "Couldn't submit your application. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[apply] send failed", err);
    return NextResponse.json(
      { error: "Couldn't submit your application. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
