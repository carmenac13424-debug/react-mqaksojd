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
  const [scr,    setScr]    = useState("inicio");
  const [secs,   setSecs]   = useState(0);
  const [tipo,   setTipo]   = useState("Nota de Progreso");
  const [con,    setCon]    = useState(false);
  const [paused, setPaused] = useState(false);
  const [tmsg,   setTmsg]   = useState(null);
  const [ant,    setAnt]    = useState(INITIAL_ANT);
  const [meds,   setMeds]   = useState(INITIAL_MEDS);
  const [res,    setRes]    = useState([]);
  const [notas,  setNotas]  = useState([]);
  const [showH,  setShowH]  = useState(false);
  const [showRes,setShowRes]= useState(false);
  const [showExp,setShowExp]= useState(false);
  const clk = useRef(null);

  const sh = m => { setTmsg(m); setTimeout(() => setTmsg(null), 2400); };
  const { offline, clearSave } = useAutoSave(
    { ant, meds, res, notas, secs }, scr === "grabando"
  );

  useEffect(() => {
    if (scr === "grabando" && !paused) {
      clk.current = setInterval(() => setSecs(x => x + 1), 1000);
    } else {
      clearInterval(clk.current);
    }
    return () => clearInterval(clk.current);
  }, [scr, paused]);

  function reset() {
    clearSave();
    setScr("inicio"); setSecs(0); setCon(false); setPaused(false);
    setTmsg(null); setAnt(INITIAL_ANT); setMeds(INITIAL_MEDS);
    setRes([]); setNotas([]);
    setShowH(false); setShowRes(false); setShowExp(false);
  }

  function handleFirmar(fd) {
    registrarVisita({ soap:{}, meds, res, notas, secs, firmaId: fd.id });
    res.forEach(r => addResultado({
      nombre: r.l, tipo: "laboratorio",
      fuente: "Aportado por paciente", lab: r.source || ""
    }));
  }

  // Overlays
  if (showExp) return (
    <><style>{GCSS}</style><Expediente onClose={() => setShowExp(false)}/></>
  );

  const HistoriaModal = showH ? (
    <MedicalHistory data={ant} onChange={setAnt} toast={sh} onClose={() => setShowH(false)}/>
  ) : null;

  if (scr === "grabando") return (
    <><style>{GCSS}</style>
      <RecordingScreen
        secs={secs} ant={ant} setAnt={setAnt}
        meds={meds} setMeds={setMeds}
        res={res} setRes={setRes}
        notas={notas} setNotas={setNotas}
        toast={sh} offline={offline} paused={paused}
        onPause={() => setPaused(p => !p)}
        onFinish={() => setScr("soap")}
        onOpenHistory={() => setShowH(true)}
      />
      {HistoriaModal}
    </>
  );

  if (scr === "soap") return (
    <><style>{GCSS}</style>
      <SOAPReview
        ant={ant} meds={meds} setMeds={setMeds}
        res={res} setRes={setRes}
        notas={notas} setNotas={setNotas}
        extraDx={[]} secs={secs}
        onFirmar={handleFirmar} onClose={reset} toast={sh}
      />
    </>
  );

  // ── INICIO ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F8FAFC",
      display:"flex", flexDirection:"column" }}>
      <style>{GCSS}</style>
      {HistoriaModal}
      <Toast m={tmsg}/>

      {/* Header */}
      <div style={{ background:C.navy, padding:"11px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:800, fontSize:18, color:C.white }}>
          MedScribe <span style={{ color:C.teal }}>RD</span>
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          {offline && <span style={{ fontSize:9, fontWeight:700, color:C.amber,
            background:C.lamber, border:"1px solid #FDE68A",
            padding:"2px 6px", borderRadius:7 }}>📵</span>}
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>🟢 Listo 🔒</span>
        </div>
      </div>
      <div style={{ background:"rgba(11,37,69,0.04)", borderBottom:"1px solid "+C.border,
        padding:"4px 18px", fontSize:10, color:C.dgray }}>
        🔒 Audio no almacenado · Ley 172-13 · 42-01
      </div>

      <div style={{ flex:1, padding:"14px 18px",
        display:"flex", flexDirection:"column", gap:11, overflowY:"auto" }}>

        {/* 1 — PACIENTE (arriba de todo) */}
        <div style={{ background:C.white, borderRadius:13,
          border:"1px solid "+C.border, padding:"13px 15px" }}>
          <div style={{ display:"flex", alignItems:"flex-start",
            justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:800, fontSize:17, color:C.navy,
                marginBottom:3 }}>Carlos Méndez</div>
              <div style={{ fontSize:11, color:C.dgray, marginBottom:2 }}>
                Fecha de nacimiento: 12/03/1967
              </div>
              <div style={{ fontSize:12, color:C.dgray }}>
                58 años · Masculino
              </div>
            </div>
            <button onClick={() => setShowExp(true)}
              style={{ fontSize:10, color:C.teal, fontWeight:700,
                background:C.lteal, padding:"5px 11px",
                borderRadius:18, border:"none", cursor:"pointer",
                flexShrink:0 }}>
              Expediente
            </button>
          </div>
        </div>

        {/* 2 — Tipo de nota */}
        <div>
          <p style={{ fontSize:10, color:C.dgray, margin:"0 0 7px",
            fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>
            Tipo de nota
          </p>
          <div style={{ display:"flex", gap:7 }}>
            {["Nota de Progreso","Primera Consulta"].map(t => (
              <button key={t} onClick={() => setTipo(t)}
                style={{ flex:1, padding:"10px 8px", borderRadius:11,
                  border:"none", cursor:"pointer",
                  background: tipo===t ? C.navy : C.white,
                  color: tipo===t ? C.white : C.text,
                  fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:12, transition:"all 0.2s",
                  border: tipo===t ? "none" : "1px solid "+C.border }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3 — INICIAR (compacto) */}
        <button onClick={() => {
          if (!con) { sh("⚠️ Confirme consentimiento primero"); return; }
          setScr("grabando");
        }} style={{ width:"100%", padding:"14px 20px",
          background: con
            ? "linear-gradient(135deg,"+C.navy+",#174E8C)"
            : C.gray,
          border: con ? "none" : "1px solid "+C.border,
          borderRadius:14, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          transition:"all 0.25s",
          boxShadow: con ? "0 6px 24px rgba(11,37,69,0.28)" : "none" }}>
          <span style={{ fontSize:20 }}>🎤</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontWeight:800, fontSize:15,
              color: con ? C.white : C.mgray }}>
              Iniciar consulta
            </div>
            <div style={{ fontSize:10,
              color: con ? "rgba(255,255,255,0.55)" : C.mgray }}>
              {tipo} · {con ? "La IA documenta en segundo plano" : "Confirme consentimiento primero"}
            </div>
          </div>
        </button>

        {/* 4 — CONSENTIMIENTO */}
        <div onClick={() => setCon(!con)}
          style={{ background: con ? C.lgreen : C.white,
            border:"1px solid "+(con ? C.green : C.border),
            borderRadius:11, padding:"11px 13px", cursor:"pointer",
            display:"flex", alignItems:"flex-start", gap:10,
            transition:"all 0.2s" }}>
          <div style={{ width:20, height:20, borderRadius:5,
            flexShrink:0, marginTop:1,
            border:"2px solid "+(con ? C.green : C.mgray),
            background: con ? C.green : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {con && <span style={{ fontSize:11, color:C.white, fontWeight:800 }}>✓</span>}
          </div>
          <p style={{ margin:0, fontSize:12,
            color: con ? C.green : C.dgray, lineHeight:1.55 }}>
            Confirmo consentimiento verbal del paciente para asistencia de IA.
          </p>
        </div>

        {/* 5 — APOYO CLÍNICO (solo después del consentimiento) */}
        {con && (
          <div style={{ background:C.white, borderRadius:13,
            border:"1px solid "+C.border, padding:"12px 14px",
            animation:"FU 0.3s ease" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.dgray,
              textTransform:"uppercase", letterSpacing:0.8, margin:"0 0 9px" }}>
              Preparar antes de iniciar
            </p>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setShowH(true)}
                style={{ flex:1, padding:"9px 5px", borderRadius:10,
                  border:"1.5px solid "+C.teal, background:C.lteal,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ fontSize:18 }}>🩺</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700,
                  fontSize:9, color:C.teal }}>Antecedentes</span>
                <span style={{ fontSize:8, color:C.teal, fontWeight:700 }}>
                  {Object.values(ant).flat().length} registros
                </span>
              </button>
              <button onClick={() => sh("💊 Añada meds durante la grabación")}
                style={{ flex:1, padding:"9px 5px", borderRadius:10,
                  border:"1px solid "+C.border, background:C.white,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ fontSize:18 }}>💊</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:9, color:C.navy }}>Medicamentos</span>
                <span style={{ fontSize:8, color:C.teal, fontWeight:700 }}>
                  {meds.length} cargados
                </span>
              </button>
              <button onClick={() => setShowRes(!showRes)}
                style={{ flex:1, padding:"9px 5px", borderRadius:10,
                  border:"1px solid "+(showRes ? C.teal : C.border),
                  background: showRes ? C.lteal : C.white,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ fontSize:18 }}>🧪</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:9, color: showRes ? C.teal : C.navy }}>Resultados</span>
                <span style={{ fontSize:8,
                  color: res.length ? C.teal : C.mgray, fontWeight:700 }}>
                  {res.length > 0 ? res.length+" cargados" : "Añadir"}
                </span>
              </button>
            </div>
            {showRes && (
              <div style={{ borderTop:"1px solid "+C.border, paddingTop:9, marginTop:9 }}>
                <ResultsUpload items={res} onChange={setRes} toast={sh}/>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NAV — clínica dominicana */}
      <div style={{ background:C.white, borderTop:"1px solid "+C.border,
        display:"flex", padding:"8px 0 16px",
        position:"sticky", bottom:0,
        boxShadow:"0 -2px 12px rgba(0,0,0,0.05)" }}>
        {[
          { ic:"🩺", l:"Historia",      fn: () => setShowH(true) },
          { ic:"💊", l:"Medicamentos",  fn: () => sh("💊 Durante grabación") },
          { ic:"🧪", l:"Resultados",    fn: () => { setCon(true); setShowRes(!showRes); } },
          { ic:"📋", l:"Expediente",    fn: () => setShowExp(true) },
        ].map(x => (
          <button key={x.l} onClick={x.fn}
            style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:2,
              background:"none", border:"none", cursor:"pointer" }}>
            <span style={{ fontSize:18 }}>{x.ic}</span>
            <span style={{ fontSize:9, fontWeight:500,
              color:C.dgray, fontFamily:"Sora,sans-serif" }}>{x.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
