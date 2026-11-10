"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Download, Heart, RefreshCw, Sparkles, Star, Trash2 } from "lucide-react";
import { members } from "@/config/members";
import { useCamera } from "@/hooks/useCamera";
import { composeCut } from "@/lib/photoCompositor";
import { generateStrip } from "@/lib/photostripGenerator";
import type { Decoration, Member } from "@/types/photobooth";

type Screen="home"|"members"|"camera"|"review"|"editor"|"final";
const marks=[
  "♡","♥","ღ","❥","✦","✧","★","☆",
  "🎀","🫧","🦋","🌷","🌸","🌼","🍒","🍓",
  "🍙","😈","🍊","🍍","🪽","☁️","🌙","✨",
  "💗","💖","💞","⭐","☀️","🐰","🐻","🐱"
];
export default function PhotoboothApp(){
  const [screen,setScreen]=useState<Screen>("home");
  const [member,setMember]=useState<Member|null>(null);
  const [cut,setCut]=useState(0);
  const [photos,setPhotos]=useState<(string|null)[]>([null,null,null,null]);
  const [zoom,setZoom]=useState(1);
  const [offsetX,setOffsetX]=useState(0);
  const [offsetY,setOffsetY]=useState(0);
  const [countdown,setCountdown]=useState<number|null>(null);
  const [busy,setBusy]=useState(false);
  const [decorations,setDecorations]=useState<Decoration[]>([]);
  const [selectedSticker,setSelectedSticker]=useState<number|null>(null);
  const [stripUrl,setStripUrl]=useState("");
  const [stripBg,setStripBg]=useState<string | null>(null);
  const {videoRef,ready,error,start,stop}=useCamera();
  const gestureRef = useRef<{
  id: number;
  mode: "move" | "resize" | "rotate";
  startX: number;
  startY: number;
  startSize: number;
  startRotation: number;
  startDistance: number;
  startAngle: number;
} | null>(null);
  const activeMember=member??members[0];
const current=activeMember.cuts[cut];
const completed=photos.filter(Boolean).length;
const activeStripBg=stripBg??activeMember.color;

  useEffect(()=>{
  setStripBg(null);
},[activeMember.id]);

  const beginMember=async(m:Member)=>{setMember(m);setCut(0);setPhotos([null,null,null,null]);setZoom(1);setOffsetX(0);setOffsetY(0);setScreen("camera");await start();};
  const goBack=()=>{if(screen==="camera"){stop();setScreen("members")}else if(screen==="members")setScreen("home");else if(screen==="review")setScreen("camera");else if(screen==="editor")setScreen("review");else setScreen("members");};
  const takePhoto=async()=>{
    if(!ready||!videoRef.current||busy)return;
    setBusy(true);
    for(let n=3;n>=1;n--){setCountdown(n);await new Promise(r=>setTimeout(r,850));}
    setCountdown(0);await new Promise(r=>setTimeout(r,250));
    try{
      const cfg={...current.camera,zoom,offsetX,offsetY};
      const result=await composeCut(videoRef.current,current.idol,current.background,cfg,true);
      setPhotos(prev=>prev.map((p,i)=>i===cut?result:p));
      setCountdown(null);
      if(cut<3){setCut(cut+1);setZoom(1);setOffsetX(0);setOffsetY(0);}
      else{stop();setScreen("review");}
    }catch(e){alert((e as Error).message);setCountdown(null);}
    setBusy(false);
  };
  const retake=(index:number)=>{setCut(index);setZoom(1);setOffsetX(0);setOffsetY(0);setScreen("camera");start();};
  const buildStrip = async () => {
  const valid = photos.filter((p): p is string => !!p);

  if (valid.length !== 4) return;

  const previewWidth = stripRef.current?.getBoundingClientRect().width ?? 330;

  const u = await generateStrip(
    valid,
    activeMember.name,
    activeStripBg,
    decorations,
    previewWidth
  );

  setStripUrl(u);
  setScreen("final");
};
  
const download = async () => {
  if (!stripUrl) return;

  const isIOS =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // iPhone and iPad: open the image for saving to Photos
    const imageTab = window.open("about:blank", "_blank");

    if (!imageTab) {
      alert("Please allow pop-ups in Safari and try again.");
      return;
    }

    try {
      const response = await fetch(stripUrl);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      imageTab.location.href = imageUrl;
    } catch {
      imageTab.close();
      alert("Could not open your photo. Please try again.");
    }

    return;
  }

  // Android and computers: download the PNG normally
  const a = document.createElement("a");
  a.href = stripUrl;
  a.download = `${activeMember.id}-four-cut.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

  const restart=()=>{stop();setScreen("home");setMember(null);setPhotos([null,null,null,null]);setDecorations([]);setStripUrl("");};
  const addSticker=(emoji:string)=>{const id=Date.now();setDecorations(p=>[...p,{id,emoji,x:80+Math.random()*820,y:80+Math.random()*180,size:42,rotation:(Math.random()-.5)*20}]);setSelectedSticker(id);};
  const updateSticker=(id:number,patch:Partial<Decoration>)=>setDecorations(p=>p.map(d=>d.id===id?{...d,...patch}:d));
  const stripRef=useRef<HTMLDivElement>(null);
  const startStickerGesture = (
  e: React.PointerEvent<HTMLElement>,
  d: Decoration,
  mode: "move" | "resize" | "rotate"
) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.setPointerCapture(e.pointerId);
  setSelectedSticker(d.id);

  const rect = stripRef.current?.getBoundingClientRect();
  if (!rect) return;

  const centerX = rect.left + (d.x / 1000) * rect.width;
  const centerY = rect.top + (d.y / 1300) * rect.height;

  gestureRef.current = {
    id: d.id,
    mode,
    startX: e.clientX,
    startY: e.clientY,
    startSize: d.size,
    startRotation: d.rotation,
    startDistance: Math.hypot(e.clientX - centerX, e.clientY - centerY),
    startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX)
  };
};

const onStickerPointerMove = (e: React.PointerEvent<HTMLElement>) => {
  const gesture = gestureRef.current;
  const rect = stripRef.current?.getBoundingClientRect();
  if (!gesture || !rect) return;

  const d = decorations.find(item => item.id === gesture.id);
  if (!d) return;

  if (gesture.mode === "move") {
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    gestureRef.current.startX = e.clientX;
    gestureRef.current.startY = e.clientY;

    updateSticker(d.id, {
      x: Math.max(0, Math.min(1000, d.x + dx / rect.width * 1000)),
      y: Math.max(0, Math.min(1300, d.y + dy / rect.height * 1300))
    });
  }

  if (gesture.mode === "resize") {
    const centerX = rect.left + (d.x / 1000) * rect.width;
    const centerY = rect.top + (d.y / 1300) * rect.height;
    const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    updateSticker(d.id, {
      size: Math.max(18, Math.min(90,
        gesture.startSize + distance - gesture.startDistance
      ))
    });
  }

  if (gesture.mode === "rotate") {
    const centerX = rect.left + (d.x / 1000) * rect.width;
    const centerY = rect.top + (d.y / 1300) * rect.height;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const difference = (angle - gesture.startAngle) * 180 / Math.PI;

    updateSticker(d.id, {
      rotation: gesture.startRotation + difference
    });
  }
};

const onStickerPointerUp = () => {
  gestureRef.current = null;
};
  const activeSticker=decorations.find(d=>d.id===selectedSticker);

  return <div className="shell"><main className="app">
    <header className="topbar"><button className="brand" onClick={()=>screen!=="home"?goBack():null}>WE GO-6 <span>PHOTO</span> STUDIO</button><span>♡ A FANMADE FOUR CUT PHOTOBOOTH ♡</span><span>EST. 2026</span></header>
    {screen==="home"&&<section className="content hero">
      <div><div className="eyebrow">WE GO-6 FOREST STUDIO ✦</div><h1>Four cuts.<br/><i>We Go</i> -6.</h1><p>Take pictures with the We Go-6 members. A tiny photo date, just for you and your multi-persona idols.</p><button className="primary" onClick={()=>setScreen("members")}>START PHOTOBOOTH <span>↗</span></button><div style={{marginTop:30,font:"10px DM Mono",color:"#b08c9b",letterSpacing:".12em"}}>✦ NO LOGIN · NO UPLOADS · JUST MEMORIES ✦</div></div>
      <div className="hero-art">
  <img
    src="/wego6-welcome.png"
    alt="Wego6 members"
    className="welcome-photo"
  />
</div>
    </section>}
    {screen==="members"&&<section className="content"><div className="toolbar"><div><div className="eyebrow">STEP 01 / PICK YOUR PERSON</div><h2 style={{font:"bold 38px Playfair Display",margin:"9px 0"}}>Choose member.</h2></div><button className="secondary" onClick={goBack}><ArrowLeft size={14} style={{verticalAlign:"middle"}}/> BACK</button></div><p style={{color:"#907b84",fontSize:13}}>Five angels, five little wolves. Who's joining your photo date?</p><div className="member-grid">{members.map((m,i)=><button key={m.id} className="member-card" style={{"--accent":m.color} as React.CSSProperties} onClick={()=>beginMember(m)}><div className="avatar" style={{background:m.color}}><span>{["🍙","😈","🍊","🍍","🪽"][i]}</span></div><div className="member-name">{m.name.toUpperCase()}</div><div className="member-sub">SELECT MEMBER ↗</div></button>)}</div></section>}
    {screen==="camera"&&member&&<section className="content"><div className="toolbar"><div><div className="eyebrow">STEP 02 / THE PHOTO DATE</div><h2 style={{font:"bold 32px Playfair Display",margin:"8px 0"}}>{member.name} <i>× you</i></h2></div><button className="secondary" onClick={()=>{stop();setScreen("members")}}><ArrowLeft size={14} style={{verticalAlign:"middle"}}/> EXIT</button></div><div className="progress">{[0,1,2,3].map(i=><span key={i} className={i<=cut?"done":""}/>)}</div><div style={{display:"flex",justifyContent:"space-between",font:"11px DM Mono",marginBottom:15,color:"#9a7888"}}><span>PHOTO 0{cut+1} / 04</span><span>{completed} SAVED</span></div>
      <div className="camera-layout"><div className="stage-wrap"><div className="stage" style={{"--stagebg":current.background} as React.CSSProperties}>
        <div className="stage-placeholder">YOUR LIVE CAMERA PREVIEW<br/>WILL APPEAR HERE</div>
        <video ref={videoRef} playsInline muted autoPlay style={{display:ready?"block":"none",left:"0%",top:"0%",width:"100%",height:"100%",transform:`scaleX(-1) scale(${zoom}) translate(${offsetX}%,${offsetY}%)`}}/>
        <img className="idol" src={current.idol} alt="Fixed idol pose overlay" onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
        <div className="stage-deco"><span style={{position:"absolute",top:12,left:14,color:"#fff",fontSize:22,textShadow:"0 1px 4px #555"}}>✦</span><span style={{position:"absolute",bottom:12,right:14,color:"#fff",fontSize:22,textShadow:"0 1px 4px #555"}}>♡</span></div>
        {countdown!==null&&<div className="countdown">{countdown===0?"♥":countdown}</div>}
      </div>{!ready&&<div className="notice" style={{marginTop:12}}>{error||"Camera permission is needed to take your photo. Use HTTPS or localhost."}<button className="secondary" style={{marginLeft:8}} onClick={start}>ENABLE CAMERA</button></div>}</div>
      <aside className="camera-panel"><div className="panel-title"><Camera size={14} style={{verticalAlign:"middle"}}/> LIVE COMPOSITION</div><div className="notice">Move into the open space beside your fixed member cutout. The idol layer stays locked in place.</div>
        <div className="control"><label><span>ZOOM</span><span>{zoom.toFixed(1)}×</span></label><input type="range" min="1" max="2.5" step=".05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></div>
        <div className="control"><label><span>HORIZONTAL CROP</span><span>{offsetX}</span></label><input type="range" min="-25" max="25" value={offsetX} onChange={e=>setOffsetX(Number(e.target.value))}/></div>
        <div className="control"><label><span>VERTICAL CROP</span><span>{offsetY}</span></label><input type="range" min="-25" max="25" value={offsetY} onChange={e=>setOffsetY(Number(e.target.value))}/></div>
        <button className="big-capture" disabled={!ready||busy} onClick={takePhoto}>{busy?"GET READY...":"3  ·  CAPTURE CUT"}</button>
        <p style={{fontSize:10,color:"#a28b94",lineHeight:1.5}}>Tip: Use your phone's front camera and keep your face inside the frame. Preview is mirrored like a selfie.</p>
      </aside></div></section>}
    {screen==="review"&&<section className="content"><div className="eyebrow">STEP 03 / YOUR FOUR-CUT MEMORY</div><h2 style={{font:"bold 42px Playfair Display",margin:"10px 0"}}>Look at you two. ♡</h2><p style={{color:"#907b84",fontSize:13}}>All four moments are saved in this browser tab. Retake only the cut you want to redo.</p><div className="preview-grid">{photos.map((p,i)=><button key={i} className="preview-cut" onClick={()=>retake(i)}>{p?<img src={p} alt={`Captured cut ${i+1}`}/>:<span>EMPTY</span>}<small>RETAKE 0{i+1}</small></button>)}</div><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}><button className="secondary" onClick={()=>retake(0)}><RefreshCw size={14} style={{verticalAlign:"middle"}}/> RETAKE PHOTO</button><button className="primary" onClick={()=>setScreen("editor")}>DECORATE YOUR STRIP →</button></div></section>}
    {screen==="editor"&&<section className="content"><div className="toolbar"><div><div className="eyebrow">STEP 04 / LITTLE EXTRAS</div><h2 style={{font:"bold 36px Playfair Display",margin:"8px 0"}}>Make it yours.</h2></div><button className="secondary" onClick={()=>setScreen("review")}><ArrowLeft size={14}/> BACK</button></div><div className="editor-layout"><div className="strip" ref={stripRef} style={{background:activeStripBg}}>{photos.map((p,i)=><div className="strip-cut" key={i}>{p&&<img src={p} alt={`Cut ${i+1}`}/>}</div>)}<div className="strip-footer">{member?.name.toUpperCase()} · WE GO-6 PHOTO STUDIO</div>{decorations.map(d => (
  <div
    key={d.id}
    className="sticker-wrap"
    style={{
      left: `${d.x / 10}%`,
      top: `${d.y / 13}%`
    }}
  >
    <span
      className={`sticker-visual ${selectedSticker === d.id ? "selected" : ""}`}
      style={{
        fontSize: d.size,
        transform: `rotate(${d.rotation}deg)`
      }}
      onPointerDown={e => startStickerGesture(e, d, "move")}
      onPointerMove={onStickerPointerMove}
      onPointerUp={onStickerPointerUp}
      onPointerCancel={onStickerPointerUp}
    >
      {d.emoji}
    </span>

    {selectedSticker === d.id && (
      <>
        <button
          type="button"
          className="sticker-handle sticker-rotate"
          aria-label="Rotate sticker"
          onPointerDown={e => startStickerGesture(e, d, "rotate")}
          onPointerMove={onStickerPointerMove}
          onPointerUp={onStickerPointerUp}
          onPointerCancel={onStickerPointerUp}
        />

        <button
          type="button"
          className="sticker-handle sticker-resize"
          aria-label="Resize sticker"
          onPointerDown={e => startStickerGesture(e, d, "resize")}
          onPointerMove={onStickerPointerMove}
          onPointerUp={onStickerPointerUp}
          onPointerCancel={onStickerPointerUp}
        />
      </>
    )}
  </div>
))}</div>
      <aside className="camera-panel"><div className="panel-title">PAPER & PRETTY THINGS</div><label className="eyebrow">STRIP BACKGROUND</label><div className="sticker-tools" style={{margin:"10px 0 20px"}}>{members.map(m=>m.color).map(c=><button key={c} aria-label={`Background ${c}`} onClick={()=>setStripBg(c)} style={{width:32,height:32,borderRadius:"50%",background:c,border:"1px solid #ddc5ce"}}/>)}</div><label className="eyebrow">ADD STICKERS</label><div className="sticker-tools" style={{margin:"10px 0 20px"}}>{[...new Set([...marks,...(member?.stickers??[])])].map(s=><button className="sticker-btn" key={s} onClick={()=>addSticker(s)}>{s}</button>)}</div>{activeSticker&&<>
  <button
    className="secondary"
    onClick={()=>{
      setDecorations(p=>p.filter(d=>d.id!==activeSticker.id));
      setSelectedSticker(null);
    }}
  >
    <Trash2 size={13}/> DELETE SELECTED
  </button>
</>}<button className="secondary" style={{width:"100%",marginTop:14}} onClick={()=>{setDecorations([]);setSelectedSticker(null)}}>RESET DECORATIONS</button><button className="big-capture" onClick={buildStrip}>PREVIEW FINAL STRIP →</button></aside></div></section>}
    {screen==="final"&&<section className="content"><div className="eyebrow">STEP 05 / KEEP THIS FOREVER</div><h2 style={{font:"bold 42px Playfair Display",margin:"10px 0"}}>Your photo is ready. ♡</h2><p style={{color:"#907b84",fontSize:13}}>A little proof that you virtually met your idols. Download the full-resolution PNG.</p><div style={{display:"flex",justifyContent:"center",margin:"28px 0"}}>{stripUrl&&<img src={stripUrl} alt="Final four cut photostrip" style={{width:"min(100%,360px)",boxShadow:"0 12px 35px #4a273522"}}/>}</div><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}><button className="primary" onClick={download}><Download size={15} style={{verticalAlign:"middle"}}/> DOWNLOAD PHOTO STRIP</button><button className="secondary" onClick={()=>{setScreen("camera");retake(0)}}><RefreshCw size={14} style={{verticalAlign:"middle"}}/> RETAKE PHOTO</button><button className="secondary" onClick={restart}>START AGAIN</button></div></section>}
    
<footer className="footer">
  <span>© 2026 WE GO-6 PHOTO STUDIO · FAN-MADE PHOTOBOOTH</span>
  <span>MADE WITH ♡, SAVED LOCALLY</span>
  <p style={{
    fontSize: "10px",
    lineHeight: 1.7,
    maxWidth: "650px",
    margin: "12px auto 0",
    textAlign: "center",
    opacity: 0.8
  }}>
    Unofficial fan-made photobooth for personal entertainment only.
    All images, names, logos and related materials belong to their
    respective owners. I do not claim ownership of any original
    materials featured here. No copyright infringement intended.
    Not affiliated with or endorsed by We Go-6 or its management.
  </p>
</footer>

  </main></div>;
}
