"use client";
import React from 'react';
import clsx from "clsx";

type Item = { src: string; label: string };

type SingleProps = { src: string; label: string; items?: never };
type ListProps = { items: Item[]; src?: never; label?: never };
type Props = (SingleProps | ListProps) & { className?: string };

/**
 * AudioPlayer
 *
 * 🔹 Modalità singola: <AudioPlayer src="..." label="Intro" />
 * 🔹 Modalità lista :  <AudioPlayer items={[{src,label}, …]} />
 */
export default function AudioPlayer(props: Props) {
  if ("items" in props && props.items) {
    // lista di player
    return (
      <div className={clsx("space-y-4", props.className)}>
        {props.items.map((it, i) => (
          <Player key={i} src={it.src} label={it.label} />
        ))}
      </div>
    );
  }

  // player singolo
  return (
    <Player
      src={props.src as string}
      label={props.label as string}
      className={props.className}
    />
  );
}

// player elementare
function Player({
  src,
  label,
  className,
}: { src: string; label: string; className?: string }) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <audio controls src={src} className="w-full" />
      <a
        href={src}
        download={`${label}.mp3`}
        className="underline whitespace-nowrap"
      >
        Scarica
      </a>
    </div>
  );
}