"use client";
import React from 'react';
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function TextDropZone({
  onParsed,
}: {
  onParsed: (text: string) => void;
}) {
  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file.text().then(onParsed);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed p-4 rounded-xl text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      {isDragActive ? "Rilascia il file qui…" : "Trascina o incolla un file .txt"}
    </div>
  );
}