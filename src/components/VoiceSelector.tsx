"use client";
// Drop‑down per la selezione della voce narrante

const voices = [
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
] as const;

export type VoiceName = (typeof voices)[number];

export default function VoiceSelector({
  value,
  onChange,
}: {
  value: VoiceName;
  onChange: (v: VoiceName) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VoiceName)}
      className="border rounded-md px-2 py-1"
    >
      {voices.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}
