import { useState, useRef } from "react";
import { C, fmt, TIPOS_ANT, AC_MAP, FAV_RD, NP_SUGS } from "../data/constants";
import PrivateNoteDrawer from "./PrivateNoteDrawer.jsx";

function HistoriaQuick({ ant, setAnt, toast }) {
  const [txt,  setTxt]  = useState("");
  const [tipo, setTipo] = useState("enf");
  const [sugs, setSugs] = useState([]);

  function onInput(v) {
    setTxt(v);
    if (!v.trim()) { setSugs([]); return; }
    const lo = v.toLowerCase();
    setSugs([...new Set([
      ...Object.entries(AC_MAP).filter(([k]) => k.startsWith(lo)||k.includes(lo)).map(([,val])=>val),
      ...FAV_RD.filter(f=>f.toLowerCase().includes(lo)).map(f=>AC_MAP[f.toLowerCase()]||f),
    ])].slice(0,4));
  }
  function add(t) {
    setAnt({...ant,[tipo]:[...ant[tipo],{id:"x"+Date.now(),t,f:"audio",ok:true}]});
    setTxt(""); setSugs([]); toast("✅ "+t);
  }
  const total = Object.values(ant).flat().length;
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:8}}>
        {TIPOS_ANT.map(t=>(
          <button key={t.id} onClick={()=>setTipo(t.id)}
            style={{flex:1,padding:"6px 3px",borderRadius:9,
              border:"1.5px solid "+(tipo===t.id?C.teal:C.border),
              background:tipo===t.id?C.lteal:C.white,cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:14}}>{t.icon}</span>
            <span style={{fontSize:8,fontWeight:700,color:tipo===t.id?C.teal:C.dgray,fontFamily:"Sora,sans-serif"}}>{t.l}</span>
          </button>
        ))}
      </div>
      {tipo==="enf"&&!txt&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
          {FAV_RD.map(f=>(
            <button key={f} onClick={()=>add(AC_MAP[f.toLowerCase()]||f)}
              style={{padding:"3px 9px",borderRadius:16,border:"1px solid "+C.border,
                background:C.gray,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:600,color:C.text}}>
              {f}
            </button>
          ))}
        </div>
      )}
      <div style={{position:"relative"}}>
        <div style={{display:"flex",gap:6}}>
          <input value={txt} onChange={e=>onInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&txt.trim())add(sugs[0]||txt.trim());}}
            placeholder={tipo==="enf"?"HTA, DM2…":tipo==="ale"?"Ej: Penicilina":tipo==="cir"?"Ej: Colecistectomía":"Ej: Fumador activo"}
            style={{flex:1,padding:"9px 11px",borderRadius:9,border:"1.5px solid "+C.teal,
              fontSize:12,fontFamily:"Sora,sans-serif",color:C.text,background:C.off,outline:"none"}}/>
          <button onClick={()=>{if(txt.trim())add(sugs[0]||txt.trim());}}
            style={{padding:"9px 13px",borderRadius:9,border:"none",background:C.teal,
              cursor:"pointer",color:C.white,fontFamily:"Sora,sans-serif",fontWeight:700}}>✓</button>
        </div>
        {sugs.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,
            border:"1px solid "+C.teal,borderRadius:9,overflow:"hidden",zIndex:10,marginTop:2,
            boxShadow:"0 4px 14px rgba(0,0,0,0.12)"}}>
            {sugs.map((s,i)=>(
              <button key={i} onClick={()=>add(s)}
                style={{width:"100%",padding:"8px 12px",textAlign:"left",
                  background:i===0?C.lteal:"transparent",border:"none",
                  borderBottom:i<sugs.length-1?"1px solid "+C.border:"none",
                  cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,color:C.text}}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {total>0&&<p style={{fontSize:10,color:C.teal,margin:"6px 0 0",fontWeight:600}}>{total} registrado{total!==1?"s":""}</p>}
    </div>
  );
}

function MedsQuick({ meds, setMeds, toast }) {
  const [txt,  setTxt]  = useState("");
  const [pend, setPend] = useState(null);
  return (
    <div>
      <p style={{fontSize:10,color:C.dgray,margin:"0 0 7px",lineHeight:1.5}}>
        Anote medicamentos mencionados. Los cambios van en el Plan.
      </p>
      {pend&&(
        <div style={{background:C.lteal,borderRadius:9,padding:"9px 11px",marginBottom:8,border:"1px solid "+C.teal+"44"}}>
          <p style={{fontSize:11,fontWeight:700,color:C.teal,margin:"0 0 6px"}}>🤖 IA captó: "{pend}"</p>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setPend(null)}
              style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid "+C.border,
                background:C.white,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,color:C.dgray}}>✕</button>
            <button onClick={()=>{setMeds([...meds,{id:"m"+Date.now(),n:pend,d:"",f:"audio",s:"dijo",al:[]}]);setPend(null);toast("✅ "+pend);}}
              style={{flex:2,padding:"7px",borderRadius:8,border:"none",background:C.teal,
                cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:800,color:C.white}}>✅ Confirmar</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:7}}>
        <input value={txt} onChange={e=>setTxt(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&txt.trim()){setPend(txt.trim());setTxt("");}}}
          placeholder="Ej: Losartán 50mg diario…"
          style={{flex:1,padding:"8px 10px",borderRadius:9,border:"1.5px solid "+C.border,
            fontSize:12,fontFamily:"Sora,sans-serif",color:C.text,background:C.off,outline:"none"}}/>
        <button onClick={()=>{if(txt.trim()){setPend(txt.trim());setTxt("");}}}
          style={{padding:"8px 12px",borderRadius:9,border:"none",background:C.teal,
            cursor:"pointer",color:C.white,fontFamily:"Sora,sans-serif",fontWeight:700}}>✓</button>
      </div>
      <p style={{fontSize:10,color:C.dgray,margin:"6px 0 0"}}>{meds.length} medicamento{meds.length!==1?"s":""} registrado{meds.length!==1?"s":""}</p>
    </div>
  );
}

