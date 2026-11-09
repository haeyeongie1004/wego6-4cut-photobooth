import type { Member } from "@/types/photobooth";
const defaultCamera = { x:0, y:0, width:100, height:100, zoom:1, offsetX:0, offsetY:0, mirror:true };
const themes = [
  { color:"#F28AB0", bg:"#f7d5e1", stickers:["♡","✦","🍙","✿","★"] },
  { color:"#7058AA", bg:"#7058AA", stickers:["☾","✧","😈","♡","✦"] },
  { color:"#E6AD73", bg:"#f5e1c8", stickers:["☀","✿","♡","🍊","✦"] },
  { color:"#1B1E4F", bg:"#dcece6", stickers:["♧","✧","♡","🍍","★"] },
  { color:"#C5CFF1", bg:"#dfe8f8", stickers:["☆","☁","♡","✦","🪽"] }
];
const memberNames = [
  "WOOYEON",
  "XIU",
  "TAEGANG",
  "ZERO",
  "KUTA"
];

export const members: Member[] = themes.map((t,i)=>({
  id:`member-0${i+1}`, name:memberNames[i], color:t.color, background:t.bg,
  profile:`/members/member-0${i+1}/profile.svg`, stickers:t.stickers,
  cuts:[1,2,3,4].map(n=>({
    background:t.bg,
    idol:`/members/member-0${i+1}/cut-0${n}.png`,
    camera:{...defaultCamera, x: n===2?2:0, y:0, width:100, height:100, zoom:1, offsetX:0, offsetY:0, mirror:true},
    caption:`CUT 0${n}`
  }))
}));
