import { useState, useEffect, useRef } from "react";
import { C, EMEDS, fmt, FAV_MEDS_RD } from "../data/constants";
import { Bb } from "./Atoms";

function MedRow({ m, onChange, toast }) {
  const [exp,  setExp]  = useState(false);
  const ec = EMEDS[m.s] || EMEDS.duda;

  return (
    <div style={{background:C.white,borderRadius:10,border:"1.5px solid "+ec.bc,marginBottom:6,overflow:"hidden"}}>
      <div onClick={() => setExp(!exp)}
        style={{padding:"8px 10px",display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:ec.dot,flexShrink:0,marginTop:3}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{m.n}</div>
          <div style={{fontSize:10,color:C.dgray,marginTop:1}}>{m.d}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
          <Bb f={m.f}/>
          <span style={{fontSize:8,fontWeight:700,color:ec.dot}}>{ec.label}</span>
        </div>
        <span style={{fontSize:10,color:C.mgray,transform:exp?"rotate(180deg)":"none",transition:"0.2s",flexShrink:0,marginTop:2}}>▼</span>
      </div>

      {/* Alertas clínicas */}
      {m.al.map((a,i) => (
        <div key={i} style={{padding:"5px 10px 6px 26px",
          background:a.t==="danger"?C.lred:C.lamber,
          borderTop:"1px solid "+(a.t==="danger"?"#FECACA":"#FDE68A")}}>
          <span style={{fontSize:10,fontWeight:600,color:a.t==="danger"?C.red:C.amber}}>
            {a.t==="danger"?"🚫":"⚠️"} {a.m}
          </span>
        </div>
      ))}

      {/* Acciones */}
      {exp && (
        <div style={{padding:"7px 10px",borderTop:"1px solid "+C.border,display:"flex",gap:5}}>
          {m.s !== "conf" && (
            <button onClick={() => { onChange(m.id,"conf"); toast("✓ Confirmado"); }}
              style={{flex:1,padding:"6px",borderRadius:7,border:"none",background:C.lgreen,
                cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.green}}>
              ✓ Confirmar
            </button>
          )}
          {m.s === "conf" && (
            <div style={{flex:1,padding:"6px",borderRadius:7,background:C.lgreen,
              textAlign:"center",fontSize:10,fontWeight:700,color:C.green}}>✓ Confirmado</div>
          )}
          <button onClick={() => { onChange(m.id,"dijo"); toast("👤 Paciente refiere"); }}
            style={{flex:1,padding:"6px",borderRadius:7,border:"1px solid #BFDBFE",background:C.lblue,
              cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.blue}}>
            👤 Refiere
          </button>
          <button onClick={() => { onChange(m.id,"susp"); toast("🚫 Suspendido"); }}
            style={{flex:1,padding:"6px",borderRadius:7,border:"1px solid #FECACA",background:C.lred,
              cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.red}}>
            Suspender
          </button>
        </div>
      )}
    </div>
  );
}

export default function Medications({ meds, onChange, toast }) {
  const [mTxt,  setMTxt]  = useState("");
  const [mPend, setMPend] = useState(null);
  const [mVon,  setMVon]  = useState(false);
  const [mVs,   setMVs]   = useState(0);
  const [scanF, setScanF] = useState(false);
  const tr = useRef(null);

  useEffect(() => {
    if (mVon) { setMVs(0); tr.current = setInterval(() => setMVs(x=>x+1), 1000); }
    else clearInterval(tr.current);
    return () => clearInterval(tr.current);
  }, [mVon]);

  function medChange(id, s) {
    if (s === "del") { onChange(meds.filter(m => m.id !== id)); return; }
    onChange(meds.map(m => m.id===id ? {...m,s} : m));
  }
  function approveMed() {
    if (!mPend) return;
    onChange([...meds, {id:"m"+Date.now(), n:mPend.n, d:mPend.d||"", f:mPend.f, s:"conf", al:[]}]);
    setMPend(null); toast("✅ "+mPend.n+" añadido");
  }

  return (
    <div>
      {mPend && (
        <div style={{background:C.white,borderRadius:11,border:"1.5px solid "+C.teal+"55",overflow:"hidden",marginBottom:8}}>
          <div style={{background:C.navy,padding:"7px 12px",display:"flex",alignItems:"center",gap:7}}>
            <span>🤖</span><span style={{fontSize:11,fontWeight:700,color:C.white}}>IA detectó</span>
            <Bb f={mPend.f}/>
          </div>
          <div style={{padding:"10px 12px"}}>
            <p style={{fontWeight:800,fontSize:14,color:C.navy,margin:"0 0 2px"}}>{mPend.n}</p>
            {mPend.d && <p style={{fontSize:11,color:C.dgray,margin:"0 0 8px"}}>{mPend.d}</p>}
            <div style={{display:"flex",gap:7}}>
              <button onClick={() => setMPend(null)}
                style={{flex:1,padding:"8px",borderRadius:9,border:"1.5px solid "+C.border,
                  background:C.white,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,color:C.dgray}}>✕</button>
              <button onClick={approveMed}
                style={{flex:2,padding:"8px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",cursor:"pointer",
                  fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:800,color:C.white}}>✅ Aprobar</button>
            </div>
          </div>
        </div>
      )}

      {meds.map(m => <MedRow key={m.id} m={m} onChange={medChange} toast={toast}/>)}

      {/* Favoritos RD */}
      <div style={{marginBottom:9}}>
        <p style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",letterSpacing:0.7,margin:"0 0 6px"}}>Frecuentes en RD — toque para añadir:</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {FAV_MEDS_RD.slice(0,8).map(m=>(
            <button key={m} onClick={()=>setMPend({n:m,d:"",f:"manual"})}
              style={{padding:"4px 10px",borderRadius:18,border:"1px solid "+C.border,background:C.gray,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:600,color:C.text}}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Escanear receta */}}
      <div style={{display:"flex",gap:6,marginTop:7,marginBottom:7}}>
        <button onClick={() => { setScanF(true); setTimeout(() => { setScanF(false); setMPend({n:"Atenolol 25 mg",d:"diario",f:"foto"}); }, 2000); }}
          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
            padding:"8px",borderRadius:9,border:"1.5px solid "+C.border,background:C.white,
            cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:600,color:C.dgray}}>
          {scanF
            ? <><div style={{width:11,height:11,borderRadius:"50%",border:"2px solid "+C.teal,borderTop:"2px solid transparent",animation:"SP 0.8s linear infinite"}}/>Esc...</>
            : <><span>📷</span>Foto receta</>}
        </button>
        <button onClick={() => toast("📷 Foto funda...")}
          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
            padding:"8px",borderRadius:9,border:"1.5px solid "+C.border,background:C.white,
            cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:600,color:C.dgray}}>
          <span>💊</span>Foto funda
        </button>
      </div>

      {/* Dictado */}
      <div style={{background:mVon?C.navy:C.gray,borderRadius:10,padding:"9px 13px",
        border:"1.5px solid "+(mVon?C.teal:C.border),transition:"all 0.2s",marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            {mVon
              ? <><div style={{width:8,height:8,borderRadius:"50%",background:"#EF4444",animation:"PL 1s infinite"}}/>
                  <span style={{fontFamily:"JetBrains Mono,monospace",color:C.white,fontSize:12,fontWeight:600}}>{fmt(mVs)}</span></>
              : <><span style={{fontSize:15}}>🎙</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>Dictar medicamento</span></>}
          </div>
          {mVon
            ? <button onClick={() => { setMVon(false); setMPend({n:"Jardiance 10 mg",d:"VO diario",f:"audio"}); }}
                style={{padding:"5px 11px",borderRadius:20,border:"none",background:C.teal,
                  cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>✓ Listo</button>
            : <button onClick={() => setMVon(true)}
                style={{padding:"5px 11px",borderRadius:20,border:"none",background:C.navy,
                  cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>Hablar →</button>}
        </div>
      </div>

      {/* Escribir */}
      <div style={{display:"flex",gap:7}}>
        <input value={mTxt} onChange={e => setMTxt(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"&&mTxt.trim()){setMPend({n:mTxt.trim(),d:"",f:"manual"});setMTxt("");} }}
          placeholder="Escribir medicamento…"
          style={{flex:1,padding:"8px 11px",borderRadius:9,border:"1.5px solid "+C.border,
            fontSize:12,fontFamily:"Sora,sans-serif",color:C.text,background:C.off,outline:"none"}}/>
        <button onClick={() => { if(mTxt.trim()){setMPend({n:mTxt.trim(),d:"",f:"manual"});setMTxt("");} }}
          style={{padding:"8px 13px",borderRadius:9,border:"none",background:C.teal,
            cursor:"pointer",color:C.white,fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:13}}>✓</button>
      </div>
    </div>
  );
}
