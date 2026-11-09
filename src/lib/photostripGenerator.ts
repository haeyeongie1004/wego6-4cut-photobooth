
import { loadImage } from "./photoCompositor";

export async function generateStrip(
  cuts: string[],
  name: string,
  theme: string,
  decorations: {
    emoji: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
  }[] = []
): Promise<string> {
  const W = 1920;
  const photoW = 1728;
  const photoH = 972; // 16:9 ratio, no stretching
  const gap = 50;
  const top = 86;
  const footer = 298;
  const scale = W / 1000;

  const H =
    top +
    cuts.length * photoH +
    (cuts.length - 1) * gap +
    footer;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;

  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Background
  ctx.fillStyle = theme;
  ctx.fillRect(0, 0, W, H);

  // Inner white border
  ctx.fillStyle = "#fffaf8";
  ctx.fillRect(67, 67, W - 134, H - 134);

  // Four landscape photos, kept at their original proportions
  for (let i = 0; i < cuts.length; i++) {
    const img = await loadImage(cuts[i]);
    const x = 96;
    const y = top + i * (photoH + gap);

    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 19, y - 19, photoW + 38, photoH + 38);

    ctx.drawImage(img, x, y, photoW, photoH);
  }

  // Decorations
  decorations.forEach((d) => {
    ctx.save();
    ctx.translate(d.x * scale, d.y * scale);
    ctx.rotate((d.rotation * Math.PI) / 180);
    ctx.font = `${d.size * scale}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(d.emoji, 0, 0);
    ctx.restore();
  });

  // Name
  ctx.fillStyle = "#392330";
  ctx.textAlign = "center";
  ctx.font = `bold ${68}px monospace`;
  ctx.fillText(name.toUpperCase(), W / 2, H - footer + 112);

  // Footer text
  ctx.font = "40px monospace";
  ctx.fillStyle = "#956b7c";
  ctx.fillText(
    "IDOL SNAP CLUB  ·  FOUR CUT MEMORY",
    W / 2,
    H - footer + 196
  );

  return c.toDataURL("image/png");
}
