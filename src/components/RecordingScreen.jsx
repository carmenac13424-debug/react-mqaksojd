import { useState, useEffect, useRef } from "react";
import { C, fmt } from "../data/constants";
import { iniciarScribe, CAT } from "../data/scribe";

// Tarjeta de captura — médico decide
function Captura({ item, onAceptar, onIgnorar }) {
  const meta = CAT[item.cat];
  return (
    <div style={{
      background: C.white, borderRadius: 10,
      border: "1px solid #E2E8F0",
      borderLeft: "3px solid " + meta.color,
      padding: "9px 11px", marginBottom: 7
    }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom: 5 }}>
        <span style={{ fontSize:9, fontWeight:700, color:meta.color,
          textTransform:"uppercase", letterSpacing:0.5 }}>
          {meta.icon} {meta.l}
        </span>
        <span style={{ fontSize:8, color:"#94A3B8" }}>
          {item.sp === "medico" ? "🩺" : "👤"}
        </span>
      </div>
      <p style={{ fontSize:12, color:"#1E293B", margin:"0 0 8px",
        lineHeight:1.55 }}>
        "{item.txt}"
      </p>
      <div style={{ display:"flex", gap:7 }}>
        <button onClick={() => onIgnorar(item.id)}
          style={{ flex:1, padding:"5px", borderRadius:7,
            border:"1px solid #E2E8F0", background:"transparent",
            cursor:"pointer", fontFamily:"Sora,sans-serif",
            fontSize:9, color:"#94A3B8" }}>
          Ignorar
        </button>
        <button onClick={() => onAceptar(item)}
          style={{ flex:2, padding:"5px", borderRadius:7,
            border:"none", background: meta.color,
            cursor:"pointer", fontFamily:"Sora,sans-serif",
            fontSize:9, fontWeight:700, color:"#fff" }}>
          ✓ Añadir a nota
        </button>
      </div>
    </div>
  );
}

