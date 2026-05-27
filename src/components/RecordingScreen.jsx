import { useState } from "react";
import { C, fmt } from "../data/constants";

export default function RecordingScreen({
  secs, ant, setAnt, meds, setMeds,
  res, setRes, notas, setNotas,
  toast, offline, paused,
  onPause, onFinish, onOpenHistory
}) {
  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh",
      background: paused
        ? "linear-gradient(175deg,#141E2E,#1A2A3A)"
        : "linear-gradient(175deg,#0B2545,#0D3060)",
      display:"flex", flexDirection:"column",
      transition:"background 0.4s" }}>

      {/* Header — solo paciente + estado */}
      <div style={{ padding:"18px 22px 14px",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17, color:C.white,
            marginBottom:2 }}>Carlos Méndez</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
            Fecha de nacimiento: 12/03/1967 · 58 años · M
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {offline && (
            <span style={{ fontSize:9, fontWeight:700, color:C.amber,
              background:C.lamber, border:"1px solid #FDE68A",
              padding:"2px 6px", borderRadius:7 }}>📵</span>
          )}
          {paused ? (
            <span style={{ fontSize:11, fontWeight:700, color:C.amber }}>⏸ Pausado</span>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:"50%",
                background:"#EF4444", animation:"PL 1.4s infinite" }}/>
              <span style={{ fontSize:11, fontWeight:600,
                color:"rgba(255,255,255,0.7)" }}>EN VIVO</span>
            </div>
          )}
          <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13,
            fontWeight:600, color:"rgba(255,255,255,0.45)" }}>
            {fmt(secs)}
          </span>
        </div>
      </div>

      {/* Centro — ultra limpio */}
      <div style={{ flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"0 28px", gap:24 }}>

        {/* Waveform */}
        <div style={{ display:"flex", alignItems:"center", gap:3,
          height:52, opacity: paused ? 0.15 : 1, transition:"opacity 0.4s" }}>
          {Array.from({ length:26 }).map((_,i) => (
            <div key={i} style={{ width:3, borderRadius:3,
              background:"rgba(11,140,128,0.75)",
              animation: paused ? "none"
                : `W ${0.3+(i%8)*0.07}s ease-in-out infinite ${i*0.035}s`,
              height: paused ? 3 : undefined }}/>
          ))}
        </div>

        {/* Mensaje */}
        <div style={{ textAlign:"center" }}>
          {paused ? (
            <>
              <p style={{ fontWeight:700, fontSize:17,
                color:"rgba(255,255,255,0.5)", margin:"0 0 5px" }}>
                Consulta pausada
              </p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", margin:0 }}>
                Toque Reanudar para continuar
              </p>
            </>
          ) : (
            <>
              <p style={{ fontWeight:700, fontSize:17,
                color:C.white, margin:"0 0 5px" }}>
                IA activa
              </p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)",
                margin:0, lineHeight:1.6 }}>
                Documentando consulta en segundo plano
              </p>
            </>
          )}
        </div>

        {/* Botón discreto Historia */}
        <button onClick={onOpenHistory}
          style={{ display:"flex", alignItems:"center", gap:6,
            padding:"7px 16px", borderRadius:20,
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.12)",
            cursor:"pointer", fontFamily:"Sora,sans-serif",
            fontSize:11, color:"rgba(255,255,255,0.5)" }}>
          ☰ Datos del paciente
        </button>
      </div>

      {/* Botones inferiores */}
      <div style={{ padding:"0 22px 28px", flexShrink:0,
        display:"flex", gap:9 }}>
        <button onClick={onPause}
          style={{ flex:1, padding:"13px 8px", borderRadius:13,
            background: paused
              ? "rgba(217,119,6,0.15)"
              : "rgba(255,255,255,0.07)",
            border:"1px solid "+(paused
              ? "rgba(217,119,6,0.3)"
              : "rgba(255,255,255,0.1)"),
            color: paused ? C.amber : "rgba(255,255,255,0.65)",
            fontFamily:"Sora,sans-serif", fontWeight:700,
            fontSize:13, cursor:"pointer" }}>
          {paused ? "▶ Reanudar" : "⏸ Pausa"}
        </button>
        <button onClick={onFinish}
          style={{ flex:3, padding:"13px", borderRadius:13,
            border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:14, color:C.white,
            boxShadow:"0 4px 18px rgba(11,140,128,0.4)" }}>
          Terminar y revisar →
        </button>
      </div>
    </div>
  );
}
