import { useState } from "react";
import { C, ICD_CODES, VITALES, MEDICO, EMEDS, hoy, aho, genId } from "../data/constants";
import { Bb, AIResumen } from "./Atoms";

// Sección editable con textarea auto-creciente
function Sec({ id, title, icon, color, defaultText, openId, setOpenId, alwaysOpen }) {
  const [editing, setEditing] = useState(false);
  const isOpen = alwaysOpen || openId === id;

  return (
    <div style={{ background:C.white, borderRadius:12,
      border:"1px solid "+C.border, borderLeft:"4px solid "+color,
      marginBottom:8, overflow:"hidden" }}>
      <div onClick={() => !alwaysOpen && setOpenId(isOpen ? null : id)}
        style={{ padding:"11px 13px", display:"flex",
          alignItems:"center", gap:8,
          cursor: alwaysOpen ? "default" : "pointer" }}>
        <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, fontWeight:800, color,
            textTransform:"uppercase", letterSpacing:0.7 }}>{title}</div>
          {!isOpen && (
            <div style={{ fontSize:11, color:C.dgray, marginTop:2,
              overflow:"hidden", display:"-webkit-box",
              WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
              {defaultText.split("\n")[0]}…
            </div>
          )}
        </div>
        {!alwaysOpen && (
          <span style={{ fontSize:10, color:C.mgray, flexShrink:0,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition:"0.2s" }}>▼</span>
        )}
      </div>

      {isOpen && (
        <div style={{ padding:"0 13px 13px",
          borderTop:"1px solid "+C.border, paddingTop:10 }}>
          {!editing ? (
            <>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.75,
                whiteSpace:"pre-wrap", marginBottom:9,
                minHeight:60 }}>{defaultText}</div>
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={() => {}}
                  style={{ display:"flex", alignItems:"center", gap:4,
                    padding:"5px 11px", borderRadius:18,
                    border:"1px solid "+C.border, background:C.off,
                    cursor:"pointer", fontFamily:"Sora,sans-serif",
                    fontSize:10, fontWeight:600, color:C.dgray }}>
                  🎤 Dictar
                </button>
                <button onClick={() => setEditing(true)}
                  style={{ display:"flex", alignItems:"center", gap:4,
                    padding:"5px 11px", borderRadius:18, border:"none",
                    background:C.lteal, cursor:"pointer",
                    fontFamily:"Sora,sans-serif",
                    fontSize:10, fontWeight:600, color:C.teal }}>
                  ✏️ Editar
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea defaultValue={defaultText}
                style={{ width:"100%", minHeight:220, padding:"10px",
                  borderRadius:9, border:"1.5px solid "+C.teal,
                  fontSize:12, fontFamily:"Sora,sans-serif",
                  color:C.navy, resize:"none", outline:"none",
                  lineHeight:1.75, background:C.off,
                  boxSizing:"border-box", overflow:"hidden" }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}/>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                <button onClick={() => setEditing(false)}
                  style={{ padding:"6px 18px", borderRadius:18, border:"none",
                    background:C.teal, cursor:"pointer",
                    fontFamily:"Sora,sans-serif",
                    fontSize:11, fontWeight:700, color:C.white }}>
                  Guardar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Pantalla post-firma
function PantallaFirmado({ firmaData, onReset }) {
  return (
    <div style={{ fontFamily:"Sora,sans-serif", minHeight:"100vh",
      background:"linear-gradient(160deg,#E8F8F4,#EEF4FF)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:24 }}>
      <div style={{ width:76, height:76, borderRadius:"50%",
        background:"linear-gradient(135deg,#0B8C80,#0A9E92)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:32, marginBottom:16,
        boxShadow:"0 8px 32px rgba(11,140,128,0.35)" }}>✅</div>
      <div style={{ fontSize:21, fontWeight:800, color:C.navy,
        marginBottom:4, textAlign:"center" }}>Nota clínica firmada</div>
      <div style={{ fontSize:12, color:C.dgray,
        marginBottom:20, textAlign:"center" }}>
        Responsabilidad médica completa
      </div>

      <div style={{ background:C.white, borderRadius:14,
        border:"1px solid "+C.border, padding:"14px 18px",
        width:"100%", maxWidth:390, marginBottom:18 }}>
        {[["Médico",MEDICO.n],["Exequatur",MEDICO.eq],
          ["Fecha/Hora",firmaData.hora],["ID único",firmaData.id]].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:"7px 0",
            borderBottom:"1px solid "+C.border }}>
            <span style={{ fontSize:11, color:C.dgray, fontWeight:600 }}>{k}</span>
            <span style={{ fontSize:11, color:C.green, fontWeight:700,
              fontFamily: k==="ID único" ? "JetBrains Mono,monospace" : "Sora,sans-serif" }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, width:"100%", maxWidth:390, marginBottom:14 }}>
        {[{ic:"💊",l:"Receta"},{ic:"📋",l:"Referido"},{ic:"🆕",l:"Nueva consulta",fn:onReset}].map(b => (
          <button key={b.l} onClick={b.fn}
            style={{ flex:1, padding:"13px 6px", borderRadius:12,
              border:"1.5px solid "+C.border, background:C.white,
              cursor:"pointer", fontFamily:"Sora,sans-serif",
              fontWeight:700, fontSize:10, color:C.navy,
              display:"flex", flexDirection:"column",
              alignItems:"center", gap:5 }}>
            <span style={{ fontSize:20 }}>{b.ic}</span>{b.l}
          </button>
        ))}
      </div>

      <p style={{ fontSize:10, color:C.dgray, textAlign:"center",
        lineHeight:1.6, maxWidth:300 }}>
        La IA propone. El médico decide.<br/>
        Nada entró automático a esta nota.
      </p>
    </div>
  );
}

// Nota completa antes de firma
function NotaCompleta({ ant, meds, res, notas, secs, onFirmar, onClose }) {
  const [reviewed, setReviewed] = useState(false);
  const [firmando, setFirmando] = useState(false);

  function handleFirmar() {
    setFirmando(true);
    setTimeout(() => {
      onFirmar({ hora: hoy()+" · "+aho(), id: genId() });
    }, 1400);
  }

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F1F5F9",
      display:"flex", flexDirection:"column" }}>

      <div style={{ background:C.navy, padding:"12px 16px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:C.white }}>
              Nota clínica completa
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>
              Lea antes de firmar
            </div>
          </div>
          <button onClick={onClose}
            style={{ padding:"4px 12px", borderRadius:18,
              border:"1px solid rgba(255,255,255,0.2)",
              background:"transparent", cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontSize:9,
              color:"rgba(255,255,255,0.55)" }}>← Volver</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 15px", paddingBottom:160 }}>

        {/* Header nota */}
        <div style={{ background:C.navy, borderRadius:12,
          padding:"12px 14px", marginBottom:10 }}>
          <div style={{ fontSize:10, fontWeight:700,
            color:"rgba(255,255,255,0.4)", marginBottom:4 }}>
            NOTA CLÍNICA · {hoy()}
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:C.white, marginBottom:3 }}>
            Carlos Méndez
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>
            58 años · Masculino
          </div>
          {ant.ale && ant.ale.length > 0 && ant.ale.map(a => (
            <span key={a.id} style={{ fontSize:10, fontWeight:700,
              color:"#FCA5A5", background:"rgba(185,28,28,0.25)",
              padding:"2px 8px", borderRadius:8, marginRight:5 }}>
              ⚠️ {a.t}
            </span>
          ))}
        </div>

        {/* Vitales — una línea */}
        <div style={{ background:C.white, borderRadius:11,
          border:"1px solid "+C.border, padding:"10px 13px",
          marginBottom:8, display:"flex", gap:8,
          alignItems:"center", flexWrap:"wrap" }}>
          {VITALES.map((v,i) => (
            <span key={v.l} style={{ fontSize:12, fontWeight:600,
              color: v.hi ? C.red : C.navy }}>
              {v.l} <span style={{ fontFamily:"JetBrains Mono,monospace",
                fontWeight:700 }}>{v.v}</span>
              {i < VITALES.length-1 && (
                <span style={{ color:C.mgray, margin:"0 6px" }}>|</span>
              )}
            </span>
          ))}
        </div>

        {/* SUBJETIVO */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.navy,
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.navy,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            📋 Subjetivo
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0,
            lineHeight:1.8, whiteSpace:"pre-wrap" }}>
{`Carlos Méndez, 58a. HTA · DM2 · ERC 3. Fumador activo.

Motivo: Dolor torácico precordial opresivo con irradiación a brazo izquierdo, inicio esta mañana. Diaforesis y disnea asociadas. Adherencia parcial referida.`}
          </p>
        </div>

        {/* ANTECEDENTES */}
        {Object.values(ant).flat().length > 0 && (
          <div style={{ background:C.white, borderRadius:12,
            border:"1px solid "+C.border, borderLeft:"4px solid #374151",
            padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#374151",
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
              🩺 Antecedentes
            </div>
            {[{k:"enf",l:"Enfermedades"},{k:"cir",l:"Cirugías"},
              {k:"soc",l:"Social"},{k:"fam",l:"Familiar"}].map(({k,l}) => {
              const its = ant[k]||[];
              if (!its.length) return null;
              return (
                <div key={k} style={{ marginBottom:4 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:C.dgray,
                    textTransform:"uppercase" }}>{l}: </span>
                  {its.map((i,idx) => (
                    <span key={i.id} style={{ fontSize:12, color:C.text }}>
                      {i.t}{idx < its.length-1 ? " · " : ""}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ALERGIAS */}
        {ant.ale && ant.ale.length > 0 && (
          <div style={{ background:C.lred, borderRadius:12,
            border:"1px solid #FECACA", padding:"10px 13px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.red,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:5 }}>
              ⚠️ Alergias
            </div>
            {ant.ale.map(a => (
              <div key={a.id} style={{ fontSize:12, fontWeight:700,
                color:C.red }}>• {a.t}</div>
            ))}
          </div>
        )}

        {/* MEDICAMENTOS */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.teal,
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            💊 Medicamentos
          </div>
          {meds.map(m => {
            const ec = EMEDS[m.s]||EMEDS.duda;
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center",
                gap:8, padding:"5px 0", borderBottom:"1px solid "+C.border }}>
                <div style={{ width:6, height:6, borderRadius:"50%",
                  background:ec.dot, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:12, color:C.text }}>{m.n}</span>
                {m.d && <span style={{ fontSize:10, color:C.dgray }}>{m.d}</span>}
              </div>
            );
          })}
        </div>

        {/* OBJETIVO */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid #374151",
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#374151",
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            🔍 Objetivo — Examen físico
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0,
            lineHeight:1.8, whiteSpace:"pre-wrap" }}>
{`General: alerta, orientado, diaforético, sin distress severo.
CV: ritmo regular, sin soplos, sin ingurgitación yugular.
Resp: murmullo vesicular conservado, sin rales.
Extremidades: sin edema, pulsos simétricos 2+.`}
          </p>
        </div>

        {/* EVALUACIÓN */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.teal,
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            ⚕️ Evaluación clínica / Impresión diagnóstica
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0,
            lineHeight:1.8, whiteSpace:"pre-wrap" }}>
{`1. Dolor torácico a estudio — descartar SCA obligatorio
2. HTA no controlada (PA 158/96)
3. DM2 descompensada (HbA1c 9.2%)
4. ERC estadio 3 estable`}
          </p>
        </div>

        {/* PLAN */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.green,
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.green,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            📋 Plan
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0,
            lineHeight:1.8, whiteSpace:"pre-wrap" }}>
{`Referir a emergencia hoy — no dar de alta sin descartar SCA
ECG 12 derivaciones — inmediato
Troponina I seriada x2 (0h y 3h)
Aspirina 325 mg VO si PA > 100

Seguimiento: control 48-72h si SCA descartado.`}
          </p>
        </div>

        {/* DIAGNÓSTICOS CIE-10 */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.purple,
          padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.purple,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
            📊 Diagnósticos CIE-10
          </div>
          {ICD_CODES.map((dx,i) => (
            <div key={i} style={{ display:"flex",
              justifyContent:"space-between",
              padding:"6px 0",
              borderBottom: i<ICD_CODES.length-1 ? "1px solid "+C.border : "none" }}>
              <span style={{ fontSize:11, color:C.text }}>{dx.d}</span>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11,
                fontWeight:700, color:C.purple, background:C.lpurple,
                padding:"2px 8px", borderRadius:6 }}>{dx.c}</span>
            </div>
          ))}
        </div>

        {res.length > 0 && (
          <div style={{ background:C.white, borderRadius:12,
            border:"1px solid "+C.border, borderLeft:"4px solid "+C.blue,
            padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.blue,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
              🧪 Resultados aportados
            </div>
            {res.map(r => (
              <div key={r.id} style={{ display:"flex", gap:8,
                padding:"5px 0", borderBottom:"1px solid "+C.border }}>
                <span style={{ fontSize:15 }}>{r.icon}</span>
                <span style={{ fontSize:11, flex:1 }}>{r.l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Firma */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"11px 16px 26px",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
        <div onClick={() => setReviewed(!reviewed)}
          style={{ display:"flex", alignItems:"flex-start", gap:10,
            padding:"9px 12px", borderRadius:10,
            background: reviewed ? C.lgreen : C.gray,
            border:"1px solid "+(reviewed ? "#BBF7D0" : C.border),
            cursor:"pointer", marginBottom:9, transition:"all 0.2s" }}>
          <div style={{ width:20, height:20, borderRadius:5,
            flexShrink:0, marginTop:1,
            border:"2px solid "+(reviewed ? C.green : C.mgray),
            background: reviewed ? C.green : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {reviewed && <span style={{ fontSize:11, color:C.white, fontWeight:800 }}>✓</span>}
          </div>
          <p style={{ margin:0, fontSize:11,
            color: reviewed ? C.green : C.dgray, lineHeight:1.5 }}>
            Leí y confirmo la nota clínica completa.
          </p>
        </div>
        <button onClick={handleFirmar} disabled={firmando || !reviewed}
          style={{ width:"100%", padding:"14px", borderRadius:13,
            border:"none",
            cursor: (firmando||!reviewed) ? "default" : "pointer",
            background: (firmando||!reviewed)
              ? "#94A3B8"
              : "linear-gradient(135deg,#0B8C80,#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:14, color:C.white,
            display:"flex", alignItems:"center",
            justifyContent:"center", gap:8, transition:"all 0.3s" }}>
          {firmando
            ? <><div style={{ width:17, height:17, borderRadius:"50%",
                border:"3px solid rgba(255,255,255,0.3)",
                borderTop:"3px solid #fff",
                animation:"SP 0.8s linear infinite" }}/>Firmando…</>
            : "✅ Firmar nota clínica"}
        </button>
        {!reviewed && (
          <p style={{ textAlign:"center", fontSize:9,
            color:C.dgray, margin:"5px 0 0" }}>
            Confirme que leyó la nota para firmar
          </p>
        )}
      </div>
    </div>
  );
}

// MAIN SOAPReview
export default function SOAPReview({
  ant, meds, setMeds, res, setRes,
  notas, setNotas, extraDx, secs,
  onFirmar, onClose, toast
}) {
  const [openId,    setOpenId]    = useState(null);
  const [notaFinal, setNotaFinal] = useState(false);
  const [firmado,   setFirmado]   = useState(false);
  const [firmaData, setFirmaData] = useState(null);

  function handleFirmar(fd) {
    setFirmaData(fd);
    setFirmado(true);
    setNotaFinal(false);
    onFirmar(fd);
  }

  if (firmado && firmaData) return (
    <PantallaFirmado firmaData={firmaData} onReset={onClose}/>
  );

  if (notaFinal) return (
    <NotaCompleta ant={ant} meds={meds} res={res} notas={notas}
      secs={secs} onFirmar={handleFirmar}
      onClose={() => setNotaFinal(false)}/>
  );

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F1F5F9",
      display:"flex", flexDirection:"column" }}>

      <div style={{ background:C.navy, padding:"11px 16px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:C.white }}>
              Revisión SOAP
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>
              Toque para editar · Dictar correcciones
            </div>
          </div>
          <button onClick={onClose}
            style={{ padding:"4px 12px", borderRadius:18,
              border:"1px solid rgba(255,255,255,0.15)",
              background:"transparent", cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontSize:9,
              color:"rgba(255,255,255,0.5)" }}>← Volver</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto",
        padding:"10px 14px", paddingBottom:100 }}>

        {/* Paciente — sin tags de diagnóstico */}
        <div style={{ background:C.navy, borderRadius:12,
          padding:"11px 13px", marginBottom:8 }}>
          <div style={{ fontSize:15, fontWeight:800, color:C.white, marginBottom:2 }}>
            Carlos Méndez
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:6 }}>
            58 años · Masculino · {hoy()}
          </div>
          {ant.ale && ant.ale.map(a => (
            <span key={a.id} style={{ fontSize:10, fontWeight:700,
              color:"#FCA5A5", background:"rgba(185,28,28,0.25)",
              padding:"2px 8px", borderRadius:8, marginRight:5 }}>
              ⚠️ {a.t}
            </span>
          ))}
        </div>

        {/* Vitales — una línea */}
        <div style={{ background:C.white, borderRadius:11,
          border:"1px solid "+C.border, padding:"9px 13px",
          marginBottom:8, display:"flex", gap:6,
          alignItems:"center", flexWrap:"wrap" }}>
          {VITALES.map((v,i) => (
            <span key={v.l} style={{ fontSize:11, fontWeight:600,
              color: v.hi ? C.red : C.navy }}>
              {v.l} <span style={{ fontFamily:"JetBrains Mono,monospace",
                fontWeight:700 }}>{v.v}</span>
              {i < VITALES.length-1 && (
                <span style={{ color:C.mgray, margin:"0 5px" }}>|</span>
              )}
            </span>
          ))}
        </div>

        {/* Secciones SOAP */}
        <Sec id="s" title="Subjetivo" icon="📋" color={C.navy}
          openId={openId} setOpenId={setOpenId}
          defaultText={"Carlos Méndez, 58a. HTA · DM2 · ERC 3. Fumador activo.\n\nDolor torácico precordial opresivo con irradiación a brazo izquierdo, inicio esta mañana. Diaforesis y disnea asociadas. Adherencia parcial."}/>

        <Sec id="o" title="Objetivo — Examen físico" icon="🔍" color="#374151"
          openId={openId} setOpenId={setOpenId}
          defaultText={"General: alerta, orientado, diaforético.\nCV: ritmo regular, sin soplos, sin IY.\nResp: murmullo vesicular conservado.\nExtremidades: sin edema, pulsos simétricos."}/>

        {/* Medicamentos */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.teal,
          marginBottom:8, padding:"11px 13px" }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
            💊 Medicamentos traídos por paciente
          </div>
          {meds.map(m => {
            const ec = EMEDS[m.s]||EMEDS.duda;
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center",
                gap:8, padding:"5px 0", borderBottom:"1px solid "+C.border }}>
                <div style={{ width:6, height:6, borderRadius:"50%",
                  background:ec.dot, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:12, color:C.text }}>{m.n}</span>
                <Bb f={m.f}/>
              </div>
            );
          })}
        </div>

        <Sec id="a" title="Evaluación clínica / Impresión diagnóstica"
          icon="⚕️" color={C.teal}
          openId={openId} setOpenId={setOpenId}
          defaultText={"1. Dolor torácico a estudio — descartar SCA\n2. HTA no controlada (PA 158/96)\n3. DM2 descompensada (HbA1c 9.2%)\n4. ERC estadio 3 estable\n\nDiferenciales: SCA ⚠️ · Disección aórtica ⚠️ · TEP ⚠️"}/>

        <Sec id="p" title="Plan" icon="📋" color={C.green}
          openId={openId} setOpenId={setOpenId}
          defaultText={"Referir a emergencia hoy\nECG 12 derivaciones — inmediato\nTroponina I seriada x2\nAspirina 325 mg VO si PA > 100\n\nControl en 48-72h si SCA descartado"}/>

        {/* CIE-10 */}
        <div style={{ background:C.white, borderRadius:12,
          border:"1px solid "+C.border, borderLeft:"4px solid "+C.purple,
          marginBottom:8, padding:"11px 13px" }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.purple,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
            📊 Diagnósticos CIE-10
          </div>
          {ICD_CODES.map((dx,i) => (
            <div key={i} style={{ display:"flex",
              justifyContent:"space-between", padding:"5px 0",
              borderBottom: i<ICD_CODES.length-1 ? "1px solid "+C.border : "none" }}>
              <span style={{ fontSize:11, color:C.text }}>{dx.d}</span>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11,
                fontWeight:700, color:C.purple, background:C.lpurple,
                padding:"2px 8px", borderRadius:6 }}>{dx.c}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize:10, color:C.dgray, textAlign:"center",
          margin:"4px 0 8px", fontStyle:"italic" }}>
          La IA propone. El médico decide. Nada entra automático.
        </p>
      </div>

      {/* Ver nota completa */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"10px 16px 22px",
        display:"flex", alignItems:"center",
        justifyContent:"space-between",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.07)" }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>
            SOAP revisado
          </div>
          <div style={{ fontSize:9, color:C.dgray }}>
            Ver nota completa antes de firmar
          </div>
        </div>
        <button onClick={() => setNotaFinal(true)}
          style={{ padding:"10px 18px", borderRadius:12,
            border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:13, color:C.white,
            boxShadow:"0 4px 14px rgba(11,140,128,0.3)" }}>
          Ver nota completa →
        </button>
      </div>
    </div>
  );
}
