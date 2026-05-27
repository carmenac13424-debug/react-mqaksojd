import { useState, useEffect } from "react";
import { C } from "../data/constants";
import { getExpediente, clearExpediente } from "../data/expediente";

const TIPO_ICONS = {
  laboratorio:"🧪", imagen:"🫁", ecocardiograma:"❤️", ekg:"📈", otro:"📄"
};
const ACCION_COLOR = {
  "iniciado":           { color:C.green,  bg:C.lgreen,  label:"Iniciado"       },
  "suspendido":         { color:C.red,    bg:C.lred,    label:"Suspendido"     },
  "dosis cambiada":     { color:C.amber,  bg:C.lamber,  label:"Dosis cambiada" },
  "frecuencia cambiada":{ color:C.blue,   bg:C.lblue,   label:"Frec. cambiada" },
};

export default function Expediente({ onClose }) {
  const [exp,     setExp]     = useState(null);
  const [tab,     setTab]     = useState("problemas");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { setExp(getExpediente()); }, []);

  if (!exp) return null;

  const medActivos   = exp.medicamentos.filter(m => m.activo && m.accion === "iniciado");
  const medHistorial = [...exp.medicamentos].reverse();
  const resLabs      = exp.resultados.filter(r => r.tipo === "laboratorio");
  const resOtros     = exp.resultados.filter(r => r.tipo !== "laboratorio");

  const TABS = [
    { id:"problemas",  icon:"🩺", l:"Problemas",   count: exp.problemas.filter(p=>p.activo).length },
    { id:"meds",       icon:"💊", l:"Medicamentos", count: medActivos.length },
    { id:"resultados", icon:"🧪", l:"Resultados",   count: exp.resultados.length },
    { id:"visitas",    icon:"📋", l:"Visitas",      count: exp.visitas.length },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:C.off, zIndex:400,
      fontFamily:"Sora,sans-serif", display:"flex", flexDirection:"column",
      maxWidth:390, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ background:C.navy, padding:"12px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:8 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.white }}>📁 Expediente</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>
              {exp.paciente.nombre} · {exp.paciente.edad}a · {exp.paciente.sexo}
            </div>
          </div>
          <button onClick={onClose}
            style={{ padding:"5px 13px", borderRadius:18,
              border:"1px solid rgba(255,255,255,0.2)", background:"transparent",
              cursor:"pointer", fontFamily:"Sora,sans-serif",
              fontSize:10, color:"rgba(255,255,255,0.6)" }}>
            ← Cerrar
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, padding:"6px 4px", borderRadius:8,
                border:"1.5px solid "+(tab===t.id?"rgba(11,140,128,0.6)":"rgba(255,255,255,0.1)"),
                background:tab===t.id?"rgba(11,140,128,0.2)":"transparent",
                cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", gap:1 }}>
              <span style={{ fontSize:13 }}>{t.icon}</span>
              <span style={{ fontSize:8, fontWeight:700, fontFamily:"Sora,sans-serif",
                color:tab===t.id?C.teal:"rgba(255,255,255,0.4)" }}>{t.l}</span>
              <span style={{ fontSize:8, fontWeight:800,
                color:tab===t.id?C.teal:"rgba(255,255,255,0.25)" }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px 20px" }}>

        {/* ── PROBLEMAS ── */}
        {tab === "problemas" && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:C.navy,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:9 }}>
              🩺 Problemas activos
            </div>
            {exp.problemas.filter(p => p.activo).map(p => (
              <div key={p.id} style={{ background:C.white, borderRadius:11,
                border:"1px solid "+C.border, borderLeft:"3px solid "+C.teal,
                padding:"10px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center",
                  justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.navy,
                    flex:1, paddingRight:8 }}>{p.dx}</span>
                  <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:10,
                    fontWeight:700, color:C.purple, background:C.lpurple,
                    padding:"2px 7px", borderRadius:6 }}>{p.icd}</span>
                </div>
                <div style={{ fontSize:9, color:C.dgray }}>
                  📅 {p.fecha} · {p.fuente}
                </div>
              </div>
            ))}

            {exp.problemas.filter(p => !p.activo).length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:9, fontWeight:700, color:C.mgray,
                  textTransform:"uppercase", letterSpacing:0.7, marginBottom:7 }}>
                  Inactivos / resueltos
                </div>
                {exp.problemas.filter(p => !p.activo).map(p => (
                  <div key={p.id} style={{ background:C.gray, borderRadius:10,
                    border:"1px solid "+C.border, padding:"8px 12px",
                    marginBottom:5, opacity:0.7 }}>
                    <div style={{ fontSize:12, color:C.dgray,
                      textDecoration:"line-through" }}>{p.dx}</div>
                    <div style={{ fontSize:9, color:C.dgray, marginTop:2 }}>
                      📅 {p.fecha}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alergias */}
            {exp.alergias.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:C.red,
                  textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
                  ⚠️ Alergias
                </div>
                {exp.alergias.map(a => (
                  <div key={a.id} style={{ background:C.lred, borderRadius:10,
                    border:"1px solid #FECACA", padding:"9px 12px", marginBottom:5 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.red }}>
                      ⚠️ {a.alergia}
                    </div>
                    {a.reaccion && (
                      <div style={{ fontSize:11, color:C.red, marginTop:2 }}>
                        Reacción: {a.reaccion}
                      </div>
                    )}
                    <div style={{ fontSize:9, color:C.red, marginTop:3, opacity:0.7 }}>
                      📅 {a.fecha} · {a.fuente}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEDICAMENTOS ── */}
        {tab === "meds" && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:C.teal,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:9 }}>
              💊 Medicamentos actuales ({medActivos.length})
            </div>
            {medActivos.map(m => (
              <div key={m.id} style={{ background:C.white, borderRadius:11,
                border:"1px solid "+C.border, borderLeft:"3px solid "+C.green,
                padding:"10px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>
                    {m.nombre}
                  </span>
                  <span style={{ fontSize:9, fontWeight:700, color:C.green,
                    background:C.lgreen, padding:"2px 8px", borderRadius:8 }}>
                    Activo
                  </span>
                </div>
                {m.dosis && (
                  <div style={{ fontSize:11, color:C.dgray, marginBottom:3 }}>{m.dosis}</div>
                )}
                <div style={{ fontSize:9, color:C.dgray }}>
                  📅 {m.fecha} · {m.fuente}
                </div>
              </div>
            ))}

            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:C.dgray,
                textTransform:"uppercase", letterSpacing:0.7, marginBottom:9 }}>
                📋 Historial de cambios
              </div>
              {medHistorial.map((m, i) => {
                const ac = ACCION_COLOR[m.accion] || ACCION_COLOR["iniciado"];
                return (
                  <div key={m.id+"_"+i} style={{ background:C.white, borderRadius:10,
                    border:"1px solid "+C.border, padding:"8px 12px", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center",
                      justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:C.text,
                        flex:1, paddingRight:8 }}>{m.nombre}</span>
                      <span style={{ fontSize:9, fontWeight:700,
                        color:ac.color, background:ac.bg,
                        padding:"2px 8px", borderRadius:8 }}>{ac.label}</span>
                    </div>
                    {m.dosis && (
                      <div style={{ fontSize:10, color:C.dgray }}>{m.dosis}</div>
                    )}
                    <div style={{ fontSize:9, color:C.dgray, marginTop:3 }}>
                      📅 {m.fecha} · {m.fuente}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RESULTADOS ── */}
        {tab === "resultados" && (
          <div>
            {exp.resultados.length === 0 ? (
              <div style={{ textAlign:"center", padding:"30px 20px" }}>
                <div style={{ fontSize:28, marginBottom:10 }}>🧪</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:4 }}>
                  Sin resultados aportados aún
                </div>
                <div style={{ fontSize:11, color:C.dgray, lineHeight:1.6 }}>
                  Los resultados de Amadita, Referencia,<br/>
                  Cedimat y otros aparecerán aquí<br/>
                  visita por visita.
                </div>
              </div>
            ) : (
              <div>
                {resLabs.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:C.blue,
                      textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
                      🧪 Laboratorios ({resLabs.length})
                    </div>
                    {resLabs.map(r => (
                      <div key={r.id} style={{ background:C.white, borderRadius:11,
                        border:"1px solid "+C.border, borderLeft:"3px solid "+C.blue,
                        padding:"10px 12px", marginBottom:6 }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:C.navy }}>
                            {r.nombre}
                          </span>
                          {r.valor && (
                            <span style={{ fontFamily:"JetBrains Mono,monospace",
                              fontSize:14, fontWeight:700, color:C.blue }}>
                              {r.valor}
                              {r.unidad && <span style={{ fontSize:10, color:C.dgray, marginLeft:2 }}>{r.unidad}</span>}
                            </span>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          {r.lab && (
                            <span style={{ fontSize:9, fontWeight:700, color:C.teal,
                              background:C.lteal, padding:"1px 6px", borderRadius:6 }}>
                              {r.lab}
                            </span>
                          )}
                          <span style={{ fontSize:9, color:C.dgray }}>📅 {r.fecha}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {resOtros.length > 0 && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:"#374151",
                      textTransform:"uppercase", letterSpacing:0.7, marginBottom:8 }}>
                      🫁 Imágenes / EKG / Otros ({resOtros.length})
                    </div>
                    {resOtros.map(r => (
                      <div key={r.id} style={{ background:C.white, borderRadius:11,
                        border:"1px solid "+C.border, padding:"9px 12px", marginBottom:5 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:18 }}>{TIPO_ICONS[r.tipo]||"📄"}</span>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600, color:C.text }}>
                              {r.nombre}
                            </div>
                            <div style={{ fontSize:9, color:C.dgray, marginTop:1 }}>
                              📅 {r.fecha} · {r.fuente}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── VISITAS ── */}
        {tab === "visitas" && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:C.navy,
              textTransform:"uppercase", letterSpacing:0.7, marginBottom:9 }}>
              📋 Historial de visitas ({exp.visitas.length})
            </div>
            {exp.visitas.length === 0 ? (
              <div style={{ textAlign:"center", padding:"30px 20px" }}>
                <div style={{ fontSize:28, marginBottom:10 }}>📋</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:4 }}>
                  Sin visitas registradas aún
                </div>
                <div style={{ fontSize:11, color:C.dgray, lineHeight:1.6 }}>
                  Cada consulta firmada aparecerá aquí<br/>
                  con fecha, diagnóstico y plan.
                </div>
              </div>
            ) : (
              [...exp.visitas].reverse().map(v => (
                <div key={v.id} style={{ background:C.white, borderRadius:12,
                  border:"1px solid "+C.border, padding:"11px 13px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:5 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.navy }}>
                      📅 {v.fecha}
                    </span>
                    <span style={{ fontSize:9, fontWeight:700, color:C.green,
                      background:C.lgreen, padding:"2px 8px", borderRadius:8 }}>
                      ✅ Firmada
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:C.text, marginBottom:3 }}>
                    {v.resumen.motivo}
                  </div>
                  <div style={{ fontSize:11, color:C.dgray, marginBottom:5 }}>
                    {v.resumen.dx_principal}
                  </div>
                  <div style={{ background:C.gray, borderRadius:8,
                    padding:"6px 9px", fontSize:10, color:C.dgray, lineHeight:1.6 }}>
                    {v.resumen.plan_resumen}
                  </div>
                  <div style={{ display:"flex", gap:10, marginTop:6 }}>
                    <span style={{ fontSize:9, color:C.dgray }}>💊 {v.resumen.meds_count} meds</span>
                    <span style={{ fontSize:9, color:C.dgray }}>🧪 {v.resumen.resultados_count} resultados</span>
                    <span style={{ fontFamily:"JetBrains Mono,monospace",
                      fontSize:9, color:C.mgray }}>{v.firmaId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reset testing */}
        <div style={{ borderTop:"1px solid "+C.border, paddingTop:14,
          marginTop:14, textAlign:"center" }}>
          {!confirm ? (
            <button onClick={() => setConfirm(true)}
              style={{ background:"transparent", border:"none", cursor:"pointer",
                fontSize:10, color:C.mgray, fontFamily:"Sora,sans-serif" }}>
              Borrar expediente (solo testing)
            </button>
          ) : (
            <div>
              <p style={{ fontSize:11, color:C.red, marginBottom:8 }}>
                ¿Seguro? No se puede deshacer.
              </p>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <button onClick={() => setConfirm(false)}
                  style={{ padding:"5px 14px", borderRadius:9,
                    border:"1px solid "+C.border, background:C.white,
                    cursor:"pointer", fontFamily:"Sora,sans-serif",
                    fontSize:11, color:C.dgray }}>Cancelar</button>
                <button onClick={() => { clearExpediente(); setExp(getExpediente()); setConfirm(false); }}
                  style={{ padding:"5px 14px", borderRadius:9, border:"none",
                    background:C.red, cursor:"pointer",
                    fontFamily:"Sora,sans-serif", fontSize:11,
                    fontWeight:700, color:C.white }}>Borrar todo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