export default function RecordingScreen({
  secs, ant, setAnt, meds, setMeds, res, setRes,
  notas, setNotas, toast, onFinish, offline,
  onPause, paused, onOpenHistory
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab,       setTab]       = useState("hist");
  const [npOpen,    setNpOpen]    = useState(false);

  const TABS = [
    {id:"hist",icon:"🩺",l:"Historia"},
    {id:"meds",icon:"💊",l:"Medicamentos"},
    {id:"nota",icon:"📝",l:"Nota privada"},
  ];

  return (
    <div style={{fontFamily:"Sora,sans-serif",maxWidth:390,margin:"0 auto",minHeight:"100vh",
      background:paused?"linear-gradient(175deg,#141E2E,#1A2A3A)":"linear-gradient(175deg,#0B2545,#0D3060)",
      display:"flex",flexDirection:"column",transition:"background 0.4s"}}>

      <PrivateNoteDrawer open={npOpen} onClose={()=>setNpOpen(false)}
        notas={notas} onChange={setNotas} toast={toast}/>

      {/* Header */}
      <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",
        justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontWeight:700,fontSize:16,color:C.white}}>Carlos Méndez</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:1}}>58a · HTA · DM2 · ERC 3</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {offline&&<span style={{fontSize:9,fontWeight:700,color:C.amber,background:C.lamber,border:"1px solid #FDE68A",padding:"2px 7px",borderRadius:8}}>📵</span>}
          {paused?(
            <span style={{fontSize:11,fontWeight:700,color:C.amber}}>⏸ Pausado</span>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#EF4444",animation:"PL 1.4s infinite"}}/>
              <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)"}}>EN VIVO</span>
            </div>
          )}
          <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.45)"}}>
            {fmt(secs)}
          </span>
        </div>
      </div>

      {/* Centro limpio */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",padding:"0 28px",gap:22}}>

        <div style={{display:"flex",alignItems:"center",gap:3,height:52,opacity:paused?0.15:1,transition:"opacity 0.4s"}}>
          {Array.from({length:26}).map((_,i)=>(
            <div key={i} style={{width:3,borderRadius:3,background:"rgba(11,140,128,0.7)",
              animation:paused?"none":`W ${0.3+(i%8)*0.07}s ease-in-out infinite ${i*0.035}s`,
              height:paused?3:undefined}}/>
          ))}
        </div>

        <div style={{textAlign:"center"}}>
          {paused?(
            <>
              <p style={{fontWeight:700,fontSize:17,color:"rgba(255,255,255,0.5)",margin:"0 0 5px"}}>Consulta pausada</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.25)",margin:0}}>Toque Reanudar para continuar</p>
            </>
          ):(
            <>
              <p style={{fontWeight:700,fontSize:17,color:C.white,margin:"0 0 5px"}}>IA activa</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",margin:0,lineHeight:1.6}}>
                Documentando la consulta en segundo plano
              </p>
            </>
          )}
        </div>
      </div>

      {/* Botones */}
      <div style={{padding:"0 20px 22px",flexShrink:0,display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={onPause}
          style={{flex:1.2,padding:"13px 8px",borderRadius:13,
            background:paused?"rgba(217,119,6,0.15)":"rgba(255,255,255,0.07)",
            border:"1px solid "+(paused?"rgba(217,119,6,0.3)":"rgba(255,255,255,0.1)"),
            color:paused?C.amber:"rgba(255,255,255,0.65)",
            fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {paused?"▶ Reanudar":"⏸ Pausa"}
        </button>
        <button onClick={onFinish}
          style={{flex:3,padding:"13px",borderRadius:13,border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:14,color:C.white,
            boxShadow:"0 4px 18px rgba(11,140,128,0.4)"}}>
          Terminar y revisar →
        </button>
        <button onClick={()=>setPanelOpen(!panelOpen)}
          style={{width:44,height:44,borderRadius:12,
            background:panelOpen?"rgba(11,140,128,0.2)":"rgba(255,255,255,0.06)",
            border:"1px solid "+(panelOpen?"rgba(11,140,128,0.35)":"rgba(255,255,255,0.1)"),
            cursor:"pointer",color:panelOpen?C.teal:"rgba(255,255,255,0.45)",
            fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
          ≡
        </button>
      </div>

      {/* Panel deslizable */}
      {panelOpen&&(
        <>
          <div style={{position:"fixed",inset:0,zIndex:130}} onClick={()=>setPanelOpen(false)}/>
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:140,display:"flex",justifyContent:"center"}}>
            <div style={{width:"100%",maxWidth:390,background:C.white,borderRadius:"16px 16px 0 0",
              boxShadow:"0 -4px 24px rgba(0,0,0,0.2)",animation:"SU 0.2s ease",
              maxHeight:"44vh",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"8px 14px 0",flexShrink:0}}>
                <div style={{width:32,height:3,borderRadius:2,background:C.mgray,margin:"0 auto 8px"}}/>
                <div style={{display:"flex",gap:4}}>
                  {TABS.map(t=>(
                    <button key={t.id} onClick={()=>setTab(t.id)}
                      style={{flex:1,padding:"7px 4px",borderRadius:8,
                        border:"1.5px solid "+(tab===t.id?C.teal:C.border),
                        background:tab===t.id?C.lteal:C.white,cursor:"pointer",
                        display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontSize:15}}>{t.icon}</span>
                      <span style={{fontSize:8,fontWeight:700,color:tab===t.id?C.teal:C.dgray,fontFamily:"Sora,sans-serif"}}>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"10px 14px 24px"}}>
                {tab==="hist"&&<HistoriaQuick ant={ant} setAnt={setAnt} toast={toast}/>}
                {tab==="meds"&&<MedsQuick meds={meds} setMeds={setMeds} toast={toast}/>}
                {tab==="nota"&&(
                  <div>
                    <p style={{fontSize:11,color:C.dgray,margin:"0 0 9px",lineHeight:1.5}}>
                      El paciente no escucha esto. <strong>Requieren aprobación.</strong>
                    </p>
                    {notas.length>0&&(
                      <div style={{marginBottom:8}}>
                        {notas.map(n=>(
                          <div key={n.id} style={{display:"flex",gap:7,padding:"5px 8px",
                            background:"rgba(124,58,237,0.07)",borderRadius:8,marginBottom:3}}>
                            <span>📝</span>
                            <span style={{fontSize:11,color:C.text}}>{n.t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
                      {NP_SUGS.map((s,i)=>(
                        <button key={i} onClick={()=>{setNotas([...notas,{id:"np"+Date.now(),t:s,f:"sugerencia",ok:false}]);toast("📝 Añadida");}}
                          style={{textAlign:"left",padding:"7px 10px",borderRadius:8,background:C.gray,
                            border:"1px solid "+C.border,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,color:C.text}}>
                          + {s}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setPanelOpen(false);setNpOpen(true);}}
                      style={{width:"100%",padding:"9px",borderRadius:9,border:"1px solid "+C.border,
                        background:C.off,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:11,fontWeight:600,color:C.navy}}>
                      🎤 Dictar nota privada →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
