"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { parseTextWithTones } from "@/lib/parseTextWithTones";
import { toneMap } from "@/lib/toneTypes";
import type { VoiceName } from "@/components/VoiceSelector";
import ThemeToggle from "@/components/ThemeToggle";

const voices: VoiceName[] = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
];

const tones = Object.keys(toneMap) as (keyof typeof toneMap)[];

export default function PodcastGenerator() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [voice, setVoice] = useState<VoiceName | "">("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fragments, setFragments] = useState<{ url: string; label: string }[]>([]);
  const [apiKey, setApiKey] = useState<string>(
    typeof window !== "undefined" ? localStorage.getItem("OPENAI_KEY") ?? "" : "",
  );

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const txt = await f.text();
    setText(txt);
  };

  async function generatePodcast() {
    if (!text.trim()) return alert("Inserisci del testo o carica un file");
    if (!apiKey) return alert("Inserisci la tua OpenAI API key");
    if (!voice) return alert("Seleziona una voce");

    setIsGenerating(true);
    setDownloadUrl(null);
    setFragments([]);

    const sections = parseTextWithTones(text);
    const base64Parts: string[] = [];

    for (const s of sections) {
      const res = await fetch("/api/generateFragment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": apiKey,
        },
        body: JSON.stringify({
          text: s.text,
          tone: s.tone,
          voice,
        }),
      });
      if (!res.ok) {
        console.error(await res.text());
        setIsGenerating(false);
        return alert("Errore nella generazione di un frammento");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setFragments((arr) => [...arr, { url, label: s.text.slice(0, 30) }]);
      const buf = await blob.arrayBuffer();
      base64Parts.push(
        btoa(String.fromCharCode(...new Uint8Array(buf))),
      );
    }

    const joinRes = await fetch("/api/combineAudio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts: base64Parts }),
    });
    if (!joinRes.ok) {
      console.error(await joinRes.text());
      setIsGenerating(false);
      return alert("Errore durante la concatenazione");
    }
    const finalBlob = await joinRes.blob();
    const url = URL.createObjectURL(finalBlob);
    setDownloadUrl(url);
    setIsGenerating(false);
  }

  function applyToneTag(tone: keyof typeof toneMap) {
    const ta = textAreaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    // trova l'inizio della riga corrente
    const before = text.slice(0, start);
    const after = text.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const lineEnd = text.indexOf("\n", start) === -1 ? text.length : text.indexOf("\n", start);

    const line = text.slice(lineStart, lineEnd);

    // se esiste già un tag [xxx] all'inizio della riga, sostituiscilo
    const tagRegex = /^\s*\[[^\]]+\]\s*/;
    const newLine = line.replace(tagRegex, "").trimStart();
    const taggedLine = `[${tone}] ${newLine}`;

    const newText = text.slice(0, lineStart) + taggedLine + text.slice(lineEnd);
    setText(newText);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4
                 bg-gradient-to-br from-pink-200 via-rose-100 to-rose-100
                 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800"
    >
      <div className="w-full max-w-lg">
        <Card className="backdrop-blur-xl shadow-xl rounded-3xl p-6
                    bg-white/60 text-slate-900 border border-white/40
                    dark:bg-white/10 dark:text-white dark:border-white/20">
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">Genera Podcast</h1>
              <ThemeToggle />
            </div>

            {/* API key */}
            <div>
              <Label className="text-sm">API Key</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem("OPENAI_KEY", e.target.value);
                }}
                className="mt-1 bg-white/10 border border-white/20 backdrop-blur-md text-white"
              />
            </div>

            <Textarea
              ref={textAreaRef}
              placeholder="Inserisci il testo con i tag tono…"
              className="w-full bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-lg px-4 py-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <Button
              className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-lg py-3"
              asChild
            >
              <label>
                Carica un file
                <Input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select onValueChange={(v) => setVoice(v as VoiceName)}>
                <SelectTrigger className="bg-white/10 border border-white/20 backdrop-blur-md text-white">
                  <SelectValue placeholder="Voce" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white">
                  {voices.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(t) => applyToneTag(t as keyof typeof toneMap)}>
                <SelectTrigger className="bg-white/10 border border-white/20 backdrop-blur-md text-white">
                  <SelectValue placeholder="Tono (usa tag)" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white max-h-60 overflow-y-auto">
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generatePodcast}
              disabled={isGenerating}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg"
            >
              {isGenerating ? "Generazione..." : "Genera Podcast"}
            </Button>

            {(fragments.length > 0 || downloadUrl) && (
              <div className="space-y-2">
                {fragments.map((f, i) => (
                  <Button
                    key={i}
                    variant="secondary"
                    className="w-full"
                    asChild
                  >
                    <a href={f.url} download={`fragment-${i + 1}.mp3`}>
                      Download frammento {i + 1}
                    </a>
                  </Button>
                ))}

                {downloadUrl && (
                  <Button variant="default" className="w-full" asChild>
                    <a href={downloadUrl} download="podcast.mp3">
                      Download podcast completo
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
