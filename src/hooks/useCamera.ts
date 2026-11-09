"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const [error,setError] = useState("");
  const [ready,setReady] = useState(false);
  const start = useCallback(async()=>{
    setError("");
    if(!navigator.mediaDevices?.getUserMedia){setError("Camera access needs HTTPS or localhost and a supported browser.");return false;}
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:1706}}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream; await videoRef.current.play();}
      setReady(true); return true;
    }catch(e){
      const err=e as DOMException;
      setError(err.name==="NotAllowedError"?"Camera permission was denied. Allow camera access in your browser settings, then try again.":"Could not start the camera. Close other camera apps and try again.");
      return false;
    }
  },[]);
  const stop=useCallback(()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setReady(false);},[]);
  useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop());},[]);
  return {videoRef,ready,error,start,stop};
}
