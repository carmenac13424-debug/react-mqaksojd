import { useState, useEffect } from "react";
import { C, aho } from "../data/constants";

// ─── SOURCE BADGE ─────────────────────────────────────────────────────────────
export function Bb({ f }) {
  const M = {
    expediente:{e:"📁",l:"Expediente",c:C.blue,  b:C.lblue},
    audio:     {e:"🎙",l:"Audio",     c:C.teal,  b:C.lteal},
    paciente:  {e:"👤",l:"Paciente",  c:C.green, b:C.lgreen},
    foto:      {e:"📷",l:"Foto",      c:C.amber, b:C.lamber},
    pdf:       {e:"📄",l:"PDF",       c:C.red,   b:C.lred},
    whatsapp:  {e:"💬",l:"WhatsApp",  c:"#15803D",b:"#F0FAF4"},
    manual:    {e:"✍️",l:"Médico",   c:C.dgray, b:C.gray},
    sugerencia:{e:"💡",l:"Sugerencia",c:C.purple,b:C.lpurple},
  };
  const x = M[f] || M.manual;
  return (
    <span style={{fontSize:9,fontWeight:700,color:x.c,background:x.b,
      padding:"2px 6px",borderRadius:7,display:"inline-flex",
      alignItems:"center",gap:3,flexShrink:0}}>
      {x.e} {x.l}
    </span>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function Toast({ m }) {
  if (!m) return null;
  return (
    <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",
      background:C.navy,color:C.white,padding:"10px 22px",borderRadius:22,
      fontSize:13,fontWeight:600,zIndex:9999,
      boxShadow:"0 4px 24px rgba(0,0,0,0.4)",whiteSpace:"nowrap",
      animation:"FU 0.2s ease"}}>
      {m}
    </div>
  );
}

// ─── SOAP BLOCK ───────────────────────────────────────────────────────────────
export function SoapBlock({ title, icon, color, children }) {
  return (
    <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
      borderLeft:"4px solid "+color,padding:"11px 13px",marginBottom:7,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <p style={{fontWeight:800,fontSize:11,color,margin:"0 0 8px",
        textTransform:"uppercase",letterSpacing:0.7,
        display:"flex",alignItems:"center",gap:6}}>
        <span>{icon}</span>{title}
      </p>
      {children}
    </div>
  );
}

// ─── AUTOSAVE HOOK ────────────────────────────────────────────────────────────
export function useAutoSave(data, active) {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [saved,   setSaved]   = useState(null);

  useEffect(() => {
    const off = () => setOffline(true);
    const on  = () => setOffline(false);
    window.addEventListener("offline", off);
    window.addEventListener("online",  on);
    return () => { window.removeEventListener("offline",off); window.removeEventListener("online",on); };
  }, []);

  useEffect(() => {
    if (!active || !data) return;
    const iv = setInterval(() => {
      try {
        localStorage.setItem("mrd_v41", JSON.stringify({ data, ts: Date.now() }));
        setSaved(aho());
      } catch(e) {}
    }, 5000);
    return () => clearInterval(iv);
  }, [data, active]);

  function checkRecovery() {
    try {
      const raw = localStorage.getItem("mrd_v41");
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if ((Date.now() - obj.ts) / 60000 < 120) return obj.data;
    } catch(e) {}
    return null;
  }
  function clearSave() {
    try { localStorage.removeItem("mrd_v41"); } catch(e) {}
  }

  return { offline, saved, checkRecovery, clearSave };
}

// ─── AI SUMMARY CARD ──────────────────────────────────────────────────────────
export function AIResumen({ meds }) {
  const noConf  = meds.filter(m => m.s === "duda" || m.s === "revisar").length;
  const dangers = meds.flatMap(m => m.al).filter(a => a.t === "danger").length;
  return (
    <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",
      borderRadius:14,padding:"12px 14px",marginBottom:8,
      border:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
        <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.45)",
          textTransform:"uppercase",letterSpacing:0.9}}>🤖 Resumen rápido IA</span>
        <span style={{fontSize:9,fontWeight:700,
          background:"rgba(185,28,28,0.25)",color:"#FCA5A5",
          border:"1px solid rgba(185,28,28,0.3)",padding:"2px 8px",borderRadius:8}}>
          🚨 Riesgo alto
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        {[
          {l:"PA sistólica",v:"158/96",sub:"↑ HTA no controlada",hi:true},
          {l:"Diagnóstico",  v:"Dolor torácico",sub:"Descartar SCA hoy",warn:true},
          {l:"HbA1c",        v:"9.2%",sub:"↑ vs 8.8 previo",hi:true},
          {l:"Troponina",    v:"Pendiente",sub:"Ordenar ya",warn:true},
        ].map(c=>(
          <div key={c.l} style={{background:"rgba(255,255,255,0.05)",borderRadius:9,
            padding:"7px 9px",border:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",fontWeight:700,
              textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
            <div style={{fontSize:c.warn?11:13,fontWeight:800,
              fontFamily:c.hi?"JetBrains Mono,monospace":"Sora,sans-serif",
              color:c.hi?"#FCA5A5":c.warn?"#FCD34D":"#6EE7B7"}}>{c.v}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:1}}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {noConf > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",
            background:"rgba(217,119,6,0.15)",borderRadius:7,border:"1px solid rgba(217,119,6,0.25)"}}>
            <span style={{fontSize:11}}>⚠️</span>
            <span style={{fontSize:10,color:"#FCD34D",fontWeight:600}}>{noConf} medicamentos sin confirmar</span>
          </div>
        )}
        {dangers > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",
            background:"rgba(185,28,28,0.15)",borderRadius:7,border:"1px solid rgba(185,28,28,0.25)"}}>
            <span style={{fontSize:11}}>🚫</span>
            <span style={{fontSize:10,color:"#FCA5A5",fontWeight:600}}>Duplicidad IECA+ARA-II — revisión urgente</span>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",
          background:"rgba(217,119,6,0.12)",borderRadius:7,border:"1px solid rgba(217,119,6,0.2)"}}>
          <span style={{fontSize:11}}>⚠️</span>
          <span style={{fontSize:10,color:"#FCD34D",fontWeight:600}}>ERC estadio 3 + Metformina — monitorear función renal</span>
        </div>
      </div>
    </div>
  );
}
