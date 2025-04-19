// src/lib/parseTextWithTones.ts
import { toneMap, ToneKey } from "./toneTypes";

export interface Section {
  id: string;
  text: string;
  tone: ToneKey;
}

const TAG_REGEX = /^\s*\[([^\]]+)\]\s*/i;

export function parseTextWithTones(raw: string): Section[] {
  const lines = raw.trim().split(/\r?\n/);
  const sections: Section[] = [];

  let currentTone: ToneKey = "Allegro e positivo"; // default
  for (const line of lines) {
    if (!line.trim()) continue; // ignora righe bianche

    const tagMatch = line.match(TAG_REGEX);
    let text = line;

    if (tagMatch) {
      const candidate = tagMatch[1].trim() as ToneKey;
      if (toneMap[candidate]) currentTone = candidate;
      text = line.replace(TAG_REGEX, "");
    }

    if (!text.trim()) continue; // se non resta testo, salta

    sections.push({
      id: crypto.randomUUID(),
      text,
      tone: currentTone,
    });
  }
  return sections;
}