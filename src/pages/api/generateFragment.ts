import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { toneMap } from "@/lib/toneTypes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // ricava la chiave: header prioritario, fallback a env
  const apiKey =
    (req.headers["x-openai-key"] as string | undefined) ??
    process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "API key mancante" });
  }

  const openai = new OpenAI({ apiKey });

  const { text, tone, voice } = req.body as {
    text: string;
    tone: keyof typeof toneMap;
    voice: string;
  };

  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    input: text,
    voice,
    speed: 1,
    ...(toneMap[tone] ? { prompt: toneMap[tone] } : {}),
  }); //  [oai_citation_attribution:0‡OpenAI Platform](https://platform.openai.com/docs/guides/audio/quickstart?audio-generation-quickstart-example=audio-in&lang=python&utm_source=chatgpt.com)

  const buffer = Buffer.from(await response.arrayBuffer());

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Disposition", "attachment; filename=fragment.mp3");
  res.send(buffer);
}