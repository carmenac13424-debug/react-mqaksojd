import { useState, useEffect, useRef } from "react";
import { C, GCSS, fmt, hoy, INITIAL_ANT, INITIAL_MEDS } from "./data/constants";
import { Toast, useAutoSave } from "./components/Atoms";
import MedicalHistory from "./components/MedicalHistory";
import RecordingScreen from "./components/RecordingScreen";
import SOAPReview from "./components/SOAPReview";
import ResultsUpload from "./components/ResultsUpload";
import Expediente from "./components/Expediente";
import { registrarVisita, addResultado } from "./data/expediente";

// Autocompletar clínico RD
const AC_RAPIDO = {
  met:["Metformina 850 mg BID","Metformina 500 mg QD","Metoprolol 25 mg QD"],
  hta:["Hipertensión arterial","HTA descontrolada","HTA crónica controlada"],
  los:["Losartán 50 mg QD","Losartán 100 mg QD"],
  aml:["Amlodipina 5 mg QD","Amlodipina 10 mg QD"],
  dm:["Diabetes mellitus tipo 2","DM2 descontrolada","DM2 en control"],
  cole:["Colecistectomía","Colelitiasis","Colecistitis"],
  ato:["Atorvastatina 20 mg nocturna","Atorvastatina 40 mg nocturna"],
  lev:["Levotiroxina 50 mcg QAM","Levotiroxina 100 mcg QAM"],
  ome:["Omeprazol 20 mg QD","Omeprazol 40 mg QD"],
  jan:["Januvia 100 mg QD","Januvia 50 mg QD"],
  asp:["Aspirina 81 mg QD","Aspirina 325 mg"],
  erc:["ERC estadio 3","ERC estadio 4","ERC crónica"],
};

function getSugerencias(txt) {
  if (!txt || txt.length < 2) return [];
  const lo = txt.toLowerCase();
  const key = Object.keys(AC_RAPIDO).find(k => lo.startsWith(k) || lo.includes(k));
  return key ? AC_RAPIDO[key] : [];
}

