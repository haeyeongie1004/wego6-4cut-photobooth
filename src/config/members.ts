import type { Member } from "@/types/photobooth";
const defaultCamera = { x:0, y:0, width:100, height:100, zoom:1, offsetX:0, offsetY:0, mirror:true };
const themes = [
  { color:"#f28ab0", bg:"#f7d5e1", stickers:["♡","✦","🎀","✿","★"] },
  { color:"#a9a0d8", bg:"#e6e0f3", stickers:["☾","✧","🫧","♡","✦"] },
  { color:"#e6ad73", bg:"#f5e1c8", stickers:["☀","✿","♡","🍒","✦"] },
  { color:"#83b7ae", bg:"#dcece6", stickers:["♧","✧","♡","🪽","★"] },
  { color:"#8da8d9", bg:"#dfe8f8", stickers:["☆","☁","♡","✦","🦋"] }
];
export const members: Member[] = themes.map((t,i)=>({
  id:`member-0${i+1}`, name:`Member 0${i+1}`, color:t.color, background:t.bg,
  profile:`/members/member-0${i+1}/profile.svg`, stickers:t.stickers,
  cuts:[1,2,3,4].map(n=>({
    background:t.bg,
    idol:`/members/member-0${i+1}/cut-0${n}.png`,
    camera:{...defaultCamera, x: n===2?2:0, y:0, width:100, height:100, zoom:1, offsetX:0, offsetY:0, mirror:true},
    caption:`CUT 0${n}`
  }))
}));
