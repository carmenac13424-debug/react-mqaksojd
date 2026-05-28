import { useState } from "react";
import { C, ICD_CODES, VITALES, MEDICO, EMEDS, hoy, aho, genId } from "../data/constants";
import { Bb } from "./Atoms";

// ── Examen físico checklist ────────────────────────────────────────────────────
const EFX = [
  { id:"gen",  l:"General",     items:[{id:"al",l:"Alerta/orientado"},{id:"nd",l:"No distress"},{id:"fat",l:"Fatigado"},{id:"ob",l:"Obeso"},{id:"ile",l:"Ill-appearing"}] },
  { id:"hee",  l:"HEENT/Cuello",items:[{id:"muh",l:"Mucosas húmedas"},{id:"noic",l:"No ictericia"},{id:"sup",l:"Cuello supple"},{id:"noad",l:"No adenopatías"},{id:"noiy",l:"No IY"}] },
  { id:"cv",   l:"CV",          items:[{id:"rrr",l:"RRR sin soplos"},{id:"mur",l:"Soplo"},{id:"tac",l:"Taquicárdico"},{id:"edy",l:"Edema +"}] },
  { id:"pul",  l:"Pulmones",    items:[{id:"cl",l:"CTA bilat."},{id:"wh",l:"Sibilancias"},{id:"ral",l:"Rales"},{id:"air",l:"Entrada aire pobre"}] },
  { id:"abd",  l:"Abdomen",     items:[{id:"snt",l:"Blando NT/ND"},{id:"ten",l:"Doloroso"},{id:"asc",l:"Ascitis"},{id:"hep",l:"Hepatomegalia"}] },
  { id:"ext",  l:"Extremidades",items:[{id:"ned",l:"Sin edema"},{id:"bed",l:"Edema bilateral"},{id:"pls",l:"Pulsos 2+"}] },
  { id:"piel", l:"Piel",        items:[{id:"nol",l:"Sin lesiones"},{id:"ict",l:"Ictérica"},{id:"pal",l:"Pálida"},{id:"dia",l:"Diaforética"}] },
  { id:"neu",  l:"Neurológico", items:[{id:"nfd",l:"Sin focalidad"},{id:"aox",l:"A/Ox3"},{id:"deb",l:"Debilidad focal"},{id:"conf",l:"Confuso"}] },
];

function buildNarrative(sel) {
  const parts = [];
  if (sel.al || sel.nd) parts.push("General: "+(sel.al?"alerta, orientado":"")+(sel.nd?", no distress":""));
  if (sel.rrr) parts.push("CV: RRR, sin soplos");
  if (sel.mur) parts.push("CV: soplo");
  if (sel.edy) parts.push("edema");
  if (sel.cl)  parts.push("Pulmones: claros");
  if (sel.wh)  parts.push("sibilancias");
  if (sel.ral) parts.push("rales");
  if (sel.snt) parts.push("Abdomen: blando, NT/ND");
  if (sel.ned) parts.push("Extremidades: sin edema");
  if (sel.bed) parts.push("edema bilateral");
  if (sel.pls) parts.push("pulsos presentes");
  if (sel.nfd) parts.push("Neurológico: sin focalidad");
  if (sel.deb) parts.push("debilidad focal");
  return parts.join(". ")+".";
}