export default function RecordingScreen({
  secs, paused, offline,
  onPause, onFinish,
  capturas, onCaptura, toast
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const cleanupRef  = useRef(null);

  useEffect(() => {
    if (!paused && !cleanupRef.current) {
      cleanupRef.current = iniciarScribe(
        (c) => onCaptura({ ...c, aceptada: false, rechazada: false }),
        ()  => {} // social — silencioso
      );
    }
    return () => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    };
  }, []);

  const pendientes = (capturas||[]).filter(c => !c.aceptada && !c.rechazada);
  const aceptadas  = (capturas||[]).filter(c => c.aceptada).length;

  return (
    <div style={{
      fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh",
      background: paused
        ? "linear-gradient(175deg,#0F1923,#1A2535)"
        : "linear-gradient(175deg,#0B2545,#0D3060)",
      display:"flex", flexDirection:"column"
    }}>

      {/* Paciente + estado */}
      <div style={{ padding:"18px 20px 10px",
        display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:17,
            color:"#fff", marginBottom:2 }}>Carlos Méndez</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>
            12/03/1967 · 58 años · M
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column",
          alignItems:"flex-end", gap:4 }}>
          {paused
            ? <span style={{ fontSize:14, fontWeight:800,
                color: C.amber, letterSpacing:1 }}>⏸ PAUSADO</span>
            : <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:9, height:9, borderRadius:"50%",
                  background:"#EF4444",
                  boxShadow:"0 0 8px rgba(239,68,68,0.8)",
                  animation:"PL 1.2s infinite" }}/>
                <span style={{ fontSize:14, fontWeight:800,
                  color:"#EF4444", letterSpacing:1.5 }}>EN VIVO</span>
              </div>
          }
          <span style={{ fontFamily:"JetBrains Mono,monospace",
            fontSize:22, fontWeight:700,
            color:"rgba(255,255,255,0.65)" }}>
            {fmt(secs)}
          </span>
        </div>
      </div>

      {/* Centro */}
      <div style={{ flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"0 28px", gap:22 }}>

        {/* Waveform */}
        <div style={{ display:"flex", alignItems:"center", gap:3,
          height:56, opacity: paused ? 0.1 : 1, transition:"opacity 0.4s" }}>
          {Array.from({length:28}).map((_,i) => (
            <div key={i} style={{
              width:3.5, borderRadius:4,
              background: i%2===0
                ? "rgba(11,140,128,0.85)"
                : "rgba(11,140,128,0.45)",
              animation: paused ? "none"
                : `W ${0.3+(i%8)*0.06}s ease-in-out infinite ${i*0.03}s`,
              height: paused ? 3 : undefined
            }}/>
          ))}
        </div>

        {/* IA status */}
        {paused ? (
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:700, fontSize:17,
              color:"rgba(255,255,255,0.4)", margin:"0 0 5px" }}>
              Consulta pausada
            </p>
            <p style={{ fontSize:11,
              color:"rgba(255,255,255,0.2)", margin:0 }}>
              Toque Reanudar para continuar
            </p>
          </div>
        ) : (
          <div style={{ textAlign:"center" }}>
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"center", gap:7, marginBottom:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background:"#22C55E",
                boxShadow:"0 0 10px rgba(34,197,94,0.6)",
                animation:"PL 2s infinite" }}/>
              <span style={{ fontSize:14, fontWeight:700,
                color:"rgba(255,255,255,0.85)" }}>
                IA escuchando
              </span>
            </div>
            <p style={{ fontSize:10,
              color:"rgba(255,255,255,0.3)", margin:0 }}>
              Captura clínica activa
            </p>
          </div>
        )}

        {/* Indicador capturas */}
        {pendientes.length > 0 && (
          <button onClick={() => setPanelOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:7,
              padding:"7px 16px", borderRadius:20,
              background:"rgba(11,140,128,0.15)",
              border:"1px solid rgba(11,140,128,0.3)",
              cursor:"pointer", fontFamily:"Sora,sans-serif",
              fontSize:10, fontWeight:600, color:C.teal }}>
            <div style={{ width:7, height:7, borderRadius:"50%",
              background:C.teal, animation:"PL 1s infinite" }}/>
            {pendientes.length} captura{pendientes.length>1?"s":""} pendiente{pendientes.length>1?"s":""}
          </button>
        )}

        {aceptadas > 0 && (
          <div style={{ fontSize:9, color:"rgba(11,140,128,0.6)" }}>
            ✓ {aceptadas} fragmento{aceptadas>1?"s":""} en nota
          </div>
        )}
      </div>

      {/* Botones */}
      <div style={{ padding:"0 20px 28px", flexShrink:0,
        display:"flex", gap:9 }}>
        <button onClick={onPause}
          style={{ flex:1.2, padding:"13px 8px", borderRadius:13,
            background: paused
              ? "rgba(217,119,6,0.18)"
              : "rgba(255,255,255,0.07)",
            border:"1px solid "+(paused
              ? "rgba(217,119,6,0.35)"
              : "rgba(255,255,255,0.1)"),
            color: paused ? C.amber : "rgba(255,255,255,0.6)",
            fontFamily:"Sora,sans-serif", fontWeight:700,
            fontSize:13, cursor:"pointer" }}>
          {paused ? "▶ Reanudar" : "⏸ Pausa"}
        </button>
        <button onClick={onFinish}
          style={{ flex:3, padding:"13px", borderRadius:13,
            border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:14, color:"#fff",
            boxShadow:"0 5px 20px rgba(11,140,128,0.4)" }}>
          Revisar consulta →
        </button>
      </div>

      {/* Panel capturas */}
      {panelOpen && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:140,
            background:"rgba(0,0,0,0.5)" }}
            onClick={() => setPanelOpen(false)}/>
          <div style={{ position:"fixed", bottom:0, left:0, right:0,
            zIndex:150, display:"flex", justifyContent:"center" }}>
            <div style={{ width:"100%", maxWidth:390,
              background:"#F8FAFC",
              borderRadius:"16px 16px 0 0",
              boxShadow:"0 -6px 30px rgba(0,0,0,0.2)",
              maxHeight:"60vh", display:"flex", flexDirection:"column" }}>

              <div style={{ padding:"12px 16px 10px",
                borderBottom:"1px solid #E2E8F0", flexShrink:0 }}>
                <div style={{ display:"flex",
                  justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1E293B" }}>
                      Capturas IA
                    </div>
                    <div style={{ fontSize:9, color:"#64748B", marginTop:1 }}>
                      La IA clasificó estos fragmentos — usted decide
                    </div>
                  </div>
                  <button onClick={() => setPanelOpen(false)}
                    style={{ background:"transparent", border:"none",
                      cursor:"pointer", fontSize:18, color:"#94A3B8",
                      lineHeight:1 }}>✕</button>
                </div>
              </div>

              <div style={{ flex:1, overflowY:"auto",
                padding:"10px 14px 24px" }}>
                {pendientes.length === 0 ? (
                  <p style={{ textAlign:"center", color:"#94A3B8",
                    fontSize:11, padding:"20px 0" }}>
                    Sin capturas pendientes
                  </p>
                ) : (
                  pendientes.map(item => (
                    <Captura key={item.id} item={item}
                      onAceptar={(it) => {
                        onCaptura({ ...it, aceptada:true });
                        if (pendientes.length <= 1) setPanelOpen(false);
                        toast && toast("✓ Añadido a "+CAT[it.cat].l);
                      }}
                      onIgnorar={(id) => {
                        onCaptura({ id, rechazada:true });
                        if (pendientes.length <= 1) setPanelOpen(false);
                      }}/>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
