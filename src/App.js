import React, { useState, useEffect, useRef } from 'react';
import {
  C,
  GCSS,
  fmt,
  hoy,
  INITIAL_ANT,
  INITIAL_MEDS,
  VITALES,
} from './data/constants';
import { Toast, useAutoSave, AIResumen } from './components/Atoms';
import MedicalHistory from './components/MedicalHistory';
import RecordingScreen from './components/RecordingScreen';
import SOAPReview from './components/SOAPReview';

// ── Screens: "inicio" | "grabando" | "gen" | "nota" | "soap"
export default function App() {
  const [scr, setScr] = useState('inicio');
  const [secs, setSecs] = useState(0);
  const [tipo, setTipo] = useState('Nota de Progreso');
  const [pct, setPct] = useState(0);
  const [con, setCon] = useState(false);
  const [tmsg, setTmsg] = useState(null);
  const [ant, setAnt] = useState(INITIAL_ANT);
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const [res, setRes] = useState([]);
  const [notas, setNotas] = useState([]);
  const [extraDx, setExtraDx] = useState([]);
  const [lsel, setLsel] = useState({});
  const [showH, setShowH] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const clk = useRef(null);

  const sh = (m) => {
    setTmsg(m);
    setTimeout(() => setTmsg(null), 2400);
  };
  const { offline, saved, checkRecovery, clearSave } = useAutoSave(
    { ant, meds, res, notas, secs },
    ['grabando', 'nota'].includes(scr)
  );

  useEffect(() => {
    if (scr === 'grabando') {
      clk.current = setInterval(() => setSecs((x) => x + 1), 1000);
    } else clearInterval(clk.current);
    return () => clearInterval(clk.current);
  }, [scr]);

  useEffect(() => {
    if (scr === 'gen') {
      setPct(0);
      const steps = [12, 35, 58, 78, 91, 100];
      const ts = steps.map((v, i) =>
        setTimeout(() => setPct(v), (i + 1) * 480)
      );
      const fin = setTimeout(() => setScr('nota'), 3200);
      return () => {
        ts.forEach(clearTimeout);
        clearTimeout(fin);
      };
    }
  }, [scr]);

  useEffect(() => {
    const d = checkRecovery();
    if (d) setRecovered(true);
  }, []);

  function reset() {
    setScr('inicio');
    setSecs(0);
    setCon(false);
    setTmsg(null);
    setAnt(INITIAL_ANT);
    setMeds(INITIAL_MEDS);
    setRes([]);
    setNotas([]);
    setExtraDx([]);
    setLsel({});
    setRecovered(false);
    setShowH(false);
    clearSave();
  }

  // Global modals
  if (showH)
    return (
      <MedicalHistory
        data={ant}
        onChange={setAnt}
        toast={sh}
        onClose={() => setShowH(false)}
      />
    );

  if (scr === 'grabando')
    return (
      <RecordingScreen
        secs={secs}
        ant={ant}
        setAnt={setAnt}
        meds={meds}
        setMeds={setMeds}
        res={res}
        setRes={setRes}
        notas={notas}
        setNotas={setNotas}
        toast={sh}
        offline={offline}
        onFinish={() => setScr('gen')}
      />
    );

  if (scr === 'soap')
    return (
      <SOAPReview
        ant={ant}
        meds={meds}
        setMeds={setMeds}
        res={res}
        setRes={setRes}
        notas={notas}
        setNotas={setNotas}
        extraDx={extraDx}
        secs={secs}
        onFirmar={() => {}}
        onClose={() => setScr('nota')}
        toast={sh}
      />
    );

  // ── GENERATING ──────────────────────────────────────────────────────────────
  if (scr === 'gen')
    return (
      <div
        style={{
          fontFamily: 'Sora,sans-serif',
          maxWidth: 390,
          margin: '0 auto',
          minHeight: '100vh',
          background: C.off,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{GCSS}</style>
        <div style={{ background: C.navy, padding: '12px 18px' }}>
          <span style={{ fontWeight: 800, fontSize: 19, color: C.white }}>
            MedScribe <span style={{ color: C.teal }}>RD</span>
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
          }}
        >
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                border: '5px solid ' + C.lteal,
                borderTop: '5px solid ' + C.teal,
                animation: 'SP 0.85s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                fontSize: 26,
              }}
            >
              🩺
            </div>
          </div>
          <p
            style={{
              fontWeight: 800,
              fontSize: 18,
              color: C.navy,
              margin: '0 0 5px',
            }}
          >
            Preparando borrador clínico
          </p>
          <p style={{ fontSize: 12, color: C.dgray, margin: '0 0 20px' }}>
            Consulta de {fmt(secs)}
          </p>
          <div
            style={{
              width: '100%',
              maxWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}
          >
            {[
              { l: 'Historia y antecedentes', at: 20 },
              { l: 'Examen físico', at: 45 },
              { l: 'Evaluación y plan', at: 68 },
              { l: 'Medicamentos', at: 88 },
            ].map((s) => {
              const done = pct >= s.at;
              return (
                <div
                  key={s.l}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    opacity: done ? 1 : 0.3,
                    transition: 'opacity 0.5s',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: done ? C.teal : C.gray,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: C.white,
                      fontWeight: 800,
                    }}
                  >
                    {done ? '✓' : ''}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: done ? C.navy : C.dgray,
                      fontWeight: done ? 600 : 400,
                    }}
                  >
                    {s.l}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ width: '100%', maxWidth: 280, marginTop: 18 }}>
            <div
              style={{
                height: 4,
                background: C.gray,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg,' + C.teal + ',#1464A0)',
                  borderRadius: 8,
                  width: pct + '%',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );

  // ── NOTA FINAL ──────────────────────────────────────────────────────────────
  if (scr === 'nota')
    return (
      <div
        style={{
          fontFamily: 'Sora,sans-serif',
          maxWidth: 390,
          margin: '0 auto',
          minHeight: '100vh',
          background: '#F1F5F9',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{GCSS}</style>
        <Toast m={tmsg} />
        <div
          style={{
            background: C.navy,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 19, color: C.white }}>
            MedScribe <span style={{ color: C.teal }}>RD</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {offline && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.amber,
                  background: C.lamber,
                  border: '1px solid #FDE68A',
                  padding: '2px 7px',
                  borderRadius: 8,
                }}
              >
                📵 Offline
              </span>
            )}
            {saved && !offline && (
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                💾 {saved}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              🔒
            </span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
          <div
            style={{
              background: C.navy,
              padding: '10px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.white }}>
                Carlos Méndez
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 1,
                }}
              >
                58a · M · {hoy()}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(245,158,11,0.18)',
                border: '1px solid rgba(245,158,11,0.35)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 10,
                color: '#FCD34D',
                fontWeight: 700,
              }}
            >
              📝 Borrador
            </div>
          </div>
          <div
            style={{
              background: C.navy,
              padding: '8px 18px 11px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            {VITALES.map((v) => (
              <div
                key={v.l}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                  }}
                >
                  {v.l}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: v.hi ? '#FCA5A5' : 'rgba(255,255,255,0.85)',
                  }}
                >
                  {v.v}
                </span>
                {v.u && (
                  <span
                    style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}
                  >
                    {v.u}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px' }}>
            <AIResumen meds={meds} />
            <div
              style={{
                background: C.lred,
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '9px 12px',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.red,
                  marginBottom: 2,
                }}
              >
                🔴 Hallazgos de alto riesgo
              </div>
              <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>
                Dolor torácico + diaforesis + disnea. Evaluar en emergencia hoy.
              </div>
            </div>
            <div
              style={{
                background: C.white,
                borderRadius: 12,
                border: '1px solid ' + C.border,
                borderLeft: '4px solid #374151',
                padding: '11px 13px',
                marginBottom: 7,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                  }}
                >
                  🩺 Historia médica
                </div>
                <button
                  onClick={() => setShowH(true)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 18,
                    border: '1px solid ' + C.border,
                    background: C.off,
                    cursor: 'pointer',
                    fontFamily: 'Sora,sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    color: C.dgray,
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
              {[
                ...ant.ale.map((i) => ({ ...i, isA: true })),
                ...ant.enf,
                ...ant.cir,
                ...ant.soc,
              ].map((i) => (
                <div
                  key={i.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '3px 0',
                    borderBottom: '1px solid ' + C.border,
                  }}
                >
                  <span
                    style={{ fontSize: 10, color: i.isA ? C.red : C.dgray }}
                  >
                    {i.isA ? '⚠️' : '•'}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      flex: 1,
                      color: i.isA ? C.red : C.text,
                      fontWeight: i.isA ? 700 : 400,
                    }}
                  >
                    {i.t}
                  </span>
                  <span style={{ fontSize: 9, color: C.dgray }}>
                    {i.f === 'expediente' ? '📁' : i.f === 'audio' ? '🎙' : '👤'}
                  </span>
                </div>
              ))}
            </div>
            {notas.length > 0 && (
              <div
                style={{
                  background: C.white,
                  borderRadius: 12,
                  border: '1px solid ' + C.border,
                  borderLeft: '4px solid ' + C.purple,
                  padding: '11px 13px',
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.purple,
                    textTransform: 'uppercase',
                    letterSpacing: 0.7,
                    marginBottom: 7,
                  }}
                >
                  📝 Notas privadas ({notas.length})
                </div>
                {notas.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: 7,
                      padding: '4px 0',
                      borderBottom: '1px solid ' + C.border,
                    }}
                  >
                    <span
                      style={{ fontSize: 11, color: n.ok ? C.green : C.purple }}
                    >
                      {n.ok ? '✅' : '⏳'}
                    </span>
                    <span style={{ fontSize: 11, color: C.text, flex: 1 }}>
                      {n.t}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: 390,
            margin: '0 auto',
            background: C.white,
            borderTop: '1px solid ' + C.border,
            padding: '10px 16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>
              Borrador listo
            </div>
            <div style={{ fontSize: 9, color: C.dgray }}>
              Revise antes de firmar
            </div>
          </div>
          <button
            onClick={() => setScr('soap')}
            style={{
              padding: '10px 18px',
              borderRadius: 11,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg,' + C.teal + ',#0A7A6E)',
              fontFamily: 'Sora,sans-serif',
              fontWeight: 800,
              fontSize: 13,
              color: C.white,
              boxShadow: '0 4px 14px rgba(11,140,128,0.35)',
            }}
          >
            ✅ Revisar y firmar →
          </button>
        </div>
      </div>
    );

  // ── INICIO ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: 'Sora,sans-serif',
        maxWidth: 390,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#EEF4FF,#E2F4F1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{GCSS}</style>
      <div
        style={{
          background: C.navy,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 19, color: C.white }}>
          MedScribe <span style={{ color: C.teal }}>RD</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {offline && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: C.amber,
                background: C.lamber,
                border: '1px solid #FDE68A',
                padding: '2px 7px',
                borderRadius: 8,
              }}
            >
              📵 Offline
            </span>
          )}
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            🟢 Listo 🔒
          </span>
        </div>
      </div>
      <div
        style={{
          background: 'rgba(11,37,69,0.04)',
          borderBottom: '1px solid ' + C.border,
          padding: '5px 18px',
          fontSize: 11,
          color: C.dgray,
        }}
      >
        🔒 Audio no almacenado · Ley 172-13 · 42-01
      </div>
      <Toast m={tmsg} />
      <div
        style={{
          flex: 1,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
      >
        {recovered && (
          <div
            style={{
              background: C.lblue,
              border: '1px solid #BFDBFE',
              borderRadius: 11,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>
                Recuperamos borrador automáticamente
              </div>
              <div style={{ fontSize: 10, color: C.dgray }}>
                ¿Continuar donde estaba?
              </div>
            </div>
            <button
              onClick={() => {
                const d = checkRecovery();
                if (d) {
                  setAnt(d.ant || INITIAL_ANT);
                  setMeds(d.meds || INITIAL_MEDS);
                  setRes(d.res || []);
                  setNotas(d.notas || []);
                  setScr('nota');
                }
              }}
              style={{
                padding: '6px 11px',
                borderRadius: 20,
                border: 'none',
                background: C.blue,
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
              }}
            >
              Continuar
            </button>
          </div>
        )}

        <div>
          <p
            style={{
              fontSize: 11,
              color: C.dgray,
              margin: '0 0 8px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Tipo de nota
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Nota de Progreso', 'Primera Consulta'].map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                style={{
                  flex: 1,
                  padding: '11px 8px',
                  borderRadius: 13,
                  border: 'none',
                  cursor: 'pointer',
                  background: tipo === t ? C.navy : C.white,
                  color: tipo === t ? C.white : C.text,
                  fontFamily: 'Sora,sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-consulta */}
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: '1px solid ' + C.border,
            padding: '12px 14px',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.dgray,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              margin: '0 0 9px',
            }}
          >
            Preparar antes de iniciar
          </p>
          <div style={{ display: 'flex', gap: 7, marginBottom: 8 }}>
            <button
              onClick={() => setShowH(true)}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 11,
                border: '1.5px solid ' + C.border,
                background: C.white,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>🩺</span>
              <span
                style={{
                  fontFamily: 'Sora,sans-serif',
                  fontWeight: 600,
                  fontSize: 10,
                  color: C.navy,
                }}
              >
                Historia médica
              </span>
              <span style={{ fontSize: 9, color: C.teal, fontWeight: 700 }}>
                {[...ant.enf, ...ant.cir, ...ant.ale].length} registros
              </span>
            </button>
            <button
              onClick={() => sh('💊 Use el panel ⊕ durante la consulta')}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 11,
                border: '1.5px solid ' + C.border,
                background: C.white,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>💊</span>
              <span
                style={{
                  fontFamily: 'Sora,sans-serif',
                  fontWeight: 600,
                  fontSize: 10,
                  color: C.navy,
                }}
              >
                Medicamentos
              </span>
              <span style={{ fontSize: 9, color: C.teal, fontWeight: 700 }}>
                {meds.length} cargados
              </span>
            </button>
            <button
              onClick={() => sh('🧪 Añada durante la consulta')}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 11,
                border: '1.5px solid ' + C.border,
                background: C.white,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>🧪</span>
              <span
                style={{
                  fontFamily: 'Sora,sans-serif',
                  fontWeight: 600,
                  fontSize: 10,
                  color: C.navy,
                }}
              >
                Resultados
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: res.length ? C.teal : C.mgray,
                  fontWeight: 700,
                }}
              >
                {res.length > 0 ? res.length + ' cargados' : 'Sin resultados'}
              </span>
            </button>
          </div>
          <div
            style={{
              background: C.gray,
              borderRadius: 9,
              padding: '7px 10px',
              fontSize: 11,
              color: C.dgray,
            }}
          >
            💡 La secretaria puede cargar datos antes del audio
          </div>
        </div>

        <button
          onClick={() => {
            if (!con) {
              sh('⚠️ Confirme consentimiento primero');
              return;
            }
            setScr('grabando');
          }}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg,' + C.navy + ',#174E8C)',
            border: 'none',
            borderRadius: 20,
            cursor: 'pointer',
            boxShadow: '0 10px 40px rgba(11,37,69,0.38)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: con ? 1 : 0.75,
            transition: 'opacity 0.2s',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            🎙️
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.white }}>
            INICIAR CONSULTA
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            {tipo} ·{' '}
            {con
              ? 'La IA escucha, usted atiende'
              : 'Confirme consentimiento primero'}
          </div>
        </button>

        <div
          style={{
            background: C.white,
            borderRadius: 14,
            border: '1px solid ' + C.border,
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 7,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
                Carlos Méndez
              </div>
              <div style={{ fontSize: 11, color: C.dgray }}>58a · M</div>
            </div>
            <button
              onClick={() => sh('📂 Expediente...')}
              style={{
                fontSize: 11,
                color: C.teal,
                fontWeight: 600,
                background: C.lteal,
                padding: '5px 11px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Ver expediente
            </button>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['HTA', 'DM2', 'ERC 3'].map((d) => (
              <span
                key={d}
                style={{
                  fontSize: 11,
                  color: C.red,
                  background: C.lred,
                  padding: '3px 9px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div
          onClick={() => setCon(!con)}
          style={{
            background: con ? C.lgreen : '#F3F4F6',
            border: '1px solid ' + (con ? C.green : C.border),
            borderRadius: 12,
            padding: '11px 13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              width: 19,
              height: 19,
              borderRadius: 5,
              flexShrink: 0,
              marginTop: 1,
              border: '2px solid ' + (con ? C.green : C.mgray),
              background: con ? C.green : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {con && (
              <span style={{ fontSize: 11, color: C.white, fontWeight: 800 }}>
                ✓
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: con ? C.green : C.dgray,
              lineHeight: 1.6,
            }}
          >
            Confirmo consentimiento verbal del paciente para asistencia de IA.
          </p>
        </div>
      </div>

      {/* Nav */}
      <div
        style={{
          background: C.white,
          borderTop: '1px solid ' + C.border,
          display: 'flex',
          padding: '9px 0 18px',
          position: 'sticky',
          bottom: 0,
          boxShadow: '0 -2px 14px rgba(0,0,0,0.06)',
        }}
      >
        {[
          { ic: '🎙️', l: 'Scribe', act: true },
          { ic: '📋', l: 'Expediente' },
          { ic: '🔬', l: 'Labs' },
          { ic: '👤', l: 'Perfil' },
        ].map((x, i) => (
          <button
            key={x.l}
            onClick={i === 0 ? reset : () => sh(x.l + '...')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 20 }}>{x.ic}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: x.act ? 700 : 400,
                color: x.act ? C.teal : C.dgray,
                fontFamily: 'Sora,sans-serif',
              }}
            >
              {x.l}
            </span>
            {x.act && (
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: C.teal,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
