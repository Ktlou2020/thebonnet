import { NextRequest, NextResponse } from "next/server";
import { AiDiagnosisResult } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { trackServerEvent } from "@/lib/posthog";

export async function POST(req: NextRequest) {
  const ip = (await headers()).get("x-forwarded-for") ?? "anonymous";
  if (!rateLimit(`diagnose:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { make, model, year, description } = body as {
    make: string;
    model: string;
    year: string;
    description: string;
  };

  if (!make || !model || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  trackServerEvent(ip, "ai_diagnosis_requested", { make, model });

  const systemPrompt = `You are an expert automotive diagnostician helping South African drivers. You know SA pricing in ZAR (independent workshops R400-800/hr, dealerships R900-1400/hr), SA popular vehicles (Toyota, VW, Ford, Hyundai, Suzuki, Kia, Renault, BMW, Mercedes, Audi, Nissan, Isuzu, Haval), and common SA driving conditions (potholes, heat, dust). Always respond with ONLY valid JSON, no markdown.`;

  const userPrompt = `Vehicle: ${year} ${make} ${model}
Issue: ${description}

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "likelyCauses": [
    {"cause": "string", "likelihood": "high|medium|low", "explanation": "string"}
  ],
  "urgencyLevel": "routine|soon|urgent|emergency",
  "urgencyNote": "string",
  "estimatedCost": {"low": number, "high": number, "currency": "ZAR", "note": "string"},
  "partsInvolved": ["string"],
  "questionsToAsk": ["string"],
  "mechanicBrief": "string"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "AI service error", raw: err }, { status: 502 });
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 502 });
    }

    const result: AiDiagnosisResult = JSON.parse(match[0]);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
