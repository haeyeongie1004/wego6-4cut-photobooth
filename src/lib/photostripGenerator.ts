
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
  }[] = [],
  previewWidth: number = 330
): Promise<string> {
  const W = 1920;
  const photoW = 1728;
  const photoH = 972;
  const gap = 50;
  const top = 86;
  const footer = 298;

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

  ctx.fillStyle = theme;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#fffaf8";
  ctx.fillRect(67, 67, W - 134, H - 134);

  for (let i = 0; i < cuts.length; i++) {
    const img = await loadImage(cuts[i]);
    const x = 96;
    const y = top + i * (photoH + gap);

    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 19, y - 19, photoW + 38, photoH + 38);

    ctx.drawImage(img, x, y, photoW, photoH);
  }

  // Decorations: match the editor's coordinate system
  const scaleX = W / 1000;
  const scaleY = H / 1300;
  const stickerScale = W / previewWidth;

  decorations.forEach((d) => {
    ctx.save();
    ctx.translate(d.x * scaleX, d.y * scaleY);
    ctx.rotate((d.rotation * Math.PI) / 180);
    ctx.font = `${d.size * stickerScale}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.emoji, 0, 0);
    ctx.restore();
  });

  ctx.fillStyle = "#392330";
  ctx.textAlign = "center";
  ctx.font = `bold ${68}px monospace`;
  ctx.fillText(name.toUpperCase(), W / 2, H - footer + 112);

  ctx.font = "40px monospace";
  ctx.fillStyle = "#956b7c";
  ctx.fillText(
    "WE GO-6 PHOTO STUDIO  ·  FOUR CUT MEMORY",
    W / 2,
    H - footer + 196
  );

  return c.toDataURL("image/png");
}
