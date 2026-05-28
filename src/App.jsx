import { useState, useEffect, useRef } from "react";
import { C, GCSS, fmt, hoy, INITIAL_ANT, INITIAL_MEDS } from "./data/constants";
import { Toast, useAutoSave } from "./components/Atoms";
import MedicalHistory from "./components/MedicalHistory";
import RecordingScreen from "./components/RecordingScreen";
import SOAPReview from "./components/SOAPReview";
import ResultsUpload from "./components/ResultsUpload";
import Expediente from "./components/Expediente";
import { registrarVisita, addResultado } from "./data/expediente";

export default function App() {
  const [scr,     setScr]     = useState("inicio");
  const [secs,    setSecs]    = useState(0);
  const [tipo,    setTipo]    = useState("Consulta de seguimiento");
  const [con,     setCon]     = useState(false);
  const [paused,  setPaused]  = useState(false);
  const [tmsg,    setTmsg]    = useState(null);
  const [ant,     setAnt]     = useState(INITIAL_ANT);
  const [meds,    setMeds]    = useState(INITIAL_MEDS);
  const [res,     setRes]     = useState([]);
  const [notas,   setNotas]   = useState([]);
  const [capturas,setCapturas]= useState([]);
  const [showH,   setShowH]   = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const clk = useRef(null);

  const sh = m => { setTmsg(m); setTimeout(()=>setTmsg(null),2400); };
  const { offline, clearSave } = useAutoSave(
    { ant, meds, res, notas, secs }, scr==="grabando"
  );

  useEffect(()=>{
    if(scr==="grabando"&&!paused){
      clk.current=setInterval(()=>setSecs(x=>x+1),1000);
    } else { clearInterval(clk.current); }
    return()=>clearInterval(clk.current);
  },[scr,paused]);

  function reset(){
    clearSave(); setScr("inicio"); setSecs(0); setCon(false); setPaused(false);
    setTmsg(null); setAnt(INITIAL_ANT); setMeds(INITIAL_MEDS);
    setRes([]); setNotas([]); setCapturas([]);
    setShowH(false); setShowRes(false); setShowExp(false);
  }

  function handleFirmar(fd){
    registrarVisita({soap:{},meds,res,notas,secs,firmaId:fd.id});
    res.forEach(r=>addResultado({nombre:r.l,tipo:"laboratorio",fuente:"Paciente",lab:r.source||""}));
  }

  if(showExp) return(<><style>{GCSS}</style><Expediente onClose={()=>setShowExp(false)}/></>);

  const HistoriaModal = showH?(
    <MedicalHistory data={ant} onChange={setAnt} toast={sh} onClose={()=>setShowH(false)}/>
  ):null;

  if(scr==="grabando") return(
    <><style>{GCSS}</style>
      <RecordingScreen secs={secs} ant={ant} setAnt={setAnt}
        meds={meds} setMeds={setMeds} res={res} setRes={setRes}
        notas={notas} setNotas={setNotas} toast={sh}
        offline={offline} paused={paused}
        onPause={()=>setPaused(p=>!p)}
        onFinish={()=>setScr("soap")}
        capturas={capturas}
        onCaptura={(c)=>setCapturas(p=>{
          const i=p.findIndex(x=>x.id===c.id);
          if(i>=0){const n=[...p];n[i]={...n[i],...c};return n;}
          return [...p,c];
        })}/>
      {HistoriaModal}
    </>
  );

  if(scr==="soap") return(
    <><style>{GCSS}</style>
      <SOAPReview ant={ant} meds={meds} setMeds={setMeds}
        res={res} setRes={setRes} notas={notas} setNotas={setNotas}
        extraDx={[]} secs={secs} onFirmar={handleFirmar} onClose={reset} toast={sh}
        capturas={capturas.filter(c=>c.aceptada)}/>
    </>
  );

  const ahora = new Date().toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"});

  return(
    <div style={{
      fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#EEF2F7",
      display:"flex", flexDirection:"column"
    }}>
      <style>{GCSS}</style>
      {HistoriaModal}
      <Toast m={tmsg}/>

      {/* ── Header ── */}
      <div style={{background:C.navy, padding:"8px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span style={{fontWeight:800, fontSize:17, color:C.white, letterSpacing:-0.3}}>
          MedScribe <span style={{color:C.teal}}>RD</span>
        </span>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span style={{fontSize:9, color:"rgba(255,255,255,0.65)", fontWeight:500}}>
            {hoy()} · {ahora} · 🔒
          </span>
          {offline&&<span style={{fontSize:8,color:C.amber,
            background:"rgba(245,158,11,0.12)",padding:"1px 5px",borderRadius:5}}>📵</span>}
        </div>
      </div>

      {/* ── Estado dinámico ── */}
      <div style={{background:"#0D3060", padding:"3px 16px",
        display:"flex", alignItems:"center", gap:7,
        borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:8, height:8, borderRadius:"50%", flexShrink:0,
          background:con?"#22C55E":"#FCD34D"}}/>
        <span style={{fontSize:11, fontWeight:600,
          color:con?"rgba(255,255,255,0.80)":"rgba(255,255,255,0.65)"}}>
          {con?"Paciente listo":"Consentimiento pendiente"}
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{flex:1, padding:"13px 14px", display:"flex",
        flexDirection:"column", gap:15,
        overflowY:"auto", paddingBottom:76}}>

        {/* Paciente */}
        <div style={{background:C.navy, borderRadius:13, padding:"14px 15px"}}>
          <div style={{fontSize:19, fontWeight:800, color:C.white,
            letterSpacing:-0.3, marginBottom:3}}>
            Carlos Méndez
          </div>
          <div style={{fontSize:10, color:"rgba(255,255,255,0.50)", marginBottom:3}}>
            Fecha nac: 12/03/1967 · 58 años · Masculino
          </div>
          <div style={{fontSize:9, color:"rgba(255,255,255,0.35)", marginBottom:9}}>
            Seguro: <span style={{color:C.teal, fontWeight:600}}>ARS Humano</span>
          </div>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {(ant.ale||[]).map(a=>(
              <span key={a.id} style={{fontSize:9, fontWeight:600,
                color:"#FCA5A5", background:"rgba(185,28,28,0.28)",
                padding:"3px 11px", borderRadius:20}}>⚠ {a.t}</span>
            ))}
            <span style={{fontSize:9, fontWeight:600,
              color:"#FCD34D", background:"rgba(161,98,7,0.28)",
              padding:"3px 11px", borderRadius:20}}>⚠ ERC estadio 3</span>
          </div>
        </div>

        {/* Tipo consulta */}
        <div style={{display:"flex", gap:8}}>
          {["Consulta de seguimiento","Primera consulta"].map(t=>(
            <button key={t} onClick={()=>setTipo(t)}
              style={{flex:1, padding:"10px 6px", borderRadius:11,
                border:tipo===t?"none":"1.5px solid #94A3B8",
                cursor:"pointer",
                background:tipo===t?"#1E3A5F":C.white,
                color:tipo===t?C.white:"#374151",
                fontFamily:"Sora,sans-serif", fontWeight:600,
                fontSize:11, transition:"all 0.18s"}}>
              {t}
            </button>
          ))}
        </div>

        {/* ── BOTÓN INICIAR — protagonista ── */}
        <button onClick={()=>{
          if(!con){sh("⚠️ Confirme consentimiento primero");return;}
          setScr("grabando");
        }} style={{width:"100%", padding:"20px 20px",
          background:"linear-gradient(135deg,#091D35 0%,#0D2B4E 40%,#1254A0 100%)",
          border:"none", borderRadius:16, cursor:"pointer",
          display:"flex", alignItems:"center", gap:15,
          boxShadow:"0 8px 32px rgba(9,29,53,0.45)"}}>
          <div style={{width:48, height:48, borderRadius:"50%",
            background:"rgba(255,255,255,0.10)",
            display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:22, flexShrink:0}}>🎤</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontWeight:800, fontSize:21, color:C.white,
              letterSpacing:-0.3, marginBottom:5}}>
              Iniciar consulta
            </div>
            <div style={{fontSize:9, color:"rgba(255,255,255,0.55)",
              background:"rgba(255,200,0,0.10)",
              padding:"2px 7px", borderRadius:5, display:"inline-block"}}>
              ⚠️ Confirme consentimiento antes de iniciar
            </div>
          </div>
        </button>

        {/* Consentimiento */}
        <div onClick={()=>setCon(!con)}
          style={{background:con?"#F0FDF4":C.white,
            border:"1px solid "+(con?"#86EFAC":"#E2E8F0"),
            borderRadius:10, padding:"11px 14px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
            transition:"all 0.18s"}}>
          <div style={{width:19, height:19, borderRadius:4, flexShrink:0,
            border:"1.5px solid "+(con?"#22C55E":"#CBD5E1"),
            background:con?"#22C55E":"transparent",
            display:"flex", alignItems:"center", justifyContent:"center"}}>
            {con&&<span style={{fontSize:11,color:C.white,fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:12, color:con?"#15803D":"#64748B",
            fontWeight:con?600:400}}>
            Consentimiento verbal del paciente
          </span>
          {con&&<span style={{fontSize:9,color:"#16A34A",marginLeft:"auto"}}>
            confirmado
          </span>}
        </div>

        {/* Labs inline si se abre */}
        {showRes&&(
          <div style={{background:C.white, borderRadius:10,
            border:"1px solid "+C.border, padding:"10px 12px"}}>
            <div style={{fontSize:9, fontWeight:700, color:C.dgray,
              textTransform:"uppercase", letterSpacing:0.6, marginBottom:8}}>
              Labs e imágenes
            </div>
            <ResultsUpload items={res} onChange={setRes} toast={sh}/>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <div style={{background:C.white, borderTop:"1px solid "+C.border,
        display:"flex", padding:"7px 0 15px",
        position:"fixed", bottom:0, left:"50%",
        transform:"translateX(-50%)", width:"100%", maxWidth:390,
        boxShadow:"0 -1px 10px rgba(0,0,0,0.06)"}}>
        {[
          {ic:"🩺", l:"Historia",     sub:"Médica · Social",   fn:()=>setShowH(true)},
          {ic:"💊", l:"Medicamentos", sub:meds.length+" activos", fn:()=>sh("💊 "+meds.length+" activos")},
          {ic:"🧪", l:"Resultados",   sub:"Labs · imágenes",   fn:()=>setShowRes(!showRes)},
          {ic:"📋", l:"Expediente",   sub:"",                  fn:()=>setShowExp(true)},
        ].map(x=>(
          <button key={x.l} onClick={x.fn}
            style={{flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:1,
              background:"none", border:"none", cursor:"pointer", padding:"2px 0"}}>
            <span style={{fontSize:19}}>{x.ic}</span>
            <span style={{fontSize:10, fontWeight:600, color:C.navy,
              fontFamily:"Sora,sans-serif"}}>{x.l}</span>
            {x.sub&&<span style={{fontSize:8, color:"#64748B", fontWeight:500}}>{x.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
