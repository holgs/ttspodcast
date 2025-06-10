"use client";
import React from 'react';
// Drop‑down per la selezione della voce narrante
import { voices, type VoiceName } from "@/lib/voices";

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
