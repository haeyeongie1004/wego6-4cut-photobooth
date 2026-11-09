import { loadImage } from "./photoCompositor";
export async function generateStrip(cuts:string[], name:string, theme:string, decorations:{emoji:string;x:number;y:number;size:number;rotation:number}[]=[]):Promise<string>{
  const W=1000, photoW=900, photoH=1200, gap=26, top=45, footer=155, H=top+cuts.length*photoH+(cuts.length-1)*gap+footer;
  const c=document.createElement("canvas");c.width=W;c.height=H;const ctx=c.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
  ctx.fillStyle=theme;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fffaf8";ctx.fillRect(35,35,W-70,H-70);
  for(let i=0;i<cuts.length;i++){const img=await loadImage(cuts[i]);const x=50,y=top+i*(photoH+gap);ctx.fillStyle="#fff";ctx.fillRect(x-10,y-10,photoW+20,photoH+20);ctx.drawImage(img,x,y,photoW,photoH);}
  decorations.forEach(d=>{ctx.save();ctx.translate(d.x/1000*W,d.y/H*H);ctx.rotate(d.rotation*Math.PI/180);ctx.font=`${d.size}px serif`;ctx.textAlign="center";ctx.fillText(d.emoji,0,0);ctx.restore();});
  ctx.fillStyle="#392330";ctx.textAlign="center";ctx.font="bold 34px monospace";ctx.fillText(name.toUpperCase(),W/2,H-footer+58);
  ctx.font="20px monospace";ctx.fillStyle="#956b7c";ctx.fillText("IDOL SNAP CLUB  ·  FOUR CUT MEMORY",W/2,H-footer+100);
  return c.toDataURL("image/png");
}
