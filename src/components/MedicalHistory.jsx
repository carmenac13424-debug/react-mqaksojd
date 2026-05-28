import { useState, useEffect, useRef } from "react";
import { C, TIPOS_ANT, AC_MAP, FAV_RD, fmt } from "../data/constants";
import { Bb } from "./Atoms";

export default function MedicalHistory({ data, onChange, toast, onClose }) {
  const [tipo,  setTipo]  = useState("enf");
  const [txt,   setTxt]   = useState("");
  const [sugs,  setSugs]  = useState([]);
  const [added, setAdded] = useState([]);
  const [von,   setVon]   = useState(false);
  const [vs,    setVs]    = useState(0);
  const [pend,  setPend]  = useState(null);
  const tr = useRef(null);

  const LABELS = { enf:"Enfermedades", cir:"Cirugías", ale:"Alergias", soc:"Historia social", fam:"Familiar" };
  const PLACEHOLDERS = { enf:"HTA, DM2, ERC… (Enter para añadir)", cir:"Ej: Colecistectomía 2018", ale:"Ej: Penicilina — rash", soc:"Ej: Fumador activo, alcohol, drogas", fam:"Ej: Padre IAM a los 50" };

  const cf = data.soc.some(s=>s.t.toLowerCase().includes("fumador activo")&&s.ok)
          && data.soc.some(s=>s.t.toLowerCase().includes("exfumador"));

  useEffect(()=>{
    if(von){ setVs(0); tr.current=setInterval(()=>setVs(x=>x+1),1000); }
    else clearInterval(tr.current);
    return()=>clearInterval(tr.current);
  },[von]);

  function inp(v){
    setTxt(v);
    if(!v.trim()){setSugs([]);return;}
    const lo=v.toLowerCase();
    setSugs([...new Set([
      ...Object.entries(AC_MAP).filter(([k])=>k.startsWith(lo)||k.includes(lo)).map(([,val])=>val),
      ...FAV_RD.filter(f=>f.toLowerCase().includes(lo)).map(f=>AC_MAP[f.toLowerCase()]||f),
    ])].slice(0,5));
  }

  function add(t,f="manual"){
    onChange({...data,[tipo]:[...data[tipo],{id:"x"+Date.now(),t,f,ok:true}]});
    setAdded(p=>[...p,t]);
    setTxt(""); setSugs([]);
    toast("✅ "+t);
  }
  function rem(k,id){ onChange({...data,[k]:data[k].filter(i=>i.id!==id)}); }

  const totalItems = Object.values(data).flat().length;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(11,37,69,0.85)",display:"flex",alignItems:"flex-end",zIndex:300}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:390,margin:"0 auto",background:C.white,borderRadius:"20px 20px 0 0",maxHeight:"92vh",display:"flex",flexDirection:"column",animation:"SU 0.22s ease"}}>

        {/* Header */}
        <div style={{padding:"14px 18px 10px",borderBottom:"1px solid "+C.border,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <span style={{fontWeight:800,fontSize:16,color:C.navy}}>🩺 Antecedentes</span>
              <span style={{fontSize:10,color:C.dgray,marginLeft:8}}>{totalItems} registros</span>
            </div>
            <button onClick={onClose} style={{background:C.lgreen,border:"none",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:700,color:C.green,padding:"7px 16px",borderRadius:20}}>✅ Listo</button>
          </div>
          {/* Tabs */}
          <div style={{display:"flex",gap:4}}>
            {TIPOS_ANT.map(t=>(
              <button key={t.id} onClick={()=>{setTipo(t.id);setAdded([]);setTxt("");setSugs([]);}}
                style={{flex:1,padding:"8px 4px",borderRadius:10,border:"2px solid "+(tipo===t.id?C.teal:C.border),background:tipo===t.id?C.lteal:C.white,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.15s"}}>
                <span style={{fontSize:16}}>{t.icon}</span>
                <span style={{fontSize:8,fontWeight:700,color:tipo===t.id?C.teal:C.dgray,fontFamily:"Sora,sans-serif"}}>{t.l}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"12px 18px"}}>

          {/* Categoría activa */}
          <div style={{background:C.lteal,borderRadius:10,padding:"8px 12px",marginBottom:10,border:"1px solid "+C.teal+"33"}}>
            <span style={{fontSize:11,fontWeight:700,color:C.teal}}>{TIPOS_ANT.find(t=>t.id===tipo)?.icon} {LABELS[tipo]}</span>
            <span style={{fontSize:10,color:C.teal,marginLeft:6}}>{(data[tipo]||[]).length} registrado{(data[tipo]||[]).length!==1?"s":""}</span>
          </div>

          {/* Recién añadidos */}
          {added.length>0&&(
            <div style={{background:C.lgreen,borderRadius:9,padding:"7px 10px",marginBottom:10,border:"1px solid #BBF7D0"}}>
              {added.map((a,i)=><div key={i} style={{fontSize:11,color:C.green,display:"flex",gap:5,marginBottom:1}}><span>✓</span><span>{a}</span></div>)}
            </div>
          )}

          {/* Favoritos RD - solo enfermedades */}
          {tipo==="enf"&&!txt&&(
            <div style={{marginBottom:10}}>
              <p style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",letterSpacing:0.7,margin:"0 0 6px"}}>Comunes en RD — toque para añadir:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {FAV_RD.map(f=><button key={f} onClick={()=>add(AC_MAP[f.toLowerCase()]||f,"manual")} style={{padding:"5px 11px",borderRadius:20,border:"1px solid "+C.border,background:C.gray,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:600,color:C.text}}>{f}</button>)}
              </div>
            </div>
          )}

          {/* Input + autocompletar */}
          <div style={{position:"relative",marginBottom:10}}>
            <div style={{display:"flex",gap:7}}>
              <input value={txt} onChange={e=>inp(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&txt.trim())add(sugs[0]||txt.trim());}}
                placeholder={PLACEHOLDERS[tipo]}
                style={{flex:1,padding:"11px 13px",borderRadius:11,border:"2px solid "+C.teal,fontSize:13,fontFamily:"Sora,sans-serif",color:C.text,background:C.off,outline:"none"}}/>
              <button onClick={()=>{if(txt.trim())add(sugs[0]||txt.trim());}}
                style={{padding:"11px 16px",borderRadius:11,border:"none",background:C.teal,cursor:"pointer",color:C.white,fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:14}}>✓</button>
            </div>
            {sugs.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,border:"1px solid "+C.teal,borderRadius:11,overflow:"hidden",zIndex:10,marginTop:3,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                {sugs.map((s,i)=>(
                  <button key={i} onClick={()=>add(s,"manual")} style={{width:"100%",padding:"11px 14px",textAlign:"left",background:i===0?C.lteal:"transparent",border:"none",borderBottom:i<sugs.length-1?"1px solid "+C.border:"none",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,color:C.text}}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Botón grande + Añadir otro */}
          <button onClick={()=>{if(txt.trim())add(sugs[0]||txt.trim()); else setTxt("");document.querySelector('input')?.focus();}}
            style={{width:"100%",padding:"12px",borderRadius:12,border:"2px dashed "+C.teal,background:C.lteal,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:13,fontWeight:700,color:C.teal,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span style={{fontSize:18}}>＋</span> Añadir otro {LABELS[tipo].slice(0,-1).toLowerCase()}
          </button>

          {/* Voz */}
          <div style={{background:von?C.navy:C.gray,borderRadius:11,padding:"11px 14px",marginBottom:10,border:"1.5px solid "+(von?C.teal:C.border),transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                {von
                  ?<><div style={{width:9,height:9,borderRadius:"50%",background:"#EF4444",animation:"PL 1s infinite"}}/><span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.white,fontWeight:600}}>{fmt(vs)}</span><span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Dictando…</span></>
                  :<><span style={{fontSize:16}}>🎙</span><span style={{fontSize:12,fontWeight:600,color:C.text}}>Dictar antecedente por voz</span></>}
              </div>
              {von
                ?<button onClick={()=>{setVon(false);setPend({t:"Hipotiroidismo — hace 5 años",f:"audio"});}} style={{padding:"7px 13px",borderRadius:20,border:"none",background:C.teal,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>✓ Listo</button>
                :<button onClick={()=>setVon(true)} style={{padding:"7px 13px",borderRadius:20,border:"none",background:C.navy,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:700,color:C.white}}>🎙 Hablar</button>}
            </div>
          </div>

          {pend&&(
            <div style={{background:C.lteal,borderRadius:10,padding:"10px 12px",marginBottom:10,border:"1px solid "+C.teal+"44"}}>
              <p style={{fontSize:11,fontWeight:700,color:C.teal,margin:"0 0 6px"}}>🤖 IA captó: "{pend.t}"</p>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setPend(null)} style={{flex:1,padding:"8px",borderRadius:8,border:"1.5px solid "+C.border,background:C.white,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,color:C.dgray}}>✕ Descartar</button>
                <button onClick={()=>{add(pend.t,pend.f);setPend(null);}} style={{flex:2,padding:"8px",borderRadius:8,border:"none",background:C.teal,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:800,color:C.white}}>✅ Añadir</button>
              </div>
            </div>
          )}

          {/* Conflicto fumador */}
          {cf&&(
            <div style={{background:C.lamber,border:"1px solid #FDE68A",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:800,color:C.amber,marginBottom:4}}>⚠️ Conflicto detectado</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.5,marginBottom:8}}>Expediente: <strong>fumador activo</strong><br/>Paciente dijo: <strong>exfumador 3 meses</strong></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{onChange({...data,soc:data.soc.filter(s=>!s.t.toLowerCase().includes("exfumador"))});toast("✓ Fumador activo");}} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #FDE68A",background:C.lamber,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.amber}}>Fumador activo</button>
                <button onClick={()=>{onChange({...data,soc:data.soc.filter(s=>!s.t.toLowerCase().includes("fumador activo")).map(s=>({...s,ok:true}))});toast("✓ Exfumador");}} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #BBF7D0",background:C.lgreen,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.green}}>Exfumador 3m</button>
                <button onClick={()=>{onChange({...data,soc:data.soc.map(s=>({...s,ok:true}))});toast("✓ Ambos");}} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid "+C.border,background:C.white,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.dgray}}>Ambos</button>
              </div>
            </div>
          )}

          {/* Lista actual de esta categoría */}
          {(data[tipo]||[]).length>0&&(
            <div>
              <p style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",letterSpacing:0.7,margin:"0 0 6px"}}>{LABELS[tipo]} registradas:</p>
              {(data[tipo]||[]).map(i=>(
                <div key={i.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,background:tipo==="ale"?C.lred:C.off,border:"1px solid "+(tipo==="ale"?"#FECACA":C.border),marginBottom:4}}>
                  <span style={{fontSize:12,color:tipo==="ale"?C.red:C.dgray,flexShrink:0}}>{tipo==="ale"?"⚠️":"•"}</span>
                  <span style={{fontSize:12,flex:1,color:tipo==="ale"?C.red:C.text,fontWeight:tipo==="ale"?700:400}}>{i.t}</span>
                  <Bb f={i.f}/>
                  <button onClick={()=>rem(tipo,i.id)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:14,color:C.mgray,padding:"2px 4px"}}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Resumen de todas las categorías */}
          <div style={{borderTop:"1px solid "+C.border,paddingTop:12,marginTop:12}}>
            <p style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",letterSpacing:0.7,margin:"0 0 8px"}}>Resumen completo:</p>
            {TIPOS_ANT.map(t=>{
              const its=data[t.id]||[];
              if(!its.length)return null;
              return(
                <div key={t.id} style={{marginBottom:6}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.dgray}}>{t.icon} {LABELS[t.id]}: </span>
                  <span style={{fontSize:11,color:C.text}}>{its.map(i=>i.t).join(" · ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
