import React, { useState, useEffect, useRef } from "react";
import { C, NP_SUGS, fmt } from "../data/constants";

export default function PrivateNoteDrawer({ open, onClose, notas, onChange, toast }) {
  const [von,  setVon]  = useState(false);
  const [vs,   setVs]   = useState(0);
  const [txt,  setTxt]  = useState("");
  const [pend, setPend] = useState(null);
  const tr = useRef(null);

  useEffect(() => {
    if (von) { setVs(0); tr.current = setInterval(() => setVs(x=>x+1), 1000); }
    else clearInterval(tr.current);
    return () => clearInterval(tr.current);
  }, [von]);

  function add(t, f) {
    onChange([...notas, {id:"np"+Date.now(), t, f, ok:false}]);
    toast("📝 Nota privada añadida");
    setTxt("");
  }

  if (!open) return null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(11,37,69,0.78)",
      display:"flex",alignItems:"flex-end",zIndex:200}} onClick={() => { if(!von) onClose(); }}>
      <div onClick={e => e.stopPropagation()} style={{width:"100%",maxWidth:390,
        margin:"0 auto",background:"#0D2A4A",borderRadius:"20px 20px 0 0",
        padding:"16px 20px 36px",animation:"SU 0.25s ease"}}>

        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)",margin:"0 auto 14px"}}/>

        <p style={{fontWeight:800,fontSize:16,color:C.white,margin:"0 0 3px"}}>
          🎤 Nota privada del médico
        </p>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.45)",margin:"0 0 14px",lineHeight:1.6}}>
          El paciente no escucha esto. Diferenciales, impresiones, recordatorios.<br/>
          <strong style={{color:C.teal}}>Requieren aprobación antes de entrar a la nota.</strong>
        </p>

        {/* Notas ya añadidas */}
        {notas.length > 0 && (
          <div style={{marginBottom:10}}>
            {notas.map(n => (
              <div key={n.id} style={{display:"flex",alignItems:"center",gap:7,
                padding:"5px 9px",background:"rgba(11,140,128,0.1)",
                borderRadius:8,marginBottom:4,border:"1px solid rgba(11,140,128,0.2)"}}>
                <span style={{fontSize:10}}>📝</span>
                <span style={{fontSize:11,color:C.lteal,flex:1,lineHeight:1.4}}>{n.t}</span>
              </div>
            ))}
          </div>
        )}

        {/* Confirmación dictado */}
        {pend ? (
          <div style={{background:"rgba(11,140,128,0.12)",borderRadius:12,
            padding:"12px 14px",marginBottom:10,
            border:"1px solid rgba(11,140,128,0.25)"}}>
            <p style={{fontSize:11,fontWeight:700,color:C.teal,margin:"0 0 4px"}}>🤖 IA transcribió:</p>
            <p style={{fontSize:13,fontWeight:600,color:C.white,margin:"0 0 10px",lineHeight:1.5}}>{pend}</p>
            <div style={{display:"flex",gap:7}}>
              <button onClick={() => setPend(null)}
                style={{flex:1,padding:"9px",borderRadius:9,border:"1px solid rgba(255,255,255,0.15)",
                  background:"transparent",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,color:"rgba(255,255,255,0.6)"}}>✕</button>
              <button onClick={() => { add(pend,"audio"); setPend(null); }}
                style={{flex:2,padding:"9px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",cursor:"pointer",
                  fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:800,color:C.white}}>✅ Añadir a borrador</button>
            </div>
          </div>
        ) : (
          <>
            {/* Sugerencias — 1 toque */}
            <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase",letterSpacing:0.7,margin:"0 0 6px"}}>
              Toque para añadir:
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
              {NP_SUGS.map((s,i) => (
                <button key={i} onClick={() => add(s,"sugerencia")}
                  style={{textAlign:"left",padding:"7px 11px",borderRadius:9,
                    background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",
                    fontFamily:"Sora,sans-serif",fontSize:11,color:"rgba(255,255,255,0.7)"}}>
                  + {s}
                </button>
              ))}
            </div>

            {/* Dictado ultrarrápido */}
            <div style={{background:von?"rgba(11,37,69,0.8)":"rgba(255,255,255,0.05)",
              borderRadius:12,padding:"11px 14px",marginBottom:8,
              border:"1px solid "+(von?"rgba(11,140,128,0.4)":"rgba(255,255,255,0.1)"),transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {von
                    ? <><div style={{width:9,height:9,borderRadius:"50%",background:"#EF4444",animation:"PL 1s infinite"}}/>
                        <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.white,fontWeight:600}}>{fmt(vs)}</span></>
                    : <><span style={{fontSize:18}}>🎤</span>
                        <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>Dictar ahora</span></>}
                </div>
                {von
                  ? <button onClick={() => { setVon(false); setPend("Descartar angina inestable — pedir troponina seriada"); }}
                      style={{padding:"7px 14px",borderRadius:20,border:"none",background:C.teal,
                        cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>✓ Listo</button>
                  : <button onClick={() => setVon(true)}
                      style={{padding:"7px 14px",borderRadius:20,border:"none",
                        background:"linear-gradient(135deg,"+C.teal+",#0A9E92)",cursor:"pointer",
                        fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>🎤 Hablar</button>}
              </div>
            </div>

            {/* Texto libre */}
            <div style={{display:"flex",gap:7}}>
              <input value={txt} onChange={e => setTxt(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter"&&txt.trim()){add(txt.trim(),"manual");} }}
                placeholder="Escribir nota clínica privada…"
                style={{flex:1,padding:"9px 11px",borderRadius:9,
                  border:"1px solid rgba(255,255,255,0.15)",fontSize:12,
                  fontFamily:"Sora,sans-serif",color:C.white,
                  background:"rgba(255,255,255,0.08)",outline:"none"}}/>
              <button onClick={() => { if(txt.trim()) add(txt.trim(),"manual"); }}
                style={{padding:"9px 13px",borderRadius:9,border:"none",background:C.teal,
                  cursor:"pointer",color:C.white,fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:13}}>✓</button>
            </div>
          </>
        )}

        <button onClick={() => { onClose(); setVon(false); }}
          style={{width:"100%",marginTop:12,padding:"11px",borderRadius:12,
            border:"1px solid rgba(255,255,255,0.12)",background:"transparent",
            color:"rgba(255,255,255,0.5)",fontFamily:"Sora,sans-serif",fontSize:12,cursor:"pointer"}}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