function EfxChecklist({ onChange }) {
  const NORMAL = { al:true,nd:true,muh:true,noic:true,sup:true,noiy:true,rrr:true,cl:true,snt:true,ned:true,pls:true,nfd:true,aox:true };
  const [sel,  setSel]  = useState(NORMAL);
  const [open, setOpen] = useState(false);

  function toggle(id) {
    const next = { ...sel, [id]: !sel[id] };
    setSel(next);
    onChange(buildNarrative(next));
  }

  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={() => { setSel(NORMAL); onChange(buildNarrative(NORMAL)); }}
          style={{ flex:1, padding:"7px 10px", borderRadius:8, border:"none",
            background:C.lteal, cursor:"pointer", fontFamily:"Sora,sans-serif",
            fontSize:10, fontWeight:600, color:C.teal }}>
          ✓ Normal completo
        </button>
        <button onClick={() => setOpen(!open)}
          style={{ padding:"7px 12px", borderRadius:8, border:"1px solid "+C.border,
            background:C.off, cursor:"pointer", fontFamily:"Sora,sans-serif",
            fontSize:10, color:C.dgray }}>
          {open ? "▲" : "▼ Detalle"}
        </button>
      </div>
      {open && (
        <div style={{ marginTop:7, display:"flex", flexDirection:"column", gap:5 }}>
          {EFX.map(s => (
            <div key={s.id}>
              <div style={{ fontSize:8, fontWeight:700, color:C.mgray,
                textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>{s.l}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {s.items.map(item => (
                  <button key={item.id} onClick={() => toggle(item.id)}
                    style={{ padding:"3px 8px", borderRadius:14,
                      border:"1px solid "+(sel[item.id]?C.teal:C.border),
                      background:sel[item.id]?C.lteal:C.white,
                      cursor:"pointer", fontFamily:"Sora,sans-serif",
                      fontSize:9, color:sel[item.id]?C.teal:C.dgray }}>
                    {item.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sección editable compacta ─────────────────────────────────────────────────
function Sec({ id, title, icon, color, defaultText, openId, setOpenId, aiSugs, aiLabel, isEfx, capturaBadge }) {
  const [editing, setEditing] = useState(false);
  const [txt,     setTxt]     = useState(defaultText);
  const [aiOpen,  setAiOpen]  = useState(false);
  const [aiAdded, setAiAdded] = useState([]);
  const isOpen = openId === id;

  return (
    <div style={{ background:C.white, borderRadius:10,
      border:"1px solid "+C.border, borderLeft:"3px solid "+color,
      marginBottom:8 }}>
      <div onClick={() => !editing && setOpenId(isOpen?null:id)}
        style={{ padding:"9px 12px", display:"flex", alignItems:"center",
          gap:7, cursor:editing?"default":"pointer" }}>
        <span style={{ fontSize:13, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ fontSize:9, fontWeight:700, color,
              textTransform:"uppercase", letterSpacing:0.6 }}>{title}</div>
            {capturaBadge>0&&<span style={{ fontSize:7, fontWeight:700,
              color:C.teal, background:"rgba(11,140,128,0.1)",
              border:"1px solid rgba(11,140,128,0.2)",
              padding:"1px 5px", borderRadius:8 }}>
              IA ✓ {capturaBadge}
            </span>}
          </div>
          {!isOpen && (
            <div style={{ fontSize:11, color:C.dgray, marginTop:1,
              overflow:"hidden", display:"-webkit-box",
              WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
              {txt.split("\n")[0]}
            </div>
          )}
        </div>
        {!editing && <span style={{ fontSize:9, color:C.mgray, flexShrink:0,
          transform:isOpen?"rotate(180deg)":"none", transition:"0.15s" }}>▼</span>}
      </div>

      {isOpen && (
        <div style={{ padding:"0 12px 12px", borderTop:"1px solid "+C.border,
          paddingTop:9 }}>
          {isEfx && <EfxChecklist onChange={val => setTxt(val)}/>}
          {editing ? (
            <>
              <textarea value={txt} onChange={e => setTxt(e.target.value)}
                style={{ width:"100%", minHeight:180, padding:"9px",
                  borderRadius:8, border:"1.5px solid "+C.teal, fontSize:11,
                  fontFamily:"Sora,sans-serif", color:C.navy, outline:"none",
                  lineHeight:1.75, background:C.off, boxSizing:"border-box",
                  resize:"none" }}
                onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.max(180,e.target.scrollHeight)+"px"; }}/>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:7 }}>
                <button onClick={() => setEditing(false)}
                  style={{ padding:"5px 16px", borderRadius:16, border:"none",
                    background:C.teal, cursor:"pointer", fontFamily:"Sora,sans-serif",
                    fontSize:10, fontWeight:700, color:C.white }}>Guardar</button>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize:12, color:C.text, margin:"0 0 9px",
                lineHeight:1.7, whiteSpace:"pre-wrap" }}>{txt}</p>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setEditing(true)}
                  style={{ padding:"4px 10px", borderRadius:16, border:"none",
                    background:C.lteal, cursor:"pointer", fontFamily:"Sora,sans-serif",
                    fontSize:9, fontWeight:600, color:C.teal }}>✏️ Editar</button>
                <button style={{ padding:"4px 10px", borderRadius:16,
                  border:"1px solid "+C.border, background:C.off, cursor:"pointer",
                  fontFamily:"Sora,sans-serif", fontSize:9, color:C.dgray }}>🎤 Dictar</button>
              </div>
            </>
          )}

          {/* Tab IA — discreta */}
          {aiSugs && aiSugs.length > 0 && (
            <div style={{ marginTop:8 }}>
              <button onClick={() => setAiOpen(!aiOpen)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px",
                  borderRadius:18, border:"1px solid rgba(11,140,128,0.25)",
                  background: aiOpen ? "rgba(11,140,128,0.08)" : "rgba(11,140,128,0.05)",
                  cursor:"pointer", fontFamily:"Sora,sans-serif",
                  fontSize:9, fontWeight:600, color:C.teal,
                  boxShadow: aiOpen ? "0 0 0 2px rgba(11,140,128,0.12)" : "none",
                  transition:"all 0.2s" }}>
                ✨ {aiLabel||"Sugerencias IA"} {aiOpen?"▲":"▼"}
              </button>
              {aiOpen && (
                <div style={{ marginTop:7, padding:"10px 11px",
                  background:"linear-gradient(135deg,rgba(11,140,128,0.04),rgba(20,100,160,0.04))",
                  borderRadius:10, border:"1px solid rgba(11,140,128,0.15)" }}>
                  <div style={{ fontSize:8, fontWeight:600, color:C.teal,
                    textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>
                    La IA sugiere · El médico decide:
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {aiSugs.map((s,i) => {
                      const added = aiAdded.includes(s);
                      return (
                        <button key={i} onClick={() => { if(!added){setTxt(t=>t+"\n"+s);setAiAdded(p=>[...p,s]);} }}
                          style={{ padding:"2px 8px", borderRadius:12,
                            border:"1px solid "+(added?"#BBF7D0":"#E2E8F0"),
                            background:added?C.lgreen:C.white, cursor:added?"default":"pointer",
                            fontFamily:"Sora,sans-serif", fontSize:9,
                            color:added?C.green:C.text }}>
                          {added?"✓ ":"+ "}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Nota completa — modo lectura compacta ─────────────────────────────────────
function NotaCompleta({ ant, meds, res, secs, onFirmar, onClose }) {
  const [reviewed, setReviewed] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const hora  = aho();
  const fecha = hoy();

  function handleFirmar() {
    setFirmando(true);
    setTimeout(() => onFirmar({ hora:fecha+" · "+hora, id:genId() }), 1400);
  }

  const row = (label, value, hi) => (
    <div style={{ display:"flex", gap:8, padding:"4px 0",
      borderBottom:"1px solid #F1F5F9", alignItems:"flex-start" }}>
      <span style={{ fontSize:9, fontWeight:600, color:"#94A3B8",
        textTransform:"uppercase", letterSpacing:0.4,
        minWidth:88, paddingTop:2, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, color:hi?C.red:C.text,
        flex:1, lineHeight:1.65, fontWeight:hi?600:400 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F0F4F8", display:"flex", flexDirection:"column" }}>

      <div style={{ background:C.navy, padding:"8px 14px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.white }}>
            Nota clínica completa
            <span style={{ fontSize:8, color:"rgba(255,255,255,0.3)",
              marginLeft:7, fontWeight:400 }}>Lea antes de firmar</span>
          </span>
          <button onClick={onClose}
            style={{ padding:"3px 10px", borderRadius:16,
              border:"1px solid rgba(255,255,255,0.18)",
              background:"transparent", cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontSize:8,
              color:"rgba(255,255,255,0.4)" }}>← Volver</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"8px 13px", paddingBottom:95 }}>

        {/* Consultorio + paciente en una card */}
        <div style={{ background:C.navy, borderRadius:11, padding:"10px 13px", marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", marginBottom:5 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.white }}>{MEDICO.n}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>
                Medicina Interna · {MEDICO.eq}
              </div>
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textAlign:"right" }}>
              {fecha}<br/>{hora}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:6 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.white, marginBottom:2 }}>
              Carlos Méndez
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>
                58a · M · 12/03/1967
              </span>
              {ant.ale && ant.ale.map(a => (
                <span key={a.id} style={{ fontSize:9, fontWeight:700,
                  color:"#FCA5A5", background:"rgba(185,28,28,0.25)",
                  padding:"1px 6px", borderRadius:6 }}>⚠️ {a.t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Vitales — una línea */}
        <div style={{ background:C.white, borderRadius:9, border:"1px solid "+C.border,
          padding:"7px 12px", marginBottom:6,
          fontSize:10, display:"flex", flexWrap:"wrap", gap:3 }}>
          {VITALES.map((v,i) => (
            <span key={v.l}>
              <span style={{ color:C.dgray, fontSize:8 }}>{v.l} </span>
              <span style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:700,
                color:v.hi?C.red:C.navy }}>{v.v}</span>
              {i<VITALES.length-1&&<span style={{ color:"#CBD5E1", margin:"0 5px" }}>|</span>}
            </span>
          ))}
        </div>

        {/* Cuerpo de la nota — tabla compacta */}
        <div style={{ background:C.white, borderRadius:11, border:"1px solid "+C.border,
          padding:"10px 13px", marginBottom:6 }}>
          {row("Motivo", "Dolor torácico precordial con irradiación a brazo izquierdo, diaforesis y disnea desde esta mañana.")}
          {row("HPI", "Pcte masculino 58a, HTA/DM2/ERC3, fumador. Dolor torácico opresivo irradiado a brazo izq, inicio AM. Diaforesis y disnea. Adherencia parcial.")}
          {Object.values(ant).flat().length>0 && row("Antecedentes",
            [...(ant.ale||[]).map(i=>"⚠️"+i.t), ...(ant.enf||[]).map(i=>i.t),
             ...(ant.cir||[]).map(i=>i.t), ...(ant.soc||[]).map(i=>i.t)].join(" · ")
          )}
          {ant.ale&&ant.ale.length>0
            ? row("Alergias", ant.ale.map(a=>a.t).join(", "), true)
            : row("Alergias", "Sin alergias conocidas")}
          {row("Medicamentos", meds.map(m=>m.n+(m.d?" "+m.d:"")).join(" · "))}
          {row("Examen físico", "General: alerta, orientado, diaforético. CV: RRR, sin soplos, sin IY. Pulmones: claros bilat. Abdomen: blando, NT/ND. Extremidades: sin edema. Neuro: sin focalidad.")}
          {row("Impresión", "1. Dolor torácico — probable SCA en evaluación\n2. HTA no controlada (PA 158/96)\n3. DM2 descompensada (HbA1c 9.2%)\n4. ERC estadio 3 estable")}
          {row("Plan", "Referir emergencia hoy. ECG inmediato. Troponina seriada x2. Aspirina 325mg si PA>100. Control 48-72h si SCA descartado.")}
        </div>

        {/* CIE-10 — muy compacto, al final */}
        <div style={{ background:"#F8FAFC", borderRadius:9,
          border:"1px solid #E2E8F0", padding:"7px 12px", marginBottom:6 }}>
          <div style={{ fontSize:7, fontWeight:700, color:"#94A3B8",
            textTransform:"uppercase", letterSpacing:0.6, marginBottom:5 }}>
            CIE-10 (administrativo)
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {ICD_CODES.map((dx,i) => (
              <span key={i} style={{ fontSize:9, color:"#64748B",
                background:"#F1F5F9", border:"1px solid #E2E8F0",
                padding:"2px 7px", borderRadius:6,
                fontFamily:"JetBrains Mono,monospace" }}>
                {dx.c}
              </span>
            ))}
          </div>
        </div>

        {res.length>0 && (
          <div style={{ background:C.white, borderRadius:9, border:"1px solid "+C.border,
            padding:"7px 12px", marginBottom:6 }}>
            <div style={{ fontSize:8, color:C.dgray, marginBottom:4,
              fontWeight:600 }}>Resultados aportados:</div>
            {res.map(r=>(
              <span key={r.id} style={{ fontSize:9, color:C.text,
                marginRight:10 }}>{r.icon} {r.l}</span>
            ))}
          </div>
        )}

        <p style={{ fontSize:8, color:"#94A3B8", textAlign:"center",
          margin:"3px 0 5px" }}>La IA sugiere. El médico decide.</p>
      </div>

      {/* Firma — mínima */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"8px 13px 18px",
        boxShadow:"0 -2px 12px rgba(0,0,0,0.06)" }}>
        <div onClick={() => setReviewed(r=>!r)}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
            borderRadius:8, background:reviewed?"#F0FDF4":"#F8FAFC",
            border:"1px solid "+(reviewed?"#86EFAC":"#E2E8F0"),
            cursor:"pointer", marginBottom:7, transition:"all 0.2s" }}>
          <div style={{ width:17, height:17, borderRadius:4, flexShrink:0,
            border:"2px solid "+(reviewed?C.green:"#94A3B8"),
            background:reviewed?C.green:"transparent",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {reviewed&&<span style={{ fontSize:10, color:C.white, fontWeight:800 }}>✓</span>}
          </div>
          <span style={{ fontSize:11, fontWeight:600,
            color:reviewed?C.green:C.text }}>
            {reviewed?"Nota revisada ✓":"Confirmar revisión"}
          </span>
        </div>
        <button onClick={handleFirmar} disabled={firmando||!reviewed}
          style={{ width:"100%", padding:"11px", borderRadius:10, border:"none",
            cursor:(firmando||!reviewed)?"default":"pointer",
            background:(firmando||!reviewed)?"#94A3B8":"linear-gradient(135deg,#0B8C80,#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:13, color:C.white,
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            transition:"all 0.3s",
            boxShadow:(!firmando&&reviewed)?"0 4px 14px rgba(11,140,128,0.32)":"none" }}>
          {firmando
            ? <><div style={{ width:15,height:15,borderRadius:"50%",
                border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",
                animation:"SP 0.8s linear infinite"}}/>Firmando…</>
            : "✅ Firmar nota clínica"}
        </button>
      </div>
    </div>
  );
}

// ── Post-firma ────────────────────────────────────────────────────────────────
function PantallaFirmado({ firmaData, onReset }) {
  return (
    <div style={{ fontFamily:"Sora,sans-serif", minHeight:"100vh",
      background:"linear-gradient(160deg,#E8F8F4,#EEF4FF)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:70, height:70, borderRadius:"50%",
        background:"linear-gradient(135deg,#0B8C80,#0A9E92)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:28, marginBottom:14,
        boxShadow:"0 6px 24px rgba(11,140,128,0.32)" }}>✅</div>
      <div style={{ fontSize:19, fontWeight:700, color:C.navy,
        marginBottom:3, textAlign:"center" }}>Nota clínica firmada</div>
      <div style={{ fontSize:10, color:C.dgray, marginBottom:18,
        textAlign:"center" }}>Nota clínica finalizada</div>

      <div style={{ background:C.white, borderRadius:12, border:"1px solid "+C.border,
        padding:"11px 16px", width:"100%", maxWidth:380, marginBottom:16 }}>
        {[["Médico",MEDICO.n],["Exequatur",MEDICO.eq],
          ["Fecha/Hora",firmaData.hora],["ID único",firmaData.id]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:"6px 0", borderBottom:"1px solid "+C.border }}>
            <span style={{ fontSize:10, color:C.dgray }}>{k}</span>
            <span style={{ fontSize:10, color:C.green, fontWeight:700,
              fontFamily:k==="ID único"?"JetBrains Mono,monospace":"Sora,sans-serif" }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:7, width:"100%", maxWidth:380, marginBottom:10 }}>
        {[{ic:"💊",l:"Receta"},{ic:"📋",l:"Referido"},{ic:"🖨️",l:"Imprimir"}].map(b=>(
          <button key={b.l}
            style={{ flex:1, padding:"12px 6px", borderRadius:11,
              border:"1px solid "+C.border, background:C.white, cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:10, color:C.navy,
              display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:20 }}>{b.ic}</span>{b.l}
          </button>
        ))}
      </div>
      <button style={{ width:"100%", maxWidth:380, padding:"11px",
        borderRadius:11, border:"none", marginBottom:12,
        background:"#25D366", cursor:"pointer",
        fontFamily:"Sora,sans-serif", fontWeight:700,
        fontSize:12, color:C.white,
        display:"flex", alignItems:"center",
        justifyContent:"center", gap:8 }}>
        <span style={{ fontSize:18 }}>📲</span>
        Enviar por WhatsApp
      </button>

      <button onClick={onReset}
        style={{ background:"transparent", border:"none", cursor:"pointer",
          fontSize:10, color:"#94A3B8", fontFamily:"Sora,sans-serif" }}>
        ← Volver al inicio
      </button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SOAPReview({ ant, meds, setMeds, res, setRes,
  notas, setNotas, extraDx, secs, onFirmar, onClose, toast, capturas }) {
  const [openId,    setOpenId]    = useState(null);
  const [notaFinal, setNotaFinal] = useState(false);
  const [firmado,   setFirmado]   = useState(false);
  const [firmaData, setFirmaData] = useState(null);

  // Capturas IA aceptadas durante grabación
  const capMap = {};
  (capturas||[]).forEach(c => {
    if (!capMap[c.cat]) capMap[c.cat] = [];
    capMap[c.cat].push(c.texto);
  });

  function handleFirmar(fd) { setFirmaData(fd); setFirmado(true); setNotaFinal(false); onFirmar(fd); }

  if (firmado&&firmaData) return <PantallaFirmado firmaData={firmaData} onReset={onClose}/>;
  if (notaFinal) return <NotaCompleta ant={ant} meds={meds} res={res}
    notas={notas} secs={secs} onFirmar={handleFirmar} onClose={()=>setNotaFinal(false)}/>;

  return (
    <div style={{ fontFamily:"Sora,sans-serif", maxWidth:390, margin:"0 auto",
      minHeight:"100vh", background:"#F0F4F8", display:"flex", flexDirection:"column" }}>

      {/* Header compacto */}
      <div style={{ background:C.navy, padding:"8px 14px",
        position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, fontWeight:700, color:C.white }}>
            Revisión de la Nota Clínica
            <span style={{ fontSize:8, color:"rgba(255,255,255,0.3)",
              marginLeft:7, fontWeight:400 }}>Edite · Dicte</span>
          </span>
          <button onClick={onClose}
            style={{ padding:"3px 10px", borderRadius:16,
              border:"1px solid rgba(255,255,255,0.15)",
              background:"transparent", cursor:"pointer",
              fontFamily:"Sora,sans-serif", fontSize:8,
              color:"rgba(255,255,255,0.4)" }}>← Volver</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"9px 12px", paddingBottom:82 }}>

        {/* Paciente + vitales compactos */}
        <div style={{ background:C.navy, borderRadius:10, padding:"9px 12px", marginBottom:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.white }}>Carlos Méndez</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>58a · M · {hoy()}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:2, alignItems:"flex-end" }}>
              {ant.ale&&ant.ale.map(a=>(
                <span key={a.id} style={{ fontSize:8, fontWeight:700,
                  color:"#FCA5A5", background:"rgba(185,28,28,0.25)",
                  padding:"1px 6px", borderRadius:5 }}>⚠️ {a.t}</span>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:5,
            fontSize:9, display:"flex", flexWrap:"wrap", gap:3 }}>
            {VITALES.map((v,i)=>(
              <span key={v.l}>
                <span style={{ color:"rgba(255,255,255,0.35)" }}>{v.l} </span>
                <span style={{ fontFamily:"JetBrains Mono,monospace", fontWeight:700,
                  color:v.hi?"#FCA5A5":"rgba(255,255,255,0.75)" }}>{v.v}</span>
                {i<VITALES.length-1&&<span style={{ color:"rgba(255,255,255,0.15)",margin:"0 4px" }}>|</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Secciones clínicas */}
        {/* Motivo de consulta */}
        <div style={{ background:C.white, borderRadius:10,
          border:"1px solid "+C.border, borderLeft:"3px solid #6366F1",
          marginBottom:8, padding:"9px 12px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#6366F1",
            textTransform:"uppercase", letterSpacing:0.6,
            marginBottom:5 }}>💬 Motivo de consulta</div>
          {capMap.motivo && capMap.motivo.length > 0 ? (
            <p style={{ fontSize:12, color:C.text, margin:"0 0 8px",
              lineHeight:1.65 }}>{capMap.motivo[0]}</p>
          ) : (
            <p style={{ fontSize:12, color:C.text, margin:"0 0 8px",
              lineHeight:1.65 }}>Capturado automáticamente durante la consulta.</p>
          )}
          <div style={{ display:"flex", gap:7 }}>
            <button style={{ padding:"4px 10px", borderRadius:16, border:"none",
              background:"rgba(99,102,241,0.1)", fontSize:9, fontWeight:600,
              color:"#6366F1", cursor:"pointer" }}>✏️ Editar</button>
            <button style={{ padding:"4px 10px", borderRadius:16,
              border:"1px solid "+C.border, background:C.off,
              fontSize:9, color:C.dgray, cursor:"pointer" }}>🎤 Dictar</button>
          </div>
        </div>

        <Sec id="hea" title="Historia de la enfermedad actual" icon="📋" color={C.navy}
          openId={openId} setOpenId={setOpenId}
          defaultText={(capMap.motivo||[]).length>0||( capMap.hpi||[]).length>0
            ? "Pcte masculino 58a, HTA/DM2/ERC3, fumador activo.\n\n"+
              [...(capMap.motivo||[]),(capMap.hpi||[])].flat().join(" ")
            : "Pcte masculino 58a, HTA/DM2/ERC3, fumador activo.\n\nDolor torácico precordial opresivo, irradiación a brazo izq, inicio AM. Diaforesis y disnea. Adherencia parcial."}
          capturaBadge={(capMap.motivo||[]).length+(capMap.hpi||[]).length}/>

        <Sec id="efx" title="Examen físico" icon="🔍" color="#374151"
          openId={openId} setOpenId={setOpenId} isEfx={true}
          defaultText={"General: alerta, orientado, no distress. CV: RRR, sin soplos. Pulmones: claros. Abdomen: blando, NT/ND. Extremidades: sin edema. Neuro: sin focalidad."}/>

        {/* Medicamentos — chips compactos, solo lectura */}
        <div style={{ background:C.white, borderRadius:10,
          border:"1px solid "+C.border, borderLeft:"3px solid "+C.teal,
          marginBottom:8, padding:"9px 13px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:C.teal,
            textTransform:"uppercase", letterSpacing:0.6, marginBottom:5 }}>
            💊 Medicamentos
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
            {meds.map(m=>(
              <span key={m.id} style={{ fontSize:11, color:C.text,
                background:"#F8FAFC", border:"1px solid "+C.border,
                padding:"3px 9px", borderRadius:12 }}>
                {m.n}{m.d?" · "+m.d:""}
              </span>
            ))}
          </div>

        </div>

        <Sec id="imp" title="Impresión diagnóstica" icon="⚕️" color={C.teal}
          openId={openId} setOpenId={setOpenId}
          defaultText={"1. Dolor torácico — probable SCA en evaluación\n2. HTA no controlada (PA 158/96)\n3. DM2 descompensada (HbA1c 9.2%)\n4. ERC estadio 3 estable"}
          aiLabel="Diagnósticos diferenciales IA"
          aiSugs={["SCA/STEMI","TEP","Disección aórtica","GERD","Costocondritis","descontrolada","probable","aguda","a descartar"]}/>

        <Sec id="pln" title="Plan" icon="📋" color={C.green}
          openId={openId} setOpenId={setOpenId}
          defaultText={"• Referir emergencia hoy\n• ECG 12 derivaciones — inmediato\n• Troponina seriada x2 (0h y 3h)\n• ASA 325 mg VO\n• Nitroglicerina SL PRN\n\n📅 Seguimiento: control 48-72h"}
          aiLabel="Recomendaciones IA"
          aiSugs={[
            "🧪 CBC","🧪 CMP","🧪 HbA1c","🧪 Troponina I",
            "🩻 RX tórax","🩻 ECG","🩻 Eco cardíaco",
            "👨‍⚕️ Ref. Cardiología","👨‍⚕️ Ref. Nefrología","👨‍⚕️ Ref. Endocrinología",
            "📅 Control 48h","📅 Control 1 semana","📅 Control 3 meses"
          ]}/>
      </div>

      {/* Footer compacto */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0,
        maxWidth:390, margin:"0 auto",
        background:C.white, borderTop:"1px solid "+C.border,
        padding:"9px 13px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 -2px 12px rgba(0,0,0,0.05)" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:C.navy }}>Nota revisada</div>
          <div style={{ fontSize:8, color:C.dgray }}>Ver completa antes de firmar</div>
        </div>
        <button onClick={() => setNotaFinal(true)}
          style={{ padding:"9px 14px", borderRadius:10, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,"+C.teal+",#0A7A6E)",
            fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:11, color:C.white,
            boxShadow:"0 3px 10px rgba(11,140,128,0.25)" }}>
          Revisar nota completa →
        </button>
      </div>
    </div>
  );
}
