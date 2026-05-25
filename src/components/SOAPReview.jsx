import React, { useState } from "react";
import { C, ICD_CODES, ORDENES_LIST, VITALES, MEDICO, hoy, aho, genId } from "../data/constants";
import { Bb, AIResumen, SoapBlock } from "./Atoms";
import { EMEDS } from "../data/constants";

// ── Editable section ───────────────────────────────────────────────────────────
function Sec({ id, title, icon, color, preview, openId, setOpenId, children }) {
  const isOpen = openId === id;
  return (
    <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
      borderLeft:"4px solid "+color,marginBottom:7,overflow:"hidden",cursor:"pointer",
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}
      onClick={() => setOpenId(isOpen?null:id)}>
      <div style={{padding:"11px 13px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,fontWeight:800,color,textTransform:"uppercase",
            letterSpacing:0.7,marginBottom:isOpen?0:2}}>{title}</div>
          {!isOpen && <div style={{fontSize:11,color:C.dgray,lineHeight:1.4,
            overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>
            {preview}</div>}
        </div>
        <span style={{fontSize:10,color:C.mgray,flexShrink:0,
          transform:isOpen?"rotate(180deg)":"none",transition:"0.2s"}}>▼</span>
      </div>
      {isOpen && (
        <div style={{padding:"0 13px 13px",borderTop:"1px solid "+C.border,
          paddingTop:11,animation:"FU 0.15s ease"}}>
          {children}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <button onClick={e => { e.stopPropagation(); setOpenId(null); }}
              style={{padding:"5px 14px",borderRadius:18,border:"none",background:C.lgreen,
                cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.green}}>
              ✓ Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quick orders ──────────────────────────────────────────────────────────────
function OrdenesSection() {
  const [sent, setSent] = useState({});
  const count = Object.keys(sent).length;
  return (
    <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
      borderLeft:"4px solid "+C.blue,marginBottom:7,padding:"11px 13px",
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
        <div style={{fontSize:10,fontWeight:800,color:C.blue,textTransform:"uppercase",letterSpacing:0.7}}>⚡ Órdenes rápidas</div>
        {count > 0 && <span style={{fontSize:9,fontWeight:700,color:C.green,background:C.lgreen,border:"1px solid #BBF7D0",padding:"2px 7px",borderRadius:8}}>{count} enviada{count>1?"s":""}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
        {ORDENES_LIST.map(o => {
          const done = sent[o.id];
          return (
            <button key={o.id} onClick={() => setSent(p => ({...p,[o.id]:true}))}
              style={{padding:"9px 5px",borderRadius:9,
                border:"1.5px solid "+(done?"#BBF7D0":o.urgent?"#FECACA":C.border),
                background:done?C.lgreen:o.urgent?C.lred:C.off,
                cursor:done?"default":"pointer",
                fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,
                color:done?C.green:o.urgent?C.red:C.navy,
                textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:16}}>{done?"✓":o.icon}</span>{o.l}
            </button>
          );
        })}
      </div>
      {count > 0 && <p style={{fontSize:9,color:C.dgray,margin:"7px 0 0",textAlign:"center"}}>La IA propone. El médico confirma antes de enviar a enfermería.</p>}
    </div>
  );
}

// ── Post-firma screen ─────────────────────────────────────────────────────────
function PantallaFirmado({ firmaData, onReset }) {
  return (
    <div style={{fontFamily:"Sora,sans-serif",minHeight:"100vh",
      background:"linear-gradient(160deg,#E8F8F4,#EEF4FF)",
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:24,animation:"POP 0.4s ease"}}>
      <div style={{width:76,height:76,borderRadius:"50%",
        background:"linear-gradient(135deg,#0B8C80,#0A9E92)",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:32,marginBottom:16,boxShadow:"0 8px 32px rgba(11,140,128,0.35)"}}>✅</div>
      <div style={{fontSize:20,fontWeight:800,color:C.navy,marginBottom:4,textAlign:"center"}}>Nota clínica firmada</div>
      <div style={{fontSize:12,color:C.dgray,marginBottom:20,textAlign:"center"}}>Responsabilidad médica completa</div>

      <div style={{background:C.white,borderRadius:14,border:"1px solid "+C.border,
        padding:"14px 16px",width:"100%",maxWidth:390,marginBottom:14}}>
        {[["Médico",MEDICO.n],["Exequatur",MEDICO.eq],["Fecha/Hora",firmaData.hora],["ID único",firmaData.id]].map(([k,v]) => (
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid "+C.border}}>
            <span style={{fontSize:10,color:C.dgray,fontWeight:600}}>{k}</span>
            <span style={{fontSize:10,color:C.green,fontWeight:700,
              fontFamily:k==="ID único"?"JetBrains Mono,monospace":"Sora,sans-serif"}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,width:"100%",maxWidth:390,marginBottom:10}}>
        {[{icon:"📄",l:"PDF"},{icon:"💊",l:"Receta"},{icon:"🏥",l:"Admitir"},{icon:"📋",l:"Referir"},{icon:"📅",l:"Seguimiento"},{icon:"💬",l:"WhatsApp"}].map(b => (
          <button key={b.l} style={{padding:"10px 6px",borderRadius:10,
            border:"1.5px solid "+(b.l==="WhatsApp"?"#BBF7D0":b.l==="Admitir"?"#BFDBFE":C.border),
            background:b.l==="WhatsApp"?C.lgreen:b.l==="Admitir"?C.lblue:C.white,
            cursor:"pointer",fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:10,
            color:b.l==="WhatsApp"?C.green:b.l==="Admitir"?C.blue:C.navy,
            display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontSize:18}}>{b.icon}</span>{b.l}
          </button>
        ))}
      </div>

      <p style={{fontSize:10,color:C.dgray,textAlign:"center",lineHeight:1.5,maxWidth:320,marginBottom:10}}>
        La IA propone. El médico decide. Nada entró automático a esta nota.
      </p>
      <button onClick={onReset} style={{background:"transparent",border:"none",cursor:"pointer",
        fontSize:11,color:C.dgray,fontFamily:"Sora,sans-serif"}}>← Nueva consulta</button>
    </div>
  );
}

// ── Main SOAPReview ────────────────────────────────────────────────────────────
export default function SOAPReview({ ant, meds, setMeds, res, setRes, notas, setNotas, extraDx, secs, onFirmar, onClose, toast }) {
  const [openId,   setOpenId]   = useState(null);
  const [compact,  setCompact]  = useState(false);
  const [firmExp,  setFirmExp]  = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [firmado,  setFirmado]  = useState(false);
  const [firmaData,setFirmaData]= useState(null);

  function handleFirmar() {
    setFirmando(true);
    setTimeout(() => {
      const fd = { hora: hoy()+" · "+aho(), id: genId() };
      setFirmaData(fd);
      setFirmando(false);
      setFirmado(true);
      onFirmar(fd);
    }, 1400);
  }

  if (firmado && firmaData) return <PantallaFirmado firmaData={firmaData} onReset={onClose}/>;

  const noConf = meds.filter(m => m.s === "duda" || m.s === "revisar").length;
  const npPend = notas.filter(n => !n.ok);

  return (
    <div style={{fontFamily:"Sora,sans-serif",maxWidth:390,margin:"0 auto",
      minHeight:"100vh",background:"#F1F5F9",display:"flex",flexDirection:"column"}}>

      {/* Header */}
      <div style={{background:C.navy,padding:"11px 16px",position:"sticky",top:0,zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.white}}>Revisión SOAP</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>MedScribe RD · Toque sección para editar</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <button onClick={() => setCompact(!compact)}
              style={{padding:"4px 10px",borderRadius:18,border:"1px solid rgba(255,255,255,0.2)",
                background:compact?"rgba(11,140,128,0.3)":"transparent",cursor:"pointer",
                fontFamily:"Sora,sans-serif",fontSize:9,fontWeight:700,
                color:compact?C.teal:"rgba(255,255,255,0.6)"}}>
              {compact?"📄 Completo":"⚡ Compacto"}
            </button>
            <button onClick={onClose}
              style={{padding:"4px 10px",borderRadius:18,border:"1px solid rgba(255,255,255,0.15)",
                background:"transparent",cursor:"pointer",fontFamily:"Sora,sans-serif",
                fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.5)"}}>← Volver</button>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"10px 14px",paddingBottom:firmExp?130:80}}>

        {/* Paciente */}
        <div style={{background:C.navy,borderRadius:13,padding:"11px 13px",
          marginBottom:8,boxShadow:"0 4px 14px rgba(11,37,69,0.18)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:800,color:C.white}}>Carlos Méndez</div>
            <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:700,color:C.teal}}>{String(Math.floor(secs/60)).padStart(2,"0")}:{String(secs%60).padStart(2,"0")}</div>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:6}}>58 años · Masculino · {hoy()}</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["HTA","DM2","ERC 3"].map(d=><span key={d} style={{fontSize:9,padding:"2px 7px",borderRadius:7,fontWeight:700,color:C.lteal,background:"rgba(11,140,128,0.25)"}}>{d}</span>)}
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:7,fontWeight:700,color:"#FEF2F2",background:"rgba(185,28,28,0.3)"}}>Penicilina ⚠️</span>
          </div>
        </div>

        {/* Vitales */}
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {VITALES.map(v => (
            <div key={v.l} style={{flex:1,padding:"7px 8px",borderRadius:9,textAlign:"center",
              border:"1px solid "+(v.hi?"#FECACA":C.border),background:v.hi?C.lred:"#fff"}}>
              <div style={{fontSize:8,fontWeight:700,color:v.hi?C.red:C.dgray,textTransform:"uppercase",letterSpacing:0.5,marginBottom:1}}>{v.l}</div>
              <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:700,color:v.hi?C.red:C.navy}}>{v.v}</div>
            </div>
          ))}
        </div>

        {/* Resumen IA */}
        <AIResumen meds={meds}/>

        {/* Vista compacta */}
        {compact ? (
          <div>
            <SoapBlock title="HPI" icon="📋" color={C.navy}>
              <p style={{fontSize:12,color:C.text,lineHeight:1.7,margin:0}}>Carlos Méndez, 58a. HTA · DM2 · ERC 3. Dolor torácico precordial opresivo con irradiación a brazo izquierdo, inicio hoy. Diaforesis y disnea. Fumador activo.</p>
            </SoapBlock>
            <SoapBlock title="Assessment" icon="⚕️" color={C.teal}>
              <p style={{fontSize:12,color:C.text,margin:0}}>1. Dolor torácico a estudio — <strong>descartar SCA</strong><br/>2. HTA no controlada<br/>3. DM2 descompensada (HbA1c 9.2%)<br/>4. ERC estadio 3</p>
            </SoapBlock>
            <SoapBlock title="Plan" icon="📋" color={C.green}>
              <div style={{background:C.lred,border:"1px solid #FECACA",borderRadius:7,padding:"7px 9px",marginBottom:7}}>
                <div style={{fontSize:11,fontWeight:800,color:C.red}}>🚨 Referir a emergencia hoy — no dar de alta sin descartar SCA</div>
              </div>
              <p style={{fontSize:11,color:C.text,margin:0,lineHeight:1.7}}>• ECG 12 derivaciones inmediato<br/>• Troponina I seriada (0h y 3h)<br/>• Aspirina 325 mg VO</p>
            </SoapBlock>
          </div>
        ) : (
          <>
            <Sec id="hpi" title="Motivo / HPI" icon="📋" color={C.navy} openId={openId} setOpenId={setOpenId}
              preview="Dolor torácico precordial opresivo, irradiado a brazo izq. Diaforesis y disnea. Fumador activo.">
              <textarea defaultValue={"Carlos Méndez, 58a, HTA · DM2 · ERC 3. Fumador activo 1 paq/día × 20 años.\n\nDolor torácico precordial opresivo con irradiación a brazo izquierdo, inicio esta mañana. Diaforesis y disnea. Adherencia parcial a medicamentos."}
                style={{width:"100%",minHeight:80,padding:"9px",borderRadius:9,border:"1.5px solid "+C.teal,fontSize:12,fontFamily:"Sora,sans-serif",color:C.navy,resize:"vertical",outline:"none",lineHeight:1.65,background:C.off}}></textarea>
            </Sec>

            <Sec id="examen" title="Examen físico" icon="🔍" color="#374151" openId={openId} setOpenId={setOpenId}
              preview="Regular, diaforético. CV: ritmo regular, sin soplos. Resp: pulmones claros. Sin edema.">
              <textarea defaultValue={"Apariencia: regular, diaforético, sin distress severo.\nCV: ritmo regular, sin soplos, sin IY.\nResp: pulmones claros bilateralmente.\nExtremidades: sin edema, pulsos simétricos 2+."}
                style={{width:"100%",minHeight:80,padding:"9px",borderRadius:9,border:"1.5px solid "+C.teal,fontSize:12,fontFamily:"Sora,sans-serif",color:C.navy,resize:"vertical",outline:"none",lineHeight:1.65,background:C.off}}></textarea>
            </Sec>

            {/* Medicamentos con alertas */}
            <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
              borderLeft:"4px solid "+C.teal,marginBottom:7,cursor:"pointer",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}
              onClick={() => setOpenId(openId==="meds"?null:"meds")}>
              <div style={{padding:"11px 13px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>💊</span>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:800,color:C.teal,textTransform:"uppercase",letterSpacing:0.7,marginBottom:openId==="meds"?0:2}}>Medicamentos</div>
                {openId!=="meds"&&<div style={{fontSize:11,color:C.dgray}}>5 cargados · {noConf} sin confirmar · ⚠️ duplicidad IECA/ARA</div>}</div>
                <span style={{fontSize:10,color:C.mgray,transform:openId==="meds"?"rotate(180deg)":"none",transition:"0.2s"}}>▼</span>
              </div>
              {openId==="meds"&&<div style={{padding:"0 13px 13px",borderTop:"1px solid "+C.border,paddingTop:11}} onClick={e=>e.stopPropagation()}>
                {meds.map(m=>{const ec=EMEDS[m.s]||EMEDS.duda;return(<div key={m.id} style={{background:C.white,borderRadius:10,border:"1.5px solid "+ec.bc,marginBottom:6,overflow:"hidden"}}>
                  <div style={{padding:"8px 10px",display:"flex",alignItems:"flex-start",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:ec.dot,flexShrink:0,marginTop:3}}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{m.n}</div><div style={{fontSize:10,color:C.dgray}}>{m.d}</div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}><Bb f={m.f}/><span style={{fontSize:8,fontWeight:700,color:ec.dot}}>{ec.label}</span></div></div>
                  {m.al.map((a,i)=><div key={i} style={{padding:"5px 10px 6px 26px",background:a.t==="danger"?C.lred:C.lamber,borderTop:"1px solid "+(a.t==="danger"?"#FECACA":"#FDE68A")}}><span style={{fontSize:10,fontWeight:600,color:a.t==="danger"?C.red:C.amber}}>{a.t==="danger"?"🚫":"⚠️"} {a.m}</span></div>)}
                  {(m.s==="duda"||m.s==="revisar")&&<div style={{padding:"5px 10px 7px",borderTop:"1px solid "+C.border,display:"flex",gap:5}}>
                    <button onClick={()=>setMeds(meds.map(x=>x.id===m.id?{...x,s:"conf"}:x))} style={{flex:1,padding:"5px",borderRadius:7,border:"none",background:C.lgreen,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.green}}>✓ Confirmar</button>
                    <button onClick={()=>setMeds(meds.map(x=>x.id===m.id?{...x,s:"susp"}:x))} style={{flex:1,padding:"5px",borderRadius:7,border:"1px solid #FECACA",background:C.lred,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.red}}>Suspender</button>
                  </div>}
                </div>);})}
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}><button onClick={()=>setOpenId(null)} style={{padding:"5px 14px",borderRadius:18,border:"none",background:C.lgreen,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.green}}>✓ Guardar</button></div>
              </div>}
            </div>

            <Sec id="assessment" title="Assessment" icon="⚕️" color={C.teal} openId={openId} setOpenId={setOpenId}
              preview={"Dolor torácico a estudio (R07.9) · HTA no controlada (I10)"+(extraDx.length?" · "+extraDx.join(" · "):"")}>
              <div style={{background:C.lred,border:"1px solid #FECACA",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:800,color:C.red,marginBottom:2}}>🚨 Evaluación urgente hoy</div>
                <div style={{fontSize:10,color:C.text}}>No dar de alta sin descartar SCA</div>
              </div>
              <textarea defaultValue={"1. Dolor torácico a estudio — descartar SCA\n2. HTA no controlada (PA 158/96)\n3. DM2 descompensada (HbA1c 9.2%)\n4. ERC estadio 3 estable\n\nDiferenciales: SCA ⚠️ · Disección aórtica ⚠️ · TEP ⚠️"}
                style={{width:"100%",minHeight:85,padding:"9px",borderRadius:9,border:"1.5px solid "+C.teal,fontSize:12,fontFamily:"Sora,sans-serif",color:C.navy,resize:"vertical",outline:"none",lineHeight:1.65,background:C.off}}></textarea>
            </Sec>

            <Sec id="plan" title="Plan" icon="📋" color={C.green} openId={openId} setOpenId={setOpenId}
              preview="ECG inmediato · Troponina seriada · Aspirina 325mg · Referir emergencia hoy">
              <textarea defaultValue={"URGENTE — Referir a emergencia hoy\n• No dar de alta sin descartar SCA\n• ECG 12 derivaciones — inmediato\n• Troponina I seriada x2 (0h y 3h)\n• Aspirina 325 mg VO si PA > 100\n• Nitroglicerina SL PRN\n\nPost-emergencia:\n• Ajustar HTA tras cuadro agudo\n• Monitorear función renal (ERC + metformina)"}
                style={{width:"100%",minHeight:100,padding:"9px",borderRadius:9,border:"1.5px solid "+C.teal,fontSize:12,fontFamily:"Sora,sans-serif",color:C.navy,resize:"vertical",outline:"none",lineHeight:1.65,background:C.off}}></textarea>
            </Sec>

            <OrdenesSection/>

            {/* Resultados */}
            <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
              borderLeft:"4px solid "+C.purple,marginBottom:7,padding:"11px 13px"}}>
              <div style={{fontSize:10,fontWeight:800,color:C.purple,textTransform:"uppercase",letterSpacing:0.7,marginBottom:8}}>🧪 Resultados aportados</div>
              {res.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",
                  borderRadius:9,border:"1px solid "+(r.ok?"#BBF7D0":"#FDE68A"),
                  background:r.ok?C.lgreen:C.lamber,marginBottom:5}}>
                  <span style={{fontSize:18}}>{r.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600}}>{r.l}</div>
                  <div style={{fontSize:9,fontWeight:700,color:r.ok?C.green:C.amber,marginTop:1}}>{r.ok?"✅ Revisado":"⏳ Pendiente"}</div></div>
                  {!r.ok&&<button onClick={()=>setRes(res.map(x=>x.id===r.id?{...x,ok:true}:x))} style={{padding:"4px 10px",borderRadius:16,border:"none",background:C.teal,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:9,fontWeight:700,color:C.white}}>Revisar ✓</button>}
                </div>
              ))}
            </div>

            {/* Notas privadas */}
            {npPend.length > 0 && (
              <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,borderLeft:"4px solid "+C.purple,marginBottom:7,padding:"11px 13px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{fontSize:10,fontWeight:800,color:C.purple,textTransform:"uppercase",letterSpacing:0.7}}>📝 Notas privadas</div>
                  <span style={{fontSize:9,fontWeight:700,color:C.purple,background:C.lpurple,border:"1px solid #DDD6FE",padding:"2px 7px",borderRadius:8}}>{npPend.length} pendiente{npPend.length>1?"s":""}</span>
                </div>
                <div style={{background:C.lpurple,borderRadius:8,padding:"6px 9px",marginBottom:7,fontSize:9,color:"#5B21B6",lineHeight:1.5}}>Solo visibles para usted. Apruebe lo que desea incluir.</div>
                {npPend.map(n=>(
                  <div key={n.id} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",background:C.off,borderRadius:9,border:"1px solid "+C.border,marginBottom:5}}>
                    <span style={{fontSize:12}}>📝</span>
                    <span style={{fontSize:11,color:C.text,flex:1,lineHeight:1.4}}>{n.t}</span>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>setNotas(notas.filter(x=>x.id!==n.id))} style={{padding:"3px 7px",borderRadius:6,border:"1px solid "+C.border,background:C.white,cursor:"pointer",fontSize:9,color:C.dgray,fontFamily:"Sora,sans-serif"}}>✕</button>
                      <button onClick={()=>setNotas(notas.map(x=>x.id===n.id?{...x,ok:true}:x))} style={{padding:"3px 9px",borderRadius:6,border:"none",background:C.lgreen,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:9,fontWeight:700,color:C.green}}>✅</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Sec id="seg" title="Seguimiento" icon="📅" color={C.dgray} openId={openId} setOpenId={setOpenId}
              preview="Control 48-72h si SCA descartado. Regresar si dolor recurre o disnea súbita.">
              <textarea defaultValue={"Si emergencia descarta SCA: control en 48-72 horas.\n\nRegresar de inmediato si: dolor recurre, disnea súbita, síncope o palidez."}
                style={{width:"100%",minHeight:70,padding:"9px",borderRadius:9,border:"1.5px solid "+C.teal,fontSize:12,fontFamily:"Sora,sans-serif",color:C.navy,resize:"vertical",outline:"none",lineHeight:1.65,background:C.off}}></textarea>
            </Sec>

            {/* ICD */}
            <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,borderLeft:"4px solid "+C.purple,marginBottom:7,padding:"11px 13px"}}>
              <div style={{fontSize:10,fontWeight:800,color:C.purple,textTransform:"uppercase",letterSpacing:0.7,marginBottom:9}}>📊 Diagnósticos CIE-10</div>
              {ICD_CODES.map((dx,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:i<ICD_CODES.length-1?"1px solid "+C.border:"none"}}>
                  <span style={{fontSize:11,color:C.text,flex:1,paddingRight:8}}>{dx.d}</span>
                  <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,fontWeight:700,color:C.purple,background:C.lpurple,padding:"2px 8px",borderRadius:6}}>{dx.c}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div style={{background:C.lamber,border:"1px solid #FDE68A",borderRadius:11,padding:"10px 13px",marginBottom:7}}>
          <div style={{fontSize:11,fontWeight:800,color:C.amber,marginBottom:3}}>⚖️ Responsabilidad médica</div>
          <p style={{fontSize:10,color:"#92400E",margin:0,lineHeight:1.6}}>
            <strong>La IA propone. El médico decide.</strong> Borrador asistido por IA. El médico revisa, corrige y firma. Nada entra automático.
          </p>
        </div>
      </div>

      {/* FIRMA COLAPSADA */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:390,margin:"0 auto",zIndex:30}}>
        {!firmExp ? (
          <div style={{background:C.white,borderTop:"1px solid "+C.border,padding:"10px 16px 22px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            boxShadow:"0 -4px 20px rgba(0,0,0,0.08)"}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.navy}}>Revisión completa</div>
              <div style={{fontSize:9,color:C.dgray,marginTop:1}}>La IA propone · Usted decide y firma</div>
            </div>
            <button onClick={() => setFirmExp(true)}
              style={{padding:"9px 18px",borderRadius:11,border:"none",cursor:"pointer",
                background:"linear-gradient(135deg,#0B8C80,#0A7A6E)",
                fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:13,color:C.white,
                boxShadow:"0 4px 14px rgba(11,140,128,0.35)",display:"flex",alignItems:"center",gap:5}}>
              ✅ Firmar nota
            </button>
          </div>
        ) : (
          <div style={{background:C.white,borderTop:"1px solid "+C.border,padding:"14px 16px 28px",
            boxShadow:"0 -4px 20px rgba(0,0,0,0.1)",animation:"SU 0.2s ease"}}>
            <button onClick={handleFirmar} disabled={firmando}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",
                cursor:firmando?"default":"pointer",
                background:firmando?"#94A3B8":"linear-gradient(135deg,#0B8C80,#0A7A6E)",
                fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:14,color:C.white,
                boxShadow:firmando?"none":"0 5px 20px rgba(11,140,128,0.38)",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6,transition:"all 0.3s"}}>
              {firmando
                ? <><div style={{width:18,height:18,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.35)",borderTop:"3px solid #fff",animation:"SP 0.8s linear infinite"}}/>Firmando…</>
                : "✅ Firmar nota clínica"}
            </button>
            <p style={{textAlign:"center",fontSize:9,color:C.dgray,margin:"0 0 7px",lineHeight:1.5}}>
              {MEDICO.eq} · {hoy()} · ID único generado al firmar
            </p>
            <button onClick={() => setFirmExp(false)}
              style={{width:"100%",padding:"7px",borderRadius:9,border:"1px solid "+C.border,
                background:"transparent",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,color:C.dgray}}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
