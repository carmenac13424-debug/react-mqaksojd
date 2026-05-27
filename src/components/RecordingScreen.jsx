import { useState } from "react";
import { C, fmt } from "../data/constants";

export default function RecordingScreen({
  secs, ant, setAnt, meds, setMeds,
  res, setRes, notas, setNotas,
  toast, offline, paused,
  onPause, onFinish
}) {
  return (
    <div style={{
      fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh",
      background: paused
        ? "linear-gradient(175deg,#0F1923,#1A2535)"
        : "linear-gradient(175deg,#0B2545,#0D3060)",
      display:"flex", flexDirection:"column",
      transition:"background 0.5s"
    }}>

      {/* ── Header paciente ── */}
      <div style={{ padding:"20px 22px 16px",
        display:"flex", alignItems:"flex-start",
        justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:18, color:C.white,
            marginBottom:3, letterSpacing:-0.2 }}>
            Carlos Méndez
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>
            12/03/1967 · 58 años · M
          </div>
        </div>

        {/* EN VIVO / PAUSADO — grande y visible */}
        <div style={{ display:"flex", flexDirection:"column",
          alignItems:"flex-end", gap:3 }}>
          {paused ? (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16, fontWeight:800,
                color:C.amber, letterSpacing:1 }}>⏸ PAUSADO</span>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:10, height:10, borderRadius:"50%",
                background:"#EF4444",
                boxShadow:"0 0 8px #EF4444",
                animation:"PL 1.2s ease-in-out infinite",
                flexShrink:0 }}/>
              <span style={{ fontSize:16, fontWeight:800,
                color:"#EF4444", letterSpacing:1.5 }}>EN VIVO</span>
            </div>
          )}
          <span style={{ fontFamily:"JetBrains Mono,monospace",
            fontSize:22, fontWeight:700,
            color: paused ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)",
            letterSpacing:1 }}>
            {fmt(secs)}
          </span>
          {offline && (
            <span style={{ fontSize:8, fontWeight:700, color:C.amber,
              background:"rgba(245,158,11,0.15)",
              border:"1px solid rgba(245,158,11,0.3)",
              padding:"1px 6px", borderRadius:6 }}>📵</span>
          )}
        </div>
      </div>

      {/* ── Centro — waveform + mensaje ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"0 32px", gap:28 }}>

        {/* Waveform */}
        <div style={{ display:"flex", alignItems:"center", gap:3,
          height:64, opacity: paused ? 0.1 : 1,
          transition:"opacity 0.5s" }}>
          {Array.from({ length:30 }).map((_,i) => (
            <div key={i} style={{
              width:3.5, borderRadius:4,
              background: i%3===0
                ? "rgba(11,140,128,0.9)"
                : i%3===1
                  ? "rgba(11,140,128,0.6)"
                  : "rgba(11,140,128,0.4)",
              animation: paused ? "none"
                : `W ${0.28+(i%9)*0.06}s ease-in-out infinite ${i*0.032}s`,
              height: paused ? 3 : undefined
            }}/>
          ))}
        </div>

        {/* Mensaje */}
        <div style={{ textAlign:"center" }}>
          {paused ? (
            <>
              <p style={{ fontWeight:700, fontSize:19,
                color:"rgba(255,255,255,0.45)", margin:"0 0 7px" }}>
                Consulta pausada
              </p>
              <p style={{ fontSize:12,
                color:"rgba(255,255,255,0.2)", margin:0 }}>
                Toque Reanudar para continuar
              </p>
            </>
          ) : (
            <>
              <p style={{ fontWeight:800, fontSize:19,
                color:C.white, margin:"0 0 8px", letterSpacing:-0.2 }}>
                IA activa
              </p>
              <p style={{ fontSize:12,
                color:"rgba(255,255,255,0.35)", margin:0,
                lineHeight:1.65 }}>
                Documentando consulta en segundo plano
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Botones ── */}
      <div style={{ padding:"0 22px 32px", flexShrink:0,
        display:"flex", gap:10 }}>
        <button onClick={onPause}
          style={{ flex:1.2, padding:"14px 8px", borderRadius:14,
            background: paused
              ? "rgba(217,119,6,0.18)"
              : "rgba(255,255,255,0.07)",
            border:"1.5px solid "+(paused
              ? "rgba(217,119,6,0.35)"
              : "rgba(255,255,255,0.1)"),
            color: paused ? C.amber : "rgba(255,255,255,0.6)",
            fontFamily:"Sora,sans-serif", fontWeight:700,
            fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center",
            justifyContent:"center", gap:6 }}>
          {paused ? "▶ Reanudar" : "⏸ Pausa"}
        </button>
        <button onClick={onFinish}
          style={{ flex:3, padding:"14px", borderRadius:14,
            border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:15, color:C.white,
            boxShadow:"0 5px 22px rgba(11,140,128,0.45)",
            display:"flex", alignItems:"center",
            justifyContent:"center", gap:7 }}>
          Revisar consulta →
        </button>
      </div>
    </div>
  );
}
