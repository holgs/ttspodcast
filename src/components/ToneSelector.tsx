"use client";
import { toneMap, ToneKey } from "@/lib/toneTypes";

export default function ToneSelector({
  value,
  onChange,
}: {
  value: ToneKey;
  onChange: (t: ToneKey) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ToneKey)}
      className="border rounded-md px-2 py-1"
    >
      {Object.keys(toneMap).map((k) => (
        <option key={k}>{k}</option>
      ))}
    </select>
  );
}