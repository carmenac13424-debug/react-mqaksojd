import { useState } from "react";
import { C, ICD_CODES, VITALES, MEDICO, EMEDS, hoy, aho, genId } from "../data/constants";
import { Bb, AIResumen } from "./Atoms";

// ── Sección editable ──────────────────────────────────────────────────────────
function Sec({ id, title, icon, color, defaultText, openId, setOpenId, alwaysOpen }) {
  const isOpen = alwaysOpen || openId === id;
  return (
    <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
      borderLeft:"4px solid "+color, marginBottom:7, overflow:"hidden" }}>
      <div onClick={() => !alwaysOpen && setOpenId(isOpen ? null : id)}
        style={{ padding:"11px 13px", display:"flex", alignItems:"center",
          gap:8, cursor:alwaysOpen?"default":"pointer" }}>
        <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, fontWeight:800, color,
            textTransform:"uppercase", letterSpacing:0.7 }}>{title}</div>
          {!isOpen && (
            <div style={{ fontSize:11, color:C.dgray, marginTop:2, overflow:"hidden",
              display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
              {defaultText.split("\n")[0]}…
            </div>
          )}
        </div>
        {!alwaysOpen && (
          <span style={{ fontSize:10, color:C.mgray, flexShrink:0,
            transform:isOpen?"rotate(180deg)":"none", transition:"0.2s" }}>▼</span>
        )}
      </div>
      {isOpen && (
        <div style={{ padding:"0 13px 13px", borderTop:"1px solid "+C.border,
          paddingTop:10, animation:"FU 0.15s ease" }}>
          <div style={{ display:"flex", gap:6, marginBottom:7 }}>
            <button style={{ display:"flex", alignItems:"center", gap:4,
              padding:"5px 11px", borderRadius:18, border:"1px solid "+C.border,
              background:C.off, cursor:"pointer", fontFamily:"Sora,sans-serif",
              fontSize:10, fontWeight:600, color:C.dgray }}>🎤 Dictar</button>
            <button style={{ display:"flex", alignItems:"center", gap:4,
              padding:"5px 11px", borderRadius:18, border:"none",
              background:C.lteal, cursor:"pointer", fontFamily:"Sora,sans-serif",
              fontSize:10, fontWeight:600, color:C.teal }}>✏️ Editar</button>
          </div>
          <textarea defaultValue={defaultText}
            style={{ width:"100%", minHeight:80, padding:"9px", borderRadius:9,
              border:"1.5px solid "+C.teal, fontSize:12,
              fontFamily:"Sora,sans-serif", color:C.navy,
              resize:"vertical", outline:"none", lineHeight:1.65,
              background:C.off, boxSizing:"border-box" }}/>
          {!alwaysOpen && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
              <button onClick={() => setOpenId(null)}
                style={{ padding:"5px 14px", borderRadius:18, border:"none",
                  background:C.lgreen, cursor:"pointer",
                  fontFamily:"Sora,sans-serif", fontSize:10,
                  fontWeight:700, color:C.green }}>✓ Guardar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Nota clínica completa — lo que el médico firma ───────────────────────────
function NotaCompleta({ ant, meds, res, notas, secs, onFirmar, onClose }) {
  const [reviewed, setReviewed] = useState(false);
  const [firmando, setFirmando] = useState(false);

  function handleFirmar() {
    setFirmando(true);
    setTimeout(() => {
      const fd = { hora:hoy()+" · "+aho(), id:genId() };
      setFirmando(false);
      onFirmar(fd);
    }, 1400);
  }

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F1F5F9", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:C.navy, padding:"12px 16px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:C.white }}>
              Nota clínica completa
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>
              Lea la nota completa antes de firmar
            </div>
          </div>
          <button onClick={onClose}
            style={{ padding:"5px 12px", borderRadius:18,
              border:"1px solid rgba(255,255,255,0.2)",
              background:"transparent", cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontSize:9,
              color:"rgba(255,255,255,0.55)" }}>← Volver</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", paddingBottom:160 }}>

        {/* Encabezado médico */}
        <div style={{ background:C.navy, borderRadius:13, padding:"14px 16px",
          marginBottom:10, border:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)",
            textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>
            Nota clínica — {hoy()}
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:C.white, marginBottom:2 }}>
            {MEDICO.n}
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>
              Exequatur: <span style={{ color:C.teal, fontWeight:700 }}>{MEDICO.eq}</span>
            </span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>
              Duración: <span style={{ color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
                {String(Math.floor(secs/60)).padStart(2,"0")}:{String(secs%60).padStart(2,"0")}
              </span>
            </span>
          </div>
        </div>

        {/* Paciente */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          padding:"12px 14px", marginBottom:8,
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.dgray,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>Paciente</div>
          <div style={{ fontSize:15, fontWeight:800, color:C.navy, marginBottom:2 }}>
            Carlos Méndez
          </div>
          <div style={{ fontSize:11, color:C.dgray, marginBottom:6 }}>
            58 años · Masculino · {hoy()}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {["HTA","DM2","ERC 3"].map(d => (
              <span key={d} style={{ fontSize:10, color:C.red, background:C.lred,
                padding:"2px 8px", borderRadius:8, fontWeight:700 }}>{d}</span>
            ))}
            <span style={{ fontSize:10, color:C.red, background:C.lred,
              padding:"2px 8px", borderRadius:8, fontWeight:700 }}>
              ⚠️ Alergia: Penicilina
            </span>
          </div>
        </div>

        {/* Vitales */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid #374151", padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#374151",
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
            📊 Signos vitales
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {VITALES.map(v => (
              <div key={v.l} style={{ padding:"8px 10px", borderRadius:9, textAlign:"center",
                border:"1px solid "+(v.hi?"#FECACA":C.border),
                background:v.hi?C.lred:"#fff" }}>
                <div style={{ fontSize:8, fontWeight:700, color:v.hi?C.red:C.dgray,
                  textTransform:"uppercase", marginBottom:2 }}>{v.l}</div>
                <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:15,
                  fontWeight:700, color:v.hi?C.red:C.navy }}>
                  {v.v}<span style={{ fontSize:9, color:C.dgray, marginLeft:2 }}>{v.u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SUBJETIVO ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.navy, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.navy,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>
            📋 Subjetivo — Historia de la enfermedad actual
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.8,
            whiteSpace:"pre-wrap" }}>
{`Carlos Méndez, 58a, HTA · DM2 · ERC 3. Fumador activo 1 paq/día × 20 años. Antecedente familiar IAM paterno a los 50 años.

Motivo de consulta: Dolor torácico precordial de tipo opresivo con irradiación a brazo izquierdo, inicio esta mañana. Diaforesis y disnea asociadas. Adherencia parcial referida por paciente.`}
          </p>
        </div>

        {/* ── OBJETIVO ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid #374151", padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#374151",
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>
            🔍 Objetivo — Examen físico
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.8,
            whiteSpace:"pre-wrap" }}>
{`General: alerta, orientado, diaforético, sin distress severo.
CV: ritmo regular, sin soplos audibles, sin ingurgitación yugular.
Resp: murmullo vesicular conservado, sin rales.
Abdomen: blando, no doloroso.
Extremidades: sin edema, pulsos simétricos 2+.`}
          </p>
        </div>

        {/* ── EVALUACIÓN ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.teal, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>
            ⚕️ Evaluación clínica / Impresión diagnóstica
          </div>
          <div style={{ background:C.lred, border:"1px solid #FECACA",
            borderRadius:8, padding:"8px 10px", marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:800, color:C.red }}>
              🚨 Requiere evaluación urgente — descartar SCA
            </div>
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.8,
            whiteSpace:"pre-wrap" }}>
{`1. Dolor torácico a estudio — descartar SCA obligatorio
2. HTA no controlada (PA 158/96)
3. DM2 descompensada (HbA1c 9.2%)
4. ERC estadio 3 estable

Diagnósticos diferenciales:
• Síndrome coronario agudo ⚠️
• Disección aórtica ⚠️
• TEP / Embolia pulmonar ⚠️
• Pericarditis aguda
• Costocondritis`}
          </p>
        </div>

        {/* ── PLAN ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.green, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.green,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:6 }}>
            📋 Plan
          </div>
          <p style={{ fontSize:12, color:C.text, margin:0, lineHeight:1.8,
            whiteSpace:"pre-wrap" }}>
{`URGENTE — Referir a emergencia hoy
• No dar de alta sin descartar SCA
• ECG 12 derivaciones — inmediato
• Troponina I seriada x2 (0h y 3h)
• Aspirina 325 mg VO si PA > 100 sistólica
• Nitroglicerina SL PRN

Seguimiento:
• Control en 48-72h si SCA descartado
• Regresar si: dolor recurre, disnea súbita o síncope`}
          </p>
        </div>

        {/* ── Diagnósticos CIE-10 ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.purple, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.purple,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
            📊 Diagnósticos CIE-10
          </div>
          {ICD_CODES.map((dx,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", padding:"7px 0",
              borderBottom:i<ICD_CODES.length-1?"1px solid "+C.border:"none" }}>
              <span style={{ fontSize:12, color:C.text, flex:1, paddingRight:8 }}>{dx.d}</span>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11,
                fontWeight:700, color:C.purple, background:C.lpurple,
                padding:"2px 9px", borderRadius:7 }}>{dx.c}</span>
            </div>
          ))}
        </div>

        {/* ── Medicamentos ── */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.teal, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:2 }}>
            💊 Medicamentos traídos por paciente
          </div>
          <div style={{ fontSize:9, color:C.dgray, marginBottom:8 }}>
            Fuente verificada · Los cambios están en el Plan
          </div>
          {meds.map(m => {
            const ec = EMEDS[m.s] || EMEDS.duda;
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8,
                padding:"7px 0", borderBottom:"1px solid "+C.border }}>
                <div style={{ width:7, height:7, borderRadius:"50%",
                  background:ec.dot, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:12, color:C.text }}>
                  {m.n}{m.d && <span style={{ color:C.dgray }}> · {m.d}</span>}
                </span>
                <span style={{ fontSize:8, fontWeight:700, color:ec.dot }}>{ec.label}</span>
                <Bb f={m.f}/>
              </div>
            );
          })}
        </div>

        {/* ── Alergias ── */}
        {ant.ale && ant.ale.length > 0 && (
          <div style={{ background:C.lred, borderRadius:12,
            border:"1px solid #FECACA", padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.red,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
              ⚠️ Alergias conocidas
            </div>
            {ant.ale.map(a => (
              <div key={a.id} style={{ fontSize:12, fontWeight:700,
                color:C.red, padding:"3px 0" }}>
                • {a.t}
              </div>
            ))}
          </div>
        )}

        {/* ── Antecedentes ── */}
        {Object.values(ant).flat().filter(i => !ant.ale?.includes(i)).length > 0 && (
          <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
            borderLeft:"4px solid #374151", padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#374151",
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
              🩺 Antecedentes
            </div>
            {[{k:"enf",l:"Enfermedades"},{k:"cir",l:"Cirugías"},
              {k:"soc",l:"Historia social"},{k:"fam",l:"Familiar"}].map(({k,l}) => {
              const its = ant[k] || [];
              if (!its.length) return null;
              return (
                <div key={k} style={{ marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:C.dgray,
                    textTransform:"uppercase", letterSpacing:0.5 }}>{l}: </span>
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

        {/* ── Resultados aportados ── */}
        {res.length > 0 && (
          <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
            borderLeft:"4px solid "+C.purple, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.purple,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
              🧪 Resultados aportados por paciente
            </div>
            {res.map(r => (
              <div key={r.id} style={{ display:"flex", gap:8, padding:"5px 0",
                borderBottom:"1px solid "+C.border, alignItems:"center" }}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <span style={{ fontSize:11, flex:1 }}>{r.l}</span>
                <span style={{ fontSize:9, fontWeight:700,
                  color:r.ok?C.green:C.amber }}>{r.ok?"✅ Revisado":"⏳ Pendiente"}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Notas privadas aprobadas ── */}
        {notas.filter(n=>n.ok).length > 0 && (
          <div style={{ background:C.lpurple, borderRadius:12,
            border:"1px solid #DDD6FE", padding:"12px 14px", marginBottom:8 }}>
            <div style={{ fontSize:10, fontWeight:800, color:C.purple,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
              📝 Observaciones clínicas
            </div>
            {notas.filter(n=>n.ok).map(n => (
              <div key={n.id} style={{ fontSize:11, color:C.purple,
                padding:"3px 0", lineHeight:1.5 }}>• {n.t}</div>
            ))}
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div style={{ background:C.lamber, border:"1px solid #FDE68A",
          borderRadius:11, padding:"10px 13px", marginBottom:6 }}>
          <p style={{ fontSize:10, color:"#92400E", margin:0, lineHeight:1.6 }}>
            <strong>La IA propone. El médico decide.</strong>{" "}
            Borrador generado con asistencia de IA. El médico revisa,
            edita y firma. Nada entró automático.
          </p>
        </div>
      </div>

      {/* ── Firma ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"12px 16px 28px",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>

        {/* Checkbox */}
        <div onClick={() => setReviewed(!reviewed)}
          style={{ display:"flex", alignItems:"flex-start", gap:10,
            padding:"10px 12px", borderRadius:10,
            background:reviewed?C.lgreen:C.gray,
            border:"1px solid "+(reviewed?"#BBF7D0":C.border),
            cursor:"pointer", marginBottom:10, transition:"all 0.2s" }}>
          <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
            border:"2px solid "+(reviewed?C.green:C.mgray),
            background:reviewed?C.green:"transparent",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {reviewed && <span style={{ fontSize:12, color:C.white, fontWeight:800 }}>✓</span>}
          </div>
          <p style={{ margin:0, fontSize:11,
            color:reviewed?C.green:C.dgray, lineHeight:1.5 }}>
            Leí y confirmo la nota clínica completa. Asumo responsabilidad
            médica por su contenido.
          </p>
        </div>

        <button onClick={handleFirmar} disabled={firmando || !reviewed}
          style={{ width:"100%", padding:"15px", borderRadius:13, border:"none",
            cursor:(firmando||!reviewed)?"default":"pointer",
            background:(firmando||!reviewed)
              ?"#94A3B8"
              :"linear-gradient(135deg,#0B8C80,#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:14, color:C.white,
            boxShadow:(firmando||!reviewed)?"none":"0 5px 20px rgba(11,140,128,0.38)",
            display:"flex", alignItems:"center",
            justifyContent:"center", gap:8, transition:"all 0.3s" }}>
          {firmando
            ? <><div style={{ width:18, height:18, borderRadius:"50%",
                border:"3px solid rgba(255,255,255,0.35)",
                borderTop:"3px solid #fff",
                animation:"SP 0.8s linear infinite" }}/>Firmando nota clínica…</>
            : "✅ Firmar nota clínica"}
        </button>

        {!reviewed && (
          <p style={{ textAlign:"center", fontSize:9, color:C.dgray, margin:"6px 0 0" }}>
            Confirme que leyó la nota para habilitar la firma
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pantalla post-firma ────────────────────────────────────────────────────────
function PantallaFirmado({ firmaData, onReset }) {
  return (
    <div style={{ fontFamily:"Sora,sans-serif", minHeight:"100vh",
      background:"linear-gradient(160deg,#E8F8F4,#EEF4FF)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:24, animation:"POP 0.4s ease" }}>

      {/* Check */}
      <div style={{ width:80, height:80, borderRadius:"50%",
        background:"linear-gradient(135deg,#0B8C80,#0A9E92)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:34, marginBottom:18,
        boxShadow:"0 8px 32px rgba(11,140,128,0.35)" }}>✅</div>

      <div style={{ fontSize:22, fontWeight:800, color:C.navy,
        marginBottom:4, textAlign:"center" }}>Nota clínica firmada</div>
      <div style={{ fontSize:13, color:C.dgray,
        marginBottom:22, textAlign:"center" }}>
        Responsabilidad médica completa
      </div>

      {/* Datos firma */}
      <div style={{ background:C.white, borderRadius:14, border:"1px solid "+C.border,
        padding:"14px 18px", width:"100%", maxWidth:390, marginBottom:18 }}>
        {[["Médico",MEDICO.n],
          ["Exequatur",MEDICO.eq],
          ["Fecha/Hora",firmaData.hora],
          ["ID único",firmaData.id]].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:"8px 0",
            borderBottom:"1px solid "+C.border }}>
            <span style={{ fontSize:11, color:C.dgray, fontWeight:600 }}>{k}</span>
            <span style={{ fontSize:11, color:C.green, fontWeight:700,
              fontFamily:k==="ID único"?"JetBrains Mono,monospace":"Sora,sans-serif" }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Solo 3 acciones RD */}
      <div style={{ display:"flex", gap:8, width:"100%", maxWidth:390, marginBottom:14 }}>
        <button style={{ flex:1, padding:"14px 8px", borderRadius:12,
          border:"1.5px solid "+C.border, background:C.white, cursor:"pointer",
          fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:11, color:C.navy,
          display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:22 }}>💊</span>Receta
        </button>
        <button style={{ flex:1, padding:"14px 8px", borderRadius:12,
          border:"1.5px solid #BFDBFE", background:C.lblue, cursor:"pointer",
          fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:11, color:C.blue,
          display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:22 }}>📋</span>Referido
        </button>
        <button onClick={onReset} style={{ flex:1, padding:"14px 8px", borderRadius:12,
          border:"1.5px solid "+C.border, background:C.white, cursor:"pointer",
          fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:11, color:C.navy,
          display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:22 }}>🆕</span>Nueva consulta
        </button>
      </div>

      <p style={{ fontSize:10, color:C.dgray, textAlign:"center",
        lineHeight:1.6, maxWidth:300 }}>
        La IA propone. El médico decide.<br/>
        Nada entró automático a esta nota.
      </p>
    </div>
  );
}

// ── MAIN SOAPReview ────────────────────────────────────────────────────────────
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

  if (firmado && firmaData) {
    return (
      <>
        <style>{`@keyframes POP{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}`}</style>
        <PantallaFirmado firmaData={firmaData} onReset={onClose}/>
      </>
    );
  }

  if (notaFinal) {
    return (
      <NotaCompleta
        ant={ant} meds={meds} res={res} notas={notas}
        secs={secs} onFirmar={handleFirmar}
        onClose={() => setNotaFinal(false)}/>
    );
  }

  // ── Revisión SOAP (edición por sección) ──────────────────────────────────────
  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F1F5F9", display:"flex", flexDirection:"column" }}>

      <div style={{ background:C.navy, padding:"12px 16px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:C.white }}>
              Revisión SOAP
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>
              Toque sección para editar · Dictar · Guardar
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

      <div style={{ flex:1, overflowY:"auto", padding:"10px 14px", paddingBottom:100 }}>

        {/* Resumen IA — solo en revisión, no durante grabación */}
        <AIResumen meds={meds}/>

        {/* Paciente */}
        <div style={{ background:C.navy, borderRadius:12, padding:"11px 13px", marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.white }}>Carlos Méndez</div>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12,
              color:C.teal, fontWeight:700 }}>
              {String(Math.floor(secs/60)).padStart(2,"0")}:{String(secs%60).padStart(2,"0")}
            </div>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>
            58a · M · {hoy()}
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {["HTA","DM2","ERC 3"].map(d => (
              <span key={d} style={{ fontSize:9, padding:"2px 7px", borderRadius:7,
                fontWeight:700, color:C.lteal,
                background:"rgba(11,140,128,0.25)" }}>{d}</span>
            ))}
            <span style={{ fontSize:9, padding:"2px 7px", borderRadius:7,
              fontWeight:700, color:"#FEF2F2",
              background:"rgba(185,28,28,0.3)" }}>Penicilina ⚠️</span>
          </div>
        </div>

        {/* Vitales */}
        <div style={{ display:"flex", gap:5, marginBottom:8 }}>
          {VITALES.map(v => (
            <div key={v.l} style={{ flex:1, padding:"7px 8px", borderRadius:9,
              textAlign:"center",
              border:"1px solid "+(v.hi?"#FECACA":C.border),
              background:v.hi?C.lred:"#fff" }}>
              <div style={{ fontSize:8, fontWeight:700,
                color:v.hi?C.red:C.dgray, textTransform:"uppercase",
                letterSpacing:0.5, marginBottom:1 }}>{v.l}</div>
              <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13,
                fontWeight:700, color:v.hi?C.red:C.navy }}>{v.v}</div>
            </div>
          ))}
        </div>

        {/* Secciones editables */}
        <Sec id="s" title="Subjetivo — Historia de la enfermedad actual"
          icon="📋" color={C.navy} openId={openId} setOpenId={setOpenId}
          defaultText={"Carlos Méndez, 58a, HTA · DM2 · ERC 3. Fumador activo.\n\nDolor torácico precordial opresivo con irradiación a brazo izquierdo, inicio esta mañana. Diaforesis y disnea asociadas. Adherencia parcial."}/>

        <Sec id="o" title="Objetivo — Examen físico"
          icon="🔍" color="#374151" openId={openId} setOpenId={setOpenId}
          defaultText={"General: alerta, orientado, diaforético.\nCV: ritmo regular, sin soplos, sin IY.\nResp: murmullo vesicular conservado.\nExtremidades: sin edema, pulsos simétricos."}/>

        {/* Medicamentos — solo lectura, no editable aquí */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.teal, marginBottom:7, padding:"11px 13px" }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:2 }}>
            💊 Medicamentos traídos por paciente
          </div>
          <div style={{ fontSize:9, color:C.dgray, marginBottom:8 }}>
            Los cambios van en el Plan
          </div>
          {meds.map(m => {
            const ec = EMEDS[m.s] || EMEDS.duda;
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center",
                gap:8, padding:"6px 0", borderBottom:"1px solid "+C.border }}>
                <div style={{ width:7, height:7, borderRadius:"50%",
                  background:ec.dot, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:12, color:C.text }}>
                  {m.n}{m.d && <span style={{ color:C.dgray }}> · {m.d}</span>}
                </span>
                <Bb f={m.f}/>
              </div>
            );
          })}
        </div>

        <Sec id="a" title="Evaluación clínica / Impresión diagnóstica"
          icon="⚕️" color={C.teal} openId={openId} setOpenId={setOpenId}
          defaultText={"1. Dolor torácico a estudio — descartar SCA obligatorio\n2. HTA no controlada (PA 158/96)\n3. DM2 descompensada (HbA1c 9.2%)\n4. ERC estadio 3 estable\n\nDiferenciales: SCA ⚠️ · Disección aórtica ⚠️ · TEP ⚠️"}/>

        <Sec id="p" title="Plan"
          icon="📋" color={C.green} openId={openId} setOpenId={setOpenId}
          defaultText={"Referir a emergencia hoy — no dar de alta sin descartar SCA\nECG 12 derivaciones — inmediato\nTroponina I seriada x2 (0h y 3h)\nAspirina 325 mg VO si PA > 100\n\nControl en 48-72h si SCA descartado"}/>

        {/* CIE-10 */}
        <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
          borderLeft:"4px solid "+C.purple, marginBottom:7, padding:"11px 13px" }}>
          <div style={{ fontSize:10, fontWeight:800, color:C.purple,
            textTransform:"uppercase", letterSpacing:0.7, marginBottom:9 }}>
            📊 Diagnósticos CIE-10
          </div>
          {ICD_CODES.map((dx,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between",
              padding:"6px 0",
              borderBottom:i<ICD_CODES.length-1?"1px solid "+C.border:"none" }}>
              <span style={{ fontSize:11, color:C.text }}>{dx.d}</span>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11,
                fontWeight:700, color:C.purple, background:C.lpurple,
                padding:"2px 8px", borderRadius:6 }}>{dx.c}</span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ background:C.lamber, border:"1px solid #FDE68A",
          borderRadius:11, padding:"10px 13px", marginBottom:7 }}>
          <p style={{ fontSize:10, color:"#92400E", margin:0, lineHeight:1.6 }}>
            <strong>La IA propone. El médico decide.</strong>{" "}
            Nada entra automático. Edite lo que necesite antes de ver la nota final.
          </p>
        </div>
      </div>

      {/* Botón hacia nota final */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"11px 16px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>
            SOAP revisado
          </div>
          <div style={{ fontSize:9, color:C.dgray, marginTop:1 }}>
            Ver nota completa antes de firmar
          </div>
        </div>
        <button onClick={() => setNotaFinal(true)}
          style={{ padding:"11px 20px", borderRadius:12, border:"none",
            cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:800,
            fontSize:13, color:C.white,
            boxShadow:"0 4px 14px rgba(11,140,128,0.35)" }}>
          Ver nota completa →
        </button>
      </div>
    </div>
  );
}
