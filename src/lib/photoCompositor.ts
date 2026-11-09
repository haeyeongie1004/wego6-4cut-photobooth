import type { CameraFrame } from "@/types/photobooth";
export function loadImage(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Could not load image: ${src}`));img.src=src;});
}
export function drawCover(ctx:CanvasRenderingContext2D, source:CanvasImageSource, sw:number, sh:number, dx:number, dy:number, dw:number, dh:number, frame:CameraFrame){
  const scale=Math.max(dw/sw,dh/sh)*frame.zoom;
  const rw=sw*scale,rh=sh*scale;
  const cx=dx+(dw-rw)/2+frame.offsetX*dw/100;
  const cy=dy+(dh-rh)/2+frame.offsetY*dh/100;
  ctx.save();
  if(frame.mirror){ctx.translate(2*dx+dw,0);ctx.scale(-1,1);ctx.drawImage(source,cx,cy,rw,rh);}
  else ctx.drawImage(source,cx,cy,rw,rh);
  ctx.restore();
}

export async function composeCut(
  video: HTMLVideoElement,
  idolSrc: string,
  background: string,
  frame: CameraFrame,
  mirror = true
): Promise<string> {
  const W = 3840;
  const H = 2160;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);

  const f = { ...frame, mirror };

  drawCover(
    ctx,
    video,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    W,
    H,
    f
  );

  try {
    const idol = await loadImage(idolSrc);
    ctx.drawImage(idol, 0, 0, W, H);
  } catch {
    // Placeholder cutout is optional until supplied.
  }

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, W - 18, H - 18);

  return canvas.toDataURL("image/png");
}

