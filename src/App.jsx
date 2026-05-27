import { useState, useEffect, useRef } from "react";
import { C, GCSS, fmt, hoy, INITIAL_ANT, INITIAL_MEDS, VITALES } from "./data/constants";
import { Toast, useAutoSave } from "./components/Atoms";
import MedicalHistory from "./components/MedicalHistory";
import RecordingScreen from "./components/RecordingScreen";
import SOAPReview from "./components/SOAPReview";
import ResultsUpload from "./components/ResultsUpload";
import Expediente from "./components/Expediente";
import { registrarVisita, addResultado } from "./data/expediente";

// Flujo: inicio → grabando → gen → soap
// NO pantalla intermedia "nota"

export default function App() {
  const[scr,      setScr]      = useState("inicio");
  const[secs,     setSecs]     = useState(0);
  const[tipo,     setTipo]     = useState("Nota de Progreso");
  const[pct,      setPct]      = useState(0);
  const[con,      setCon]      = useState(false);
  const[paused,   setPaused]   = useState(false);
  const[tmsg,     setTmsg]     = useState(null);
  const[ant,      setAnt]      = useState(INITIAL_ANT);
  const[meds,     setMeds]     = useState(INITIAL_MEDS);
  const[res,      setRes]      = useState([]);
  const[notas,    setNotas]    = useState([]);
  const[extraDx,  setExtraDx]  = useState([]);
  const[showH,    setShowH]    = useState(false);
  const[showRes,  setShowRes]  = useState(false);
  const[showExp,  setShowExp]  = useState(false);
  const clk = useRef(null);

  const sh = m => { setTmsg(m); setTimeout(()=>setTmsg(null), 2400); };
  const { offline, saved, checkRecovery, clearSave } = useAutoSave(
    { ant, meds, res, notas, secs }, scr === "grabando"
  );

  useEffect(()=>{
    if(scr==="grabando" && !paused){
      clk.current = setInterval(()=>setSecs(x=>x+1), 1000);
    } else {
      clearInterval(clk.current);
    }
    return()=>clearInterval(clk.current);
  },[scr, paused]);

  useEffect(()=>{
    if(scr==="gen"){
      setPct(0);
      const steps=[12,35,58,78,91,100];
      const ts=steps.map((v,i)=>setTimeout(()=>setPct(v),(i+1)*480));
      // ── Va directo a SOAP — sin pantalla intermedia ──
      const fin=setTimeout(()=>setScr("soap"), 3200);
      return()=>{ ts.forEach(clearTimeout); clearTimeout(fin); };
    }
  },[scr]);

  function reset(){
    setScr("inicio"); setSecs(0); setCon(false); setPaused(false); setTmsg(null);
    setAnt(INITIAL_ANT); setMeds(INITIAL_MEDS); setRes([]); setNotas([]);
    setExtraDx([]); setShowH(false); setShowRes(false); setShowExp(false); clearSave();
  }

  // ── Expediente overlay ──────────────────────────────────────────────────────
  if (showExp) return (
    <>
      <style>{GCSS}</style>
      <Expediente onClose={() => setShowExp(false)}/>
    </>
  );

  // ── MedicalHistory overlay — funciona en cualquier pantalla ────────────────
  // Se renderiza aquí para que esté disponible durante grabación e inicio
  const HistoriaOverlay = showH ? (
    <MedicalHistory data={ant} onChange={setAnt}
      toast={sh} onClose={()=>setShowH(false)}/>
  ) : null;

  // ── Pantallas principales ───────────────────────────────────────────────────
  if(scr==="grabando") return(
    <>
      <style>{GCSS}</style>
      <RecordingScreen secs={secs} ant={ant} setAnt={setAnt}
        meds={meds} setMeds={setMeds} res={res} setRes={setRes}
        notas={notas} setNotas={setNotas} toast={sh}
        offline={offline} paused={paused}
        onPause={()=>setPaused(p=>!p)}
        onFinish={()=>setScr("gen")}
        onOpenHistory={()=>setShowH(true)}/>
      {HistoriaOverlay}
    </>
  );

  function handleFirmar(fd) {
    // Guardar visita en expediente longitudinal
    registrarVisita({ soap:{}, meds, res, notas, secs, firmaId:fd.id });
    // Guardar resultados aportados en expediente
    res.forEach(r => {
      addResultado({ nombre:r.l, tipo:"laboratorio", fuente:"Aportado por paciente", lab:r.source||"" });
    });
  }

  if(scr==="soap") return(
    <>
      <style>{GCSS}</style>
      <SOAPReview ant={ant} meds={meds} setMeds={setMeds}
        res={res} setRes={setRes} notas={notas} setNotas={setNotas}
        extraDx={extraDx} secs={secs}
        onFirmar={handleFirmar} onClose={reset} toast={sh}/>
    </>
  );

  // ── Generando SOAP ──────────────────────────────────────────────────────────
  if(scr==="gen") return(
    <div style={{fontFamily:"Sora,sans-serif",maxWidth:390,margin:"0 auto",
      minHeight:"100vh",background:C.off,display:"flex",flexDirection:"column"}}>
      <style>{GCSS}</style>
      <div style={{background:C.navy,padding:"12px 18px"}}>
        <span style={{fontWeight:800,fontSize:19,color:C.white}}>MedScribe <span style={{color:C.teal}}>RD</span></span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",padding:28}}>
        <div style={{position:"relative",marginBottom:20}}>
          <div style={{width:70,height:70,borderRadius:"50%",
            border:"5px solid "+C.lteal,borderTop:"5px solid "+C.teal,
            animation:"SP 0.85s linear infinite"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",
            transform:"translate(-50%,-50%)",fontSize:26}}>🩺</div>
        </div>
        <p style={{fontWeight:800,fontSize:18,color:C.navy,margin:"0 0 5px"}}>
          Generando nota clínica
        </p>
        <p style={{fontSize:12,color:C.dgray,margin:"0 0 20px"}}>
          Consulta de {fmt(secs)}
        </p>
        <div style={{width:"100%",maxWidth:280,display:"flex",flexDirection:"column",gap:7}}>
          {[{l:"Historia de la enfermedad actual",at:20},
            {l:"Examen físico",at:45},
            {l:"Evaluación clínica",at:68},
            {l:"Plan y medicamentos",at:88}].map(s=>{
            const done=pct>=s.at;
            return(
              <div key={s.l} style={{display:"flex",alignItems:"center",gap:9,
                opacity:done?1:0.25,transition:"opacity 0.5s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,
                  background:done?C.teal:C.gray,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:10,color:C.white,fontWeight:800}}>
                  {done?"✓":""}
                </div>
                <span style={{fontSize:12,color:done?C.navy:C.dgray,fontWeight:done?600:400}}>
                  {s.l}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{width:"100%",maxWidth:280,marginTop:18}}>
          <div style={{height:4,background:C.gray,borderRadius:8,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,"+C.teal+",#1464A0)",
              borderRadius:8,width:pct+"%",transition:"width 0.8s ease"}}/>
          </div>
        </div>
      </div>
    </div>
  );

  // ── INICIO ──────────────────────────────────────────────────────────────────
  return(
    <div style={{fontFamily:"Sora,sans-serif",maxWidth:390,margin:"0 auto",
      minHeight:"100vh",background:"linear-gradient(160deg,#EEF4FF,#E2F4F1)",
      display:"flex",flexDirection:"column"}}>
      <style>{GCSS}</style>

      <div style={{background:C.navy,padding:"12px 18px",display:"flex",
        alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,fontSize:19,color:C.white}}>
          MedScribe <span style={{color:C.teal}}>RD</span>
        </span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {offline&&<span style={{fontSize:9,fontWeight:700,color:C.amber,
            background:C.lamber,border:"1px solid #FDE68A",padding:"2px 7px",borderRadius:8}}>
            📵 Offline
          </span>}
          <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:600}}>🟢 Listo 🔒</span>
        </div>
      </div>
      <div style={{background:"rgba(11,37,69,0.04)",borderBottom:"1px solid "+C.border,
        padding:"5px 18px",fontSize:11,color:C.dgray}}>
        🔒 Audio no almacenado · Ley 172-13 · 42-01
      </div>

      <Toast m={tmsg}/>

      {HistoriaOverlay}

      <div style={{flex:1,padding:"16px 18px",display:"flex",
        flexDirection:"column",gap:12,overflowY:"auto"}}>

        {/* Tipo de nota */}
        <div>
          <p style={{fontSize:11,color:C.dgray,margin:"0 0 8px",fontWeight:700,
            textTransform:"uppercase",letterSpacing:1}}>Tipo de nota</p>
          <div style={{display:"flex",gap:8}}>
            {["Nota de Progreso","Primera Consulta"].map(t=>(
              <button key={t} onClick={()=>setTipo(t)}
                style={{flex:1,padding:"11px 8px",borderRadius:13,border:"none",
                  cursor:"pointer",background:tipo===t?C.navy:C.white,
                  color:tipo===t?C.white:C.text,fontFamily:"Sora,sans-serif",
                  fontWeight:600,fontSize:13,transition:"all 0.2s"}}>{t}</button>
            ))}
          </div>
        </div>

        {/* Preparar antes de iniciar */}
        <div style={{background:C.white,borderRadius:14,border:"1px solid "+C.border,padding:"12px 14px"}}>
          <p style={{fontSize:10,fontWeight:700,color:C.dgray,textTransform:"uppercase",
            letterSpacing:0.8,margin:"0 0 9px"}}>Preparar antes de iniciar</p>
          <div style={{display:"flex",gap:7,marginBottom:8}}>
            {/* Antecedentes */}
            <button onClick={()=>setShowH(true)}
              style={{flex:1,padding:"10px 6px",borderRadius:11,
                border:"1.5px solid "+C.teal,background:C.lteal,
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>🩺</span>
              <span style={{fontFamily:"Sora,sans-serif",fontWeight:700,fontSize:10,color:C.teal}}>
                Antecedentes
              </span>
              <span style={{fontSize:9,color:C.teal,fontWeight:700}}>
                {Object.values(ant).flat().length} registros
              </span>
            </button>
            {/* Medicamentos */}
            <button onClick={()=>sh("💊 Use el panel ≡ durante la consulta")}
              style={{flex:1,padding:"10px 6px",borderRadius:11,
                border:"1.5px solid "+C.border,background:C.white,
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>💊</span>
              <span style={{fontFamily:"Sora,sans-serif",fontWeight:600,fontSize:10,color:C.navy}}>
                Medicamentos
              </span>
              <span style={{fontSize:9,color:C.teal,fontWeight:700}}>{meds.length} cargados</span>
            </button>
            {/* Resultados */}
            <button onClick={()=>setShowRes(!showRes)}
              style={{flex:1,padding:"10px 6px",borderRadius:11,
                border:"1.5px solid "+(showRes?C.teal:C.border),
                background:showRes?C.lteal:C.white,
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>🧪</span>
              <span style={{fontFamily:"Sora,sans-serif",fontWeight:600,fontSize:10,
                color:showRes?C.teal:C.navy}}>Resultados</span>
              <span style={{fontSize:9,color:res.length?C.teal:C.mgray,fontWeight:700}}>
                {res.length>0?res.length+" cargados":"Añadir"}
              </span>
            </button>
          </div>

          {/* ResultsUpload inline */}
          {showRes && (
            <div style={{marginTop:8,borderTop:"1px solid "+C.border,paddingTop:10}}>
              <ResultsUpload items={res} onChange={setRes} toast={sh}/>
            </div>
          )}

          <div style={{background:C.gray,borderRadius:9,padding:"7px 10px",
            fontSize:11,color:C.dgray,marginTop:8}}>
            💡 Cargue antecedentes y resultados antes de iniciar el audio
          </div>
        </div>

        {/* Botón iniciar */}
        <button onClick={()=>{
          if(!con){sh("⚠️ Confirme consentimiento primero");return;}
          setScr("grabando");
        }} style={{width:"100%",padding:"20px",
          background:"linear-gradient(135deg,"+C.navy+",#174E8C)",
          border:"none",borderRadius:20,cursor:"pointer",
          boxShadow:"0 10px 40px rgba(11,37,69,0.38)",
          display:"flex",flexDirection:"column",alignItems:"center",gap:12,
          opacity:con?1:0.75,transition:"opacity 0.2s"}}>
          <div style={{width:52,height:52,borderRadius:"50%",
            background:"rgba(255,255,255,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🎙️</div>
          <div style={{fontWeight:800,fontSize:20,color:C.white}}>INICIAR CONSULTA</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>
            {tipo} · {con?"La IA escucha, usted atiende":"Confirme consentimiento primero"}
          </div>
        </button>

        {/* Paciente */}
        <div style={{background:C.white,borderRadius:14,border:"1px solid "+C.border,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>Carlos Méndez</div>
              <div style={{fontSize:11,color:C.dgray}}>58a · M</div>
            </div>
            <button onClick={()=>sh("📂 Expediente...")}
              style={{fontSize:11,color:C.teal,fontWeight:600,background:C.lteal,
                padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer"}}>
              Ver expediente
            </button>
          </div>
          <div style={{display:"flex",gap:5}}>
            {["HTA","DM2","ERC 3"].map(d=>(
              <span key={d} style={{fontSize:11,color:C.red,background:C.lred,
                padding:"3px 9px",borderRadius:10,fontWeight:600}}>{d}</span>
            ))}
          </div>
        </div>

        {/* Consentimiento */}
        <div onClick={()=>setCon(!con)} style={{background:con?C.lgreen:"#F3F4F6",
          border:"1px solid "+(con?C.green:C.border),borderRadius:12,
          padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"flex-start",
          gap:10,transition:"all 0.2s"}}>
          <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:1,
            border:"2px solid "+(con?C.green:C.mgray),
            background:con?C.green:"transparent",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            {con&&<span style={{fontSize:12,color:C.white,fontWeight:800}}>✓</span>}
          </div>
          <p style={{margin:0,fontSize:12,color:con?C.green:C.dgray,lineHeight:1.6}}>
            Confirmo consentimiento verbal del paciente para asistencia de IA.
          </p>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:C.white,borderTop:"1px solid "+C.border,
        display:"flex",padding:"9px 0 18px",position:"sticky",bottom:0,
        boxShadow:"0 -2px 14px rgba(0,0,0,0.06)"}}>
        {[{ic:"🎙️",l:"Scribe",act:true},{ic:"📋",l:"Expediente"},{ic:"🔬",l:"Labs"},{ic:"👤",l:"Perfil"}].map((x,i)=>(
          <button key={x.l} onClick={i===0?reset:i===1?()=>setShowExp(true):()=>sh(x.l+"...")}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
              gap:2,background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontSize:20}}>{x.ic}</span>
            <span style={{fontSize:10,fontWeight:x.act?700:400,
              color:x.act?C.teal:C.dgray,fontFamily:"Sora,sans-serif"}}>{x.l}</span>
            {x.act&&<div style={{width:5,height:5,borderRadius:"50%",background:C.teal}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}