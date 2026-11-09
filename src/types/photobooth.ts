export type CameraFrame = { x:number; y:number; width:number; height:number; zoom:number; offsetX:number; offsetY:number; mirror:boolean };
export type CutConfig = { background:string; idol:string; camera:CameraFrame; caption:string };
export type Member = { id:string; name:string; color:string; background:string; profile:string; cuts:CutConfig[]; stickers:string[] };
export type CapturedCut = { dataUrl:string; memberId:string; cut:number };
export type Decoration = { id:number; emoji:string; x:number; y:number; size:number; rotation:number };
