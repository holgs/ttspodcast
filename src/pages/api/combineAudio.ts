// src/pages/api/combineAudio.ts
import type { NextApiRequest, NextApiResponse } from "next";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import { join } from "path";
import os from "os";
// alza il limite del body JSON a 10 MB
export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

ffmpeg.setFfmpegPath(ffmpegPath!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { parts, name }: { parts: string[]; name?: string } = req.body; // array di base64

  // salva parti su /tmp
  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), "tts-"));
  const listFile = join(tmpDir, "files.txt");

  // crea i frammenti e popola l’elenco nell’ordine corretto
  for (let i = 0; i < parts.length; i++) {
    const path = join(tmpDir, `p${i}.mp3`);
    await fs.writeFile(path, Buffer.from(parts[i], "base64"));
    await fs.appendFile(listFile, `file '${path}'\n`);
  }

  const outPath = join(tmpDir, "out.mp3");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c", "copy"])
      .save(outPath)
      .on("end", resolve)
      .on("error", reject);
  });

  const final = await fs.readFile(outPath);
  res.setHeader("Content-Type", "audio/mpeg");
  const safeName = name && name.trim() ? name.trim() : "podcast";
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${safeName}.mp3`,
  );
  res.send(final);
}