export default function App() {
  const [scr,    setScr]    = useState("inicio");
  const [secs,   setSecs]   = useState(0);
  const [tipo,   setTipo]   = useState("Consulta de seguimiento");
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

  const sh = m => { setTmsg(m); setTimeout(() => setTmsg(null), 2600); };
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

  // ── overlays ────────────────────────────────────────────────────────────────
  if (showExp) return (
    <><style>{GCSS}</style><Expediente onClose={() => setShowExp(false)}/></>
  );

  const HistoriaModal = showH ? (
    <MedicalHistory data={ant} onChange={setAnt} toast={sh} onClose={() => setShowH(false)}/>
  ) : null;

  // ── grabando ────────────────────────────────────────────────────────────────
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
      />
      {HistoriaModal}
    </>
  );

  // ── soap ────────────────────────────────────────────────────────────────────
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
  // Hora actual formateada
  const ahora = new Date().toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"});

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F0F4F8",
      display:"flex", flexDirection:"column" }}>
      <style>{GCSS}</style>
      {HistoriaModal}
      <Toast m={tmsg}/>

      {/* ── HEADER ── */}
      <div style={{ background:C.navy, padding:"13px 18px 11px" }}>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:3 }}>
          <span style={{ fontWeight:800, fontSize:20, color:C.white,
            letterSpacing:-0.3 }}>
            MedScribe <span style={{ color:C.teal }}>RD</span>
          </span>
          {offline && (
            <span style={{ fontSize:9, fontWeight:700, color:C.amber,
              background:C.lamber, border:"1px solid #FDE68A",
              padding:"2px 7px", borderRadius:7 }}>📵 Offline</span>
          )}
        </div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>
          Consulta: {hoy()} · {ahora} · 🔒 Audio no almacenado
        </div>
      </div>

      <div style={{ flex:1, padding:"13px 16px",
        display:"flex", flexDirection:"column", gap:10, overflowY:"auto",
        paddingBottom:80 }}>

        {/* ── PACIENTE ── */}
        <div style={{ background:C.white, borderRadius:14,
          border:"1px solid "+C.border,
          padding:"14px 16px",
          boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:18, fontWeight:800, color:C.navy,
            marginBottom:5 }}>Carlos Méndez</div>
          <div style={{ fontSize:11, color:C.dgray, lineHeight:1.7 }}>
            Fecha de nacimiento: 12/03/1967<br/>
            58 años · Masculino
          </div>
        </div>

        {/* ── TIPO DE CONSULTA ── */}
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:C.dgray,
            textTransform:"uppercase", letterSpacing:0.8,
            margin:"0 0 7px" }}>Tipo de consulta</p>
          <div style={{ display:"flex", gap:8 }}>
            {["Consulta de seguimiento","Primera consulta"].map(t => (
              <button key={t} onClick={() => setTipo(t)}
                style={{ flex:1, padding:"11px 8px", borderRadius:11,
                  border: tipo===t ? "none" : "1px solid "+C.border,
                  cursor:"pointer",
                  background: tipo===t ? C.navy : C.white,
                  color: tipo===t ? C.white : C.text,
                  fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:12, transition:"all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── BOTÓN INICIAR ── */}
        <button
          onClick={() => {
            if (!con) { sh("⚠️ Marque el consentimiento primero"); return; }
            setScr("grabando");
          }}
          style={{ width:"100%", padding:"17px 20px",
            background: con
              ? "linear-gradient(135deg,#0B2545 0%,#1464A0 100%)"
              : "#E2E8F0",
            border:"none", borderRadius:15, cursor:"pointer",
            display:"flex", alignItems:"center", gap:14,
            transition:"all 0.25s",
            boxShadow: con ? "0 6px 28px rgba(11,37,69,0.30)" : "none" }}>
          <div style={{ width:46, height:46, borderRadius:"50%",
            background: con ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
            display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:22, flexShrink:0 }}>🎤</div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontWeight:800, fontSize:17,
              color: con ? C.white : "#94A3B8",
              marginBottom:2 }}>Iniciar consulta</div>
            <div style={{ fontSize:10,
              color: con ? "rgba(255,255,255,0.5)" : "#94A3B8" }}>
              {con ? tipo+" · La IA documenta en segundo plano"
                : "Disponible después del consentimiento"}
            </div>
          </div>
        </button>

        {/* ── CONSENTIMIENTO ── */}
        <div onClick={() => setCon(!con)}
          style={{ background: con ? C.lgreen : C.white,
            border:"1.5px solid "+(con ? C.green : "#CBD5E1"),
            borderRadius:12, padding:"13px 14px", cursor:"pointer",
            display:"flex", alignItems:"flex-start", gap:11,
            transition:"all 0.2s",
            boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ width:22, height:22, borderRadius:6,
            flexShrink:0, marginTop:1,
            border:"2px solid "+(con ? C.green : "#94A3B8"),
            background: con ? C.green : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.2s" }}>
            {con && <span style={{ fontSize:13, color:C.white,
              fontWeight:800, lineHeight:1 }}>✓</span>}
          </div>
          <div>
            <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:600,
              color: con ? C.green : C.text }}>
              Consentimiento verbal confirmado
            </p>
            <p style={{ margin:0, fontSize:10,
              color: con ? "#16A34A" : C.dgray }}>
              El paciente autorizó asistencia de IA en esta consulta
            </p>
          </div>
        </div>

        {/* ── PREPARAR (solo visible con consentimiento) ── */}
        {con && (
          <div style={{ background:C.white, borderRadius:13,
            border:"1px solid "+C.border, padding:"13px 14px",
            animation:"FU 0.3s ease",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.dgray,
              textTransform:"uppercase", letterSpacing:0.8,
              margin:"0 0 10px" }}>
              Datos clínicos del paciente
            </p>
            <div style={{ display:"flex", gap:7 }}>

              {/* Historia */}
              <button onClick={() => setShowH(true)}
                style={{ flex:1, padding:"11px 6px", borderRadius:11,
                  border:"1.5px solid "+C.teal, background:C.lteal,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3,
                  transition:"all 0.15s" }}>
                <span style={{ fontSize:19 }}>🩺</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:700,
                  fontSize:10, color:C.teal }}>Historia</span>
                <span style={{ fontSize:8, color:C.teal,
                  lineHeight:1.4, textAlign:"center" }}>
                  Médica · Quirúrgica<br/>Social · Familiar
                </span>
                <span style={{ fontSize:9, color:C.teal, fontWeight:700 }}>
                  {Object.values(ant).flat().length} registros
                </span>
              </button>

              {/* Medicamentos */}
              <button onClick={() => sh("💊 Medicamentos activos: "+meds.length)}
                style={{ flex:1, padding:"11px 6px", borderRadius:11,
                  border:"1px solid "+C.border, background:C.white,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ fontSize:19 }}>💊</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:10, color:C.navy }}>Medicamentos</span>
                <span style={{ fontSize:8, color:C.dgray,
                  lineHeight:1.4, textAlign:"center" }}>
                  Activos<br/>Cambios
                </span>
                <span style={{ fontSize:9, color:C.teal, fontWeight:700 }}>
                  {meds.length} activos
                </span>
              </button>

              {/* Resultados */}
              <button onClick={() => setShowRes(!showRes)}
                style={{ flex:1, padding:"11px 6px", borderRadius:11,
                  border:"1px solid "+(showRes ? C.teal : C.border),
                  background: showRes ? C.lteal : C.white,
                  cursor:"pointer", display:"flex",
                  flexDirection:"column", alignItems:"center", gap:3 }}>
                <span style={{ fontSize:19 }}>🧪</span>
                <span style={{ fontFamily:"Sora,sans-serif", fontWeight:600,
                  fontSize:10, color: showRes ? C.teal : C.navy }}>
                  Resultados
                </span>
                <span style={{ fontSize:8, color:C.dgray,
                  lineHeight:1.4, textAlign:"center" }}>
                  Labs · Imágenes<br/>PDF · Foto
                </span>
                <span style={{ fontSize:9,
                  color: res.length ? C.teal : C.mgray, fontWeight:700 }}>
                  {res.length > 0 ? res.length+" cargados" : "Añadir"}
                </span>
              </button>
            </div>

            {showRes && (
              <div style={{ borderTop:"1px solid "+C.border,
                paddingTop:10, marginTop:10 }}>
                <ResultsUpload items={res} onChange={setRes} toast={sh}/>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── NAV INFERIOR ── */}
      <div style={{ background:C.white, borderTop:"1px solid "+C.border,
        display:"flex", padding:"8px 0 17px",
        position:"fixed", bottom:0, left:"50%",
        transform:"translateX(-50%)", width:"100%", maxWidth:390,
        boxShadow:"0 -2px 14px rgba(0,0,0,0.06)" }}>
        {[
          { ic:"🩺", l:"Historia",     fn: () => setShowH(true)               },
          { ic:"💊", l:"Medicamentos", fn: () => sh("💊 "+meds.length+" activos") },
          { ic:"🧪", l:"Resultados",   fn: () => { setCon(true); setShowRes(!showRes); } },
          { ic:"📋", l:"Expediente",   fn: () => setShowExp(true)              },
        ].map(x => (
          <button key={x.l} onClick={x.fn}
            style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", gap:2,
              background:"none", border:"none", cursor:"pointer",
              padding:"3px 0" }}>
            <span style={{ fontSize:19 }}>{x.ic}</span>
            <span style={{ fontSize:9, fontWeight:500,
              color:C.dgray, fontFamily:"Sora,sans-serif" }}>{x.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
