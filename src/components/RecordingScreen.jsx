import React, { useState, useEffect, useRef } from 'react';
import { C, fmt, TIPOS_ANT, AC_MAP, FAV_RD, NP_SUGS } from '../data/constants';
import { Toast } from './Atoms';
import PrivateNoteDrawer from './PrivateNoteDrawer';

// ── Quick Historia inside drawer ───────────────────────────────────────────────
function HistoriaQuick({ ant, setAnt, toast }) {
  const [txt, setTxt] = useState('');
  const [tipo, setTipo] = useState('enf');
  const [sugs, setSugs] = useState([]);

  function onInput(v) {
    setTxt(v);
    if (!v.trim()) {
      setSugs([]);
      return;
    }
    const lo = v.toLowerCase();
    setSugs(
      [
        ...new Set([
          ...Object.entries(AC_MAP)
            .filter(([k]) => k.startsWith(lo))
            .map(([, val]) => val),
          ...FAV_RD.filter((f) => f.toLowerCase().includes(lo)).map(
            (f) => AC_MAP[f.toLowerCase()] || f
          ),
        ]),
      ].slice(0, 4)
    );
  }
  function add(t) {
    setAnt({
      ...ant,
      [tipo]: [...ant[tipo], { id: 'x' + Date.now(), t, f: 'audio', ok: true }],
    });
    setTxt('');
    setSugs([]);
    toast('✅ ' + t);
  }
  const total = [...ant.enf, ...ant.cir, ...ant.ale, ...ant.soc, ...ant.fam]
    .length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
        {TIPOS_ANT.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            title={t.l}
            style={{
              flex: 1,
              padding: '5px 3px',
              borderRadius: 8,
              fontSize: 15,
              border: '1.5px solid ' + (tipo === t.id ? C.teal : C.border),
              background: tipo === t.id ? C.lteal : C.white,
              cursor: 'pointer',
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={txt}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && txt.trim()) add(sugs[0] || txt.trim());
            }}
            placeholder="HTA, DM2… Enter para añadir"
            style={{
              flex: 1,
              padding: '9px 10px',
              borderRadius: 9,
              border: '1.5px solid ' + C.teal,
              fontSize: 12,
              fontFamily: 'Sora,sans-serif',
              color: C.text,
              background: C.off,
              outline: 'none',
            }}
          />
          <button
            onClick={() => {
              if (txt.trim()) add(sugs[0] || txt.trim());
            }}
            style={{
              padding: '9px 13px',
              borderRadius: 9,
              border: 'none',
              background: C.teal,
              cursor: 'pointer',
              color: C.white,
              fontFamily: 'Sora,sans-serif',
              fontWeight: 700,
            }}
          >
            ✓
          </button>
        </div>
        {sugs.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: C.white,
              border: '1px solid ' + C.teal,
              borderRadius: 9,
              overflow: 'hidden',
              zIndex: 10,
              marginTop: 2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            }}
          >
            {sugs.map((s, i) => (
              <button
                key={i}
                onClick={() => add(s)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: i === 0 ? C.lteal : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid ' + C.border,
                  cursor: 'pointer',
                  fontFamily: 'Sora,sans-serif',
                  fontSize: 12,
                  color: C.text,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {total > 0 && (
        <p
          style={{
            fontSize: 10,
            color: C.teal,
            margin: '6px 0 0',
            fontWeight: 600,
          }}
        >
          {total} registrado{total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ── Quick Meds inside drawer ───────────────────────────────────────────────────
function MedsQuick({ meds, setMeds, toast }) {
  const [txt, setTxt] = useState('');
  const [pend, setPend] = useState(null);
  const [von, setVon] = useState(false);
  const [vs, setVs] = useState(0);
  const tr = useRef(null);

  useEffect(() => {
    if (von) {
      setVs(0);
      tr.current = setInterval(() => setVs((x) => x + 1), 1000);
    } else clearInterval(tr.current);
    return () => clearInterval(tr.current);
  }, [von]);

  return (
    <div>
      {pend && (
        <div
          style={{
            background: C.lteal,
            borderRadius: 9,
            padding: '9px 11px',
            marginBottom: 8,
            border: '1px solid ' + C.teal + '44',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.teal,
              margin: '0 0 6px',
            }}
          >
            🤖 "{pend}"
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPend(null)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: 8,
                border: '1px solid ' + C.border,
                background: C.white,
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif',
                fontSize: 11,
                color: C.dgray,
              }}
            >
              ✕
            </button>
            <button
              onClick={() => {
                setMeds([
                  ...meds,
                  {
                    id: 'm' + Date.now(),
                    n: pend,
                    d: '',
                    f: 'manual',
                    s: 'conf',
                    al: [],
                  },
                ]);
                setPend(null);
                toast('✅ ' + pend);
              }}
              style={{
                flex: 2,
                padding: '7px',
                borderRadius: 8,
                border: 'none',
                background: C.teal,
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif',
                fontSize: 12,
                fontWeight: 800,
                color: C.white,
              }}
            >
              ✅ Aprobar
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          background: von ? C.navy : C.gray,
          borderRadius: 10,
          padding: '9px 13px',
          marginBottom: 7,
          border: '1.5px solid ' + (von ? C.teal : C.border),
          transition: 'all 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {von ? (
              <>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#EF4444',
                    animation: 'PL 1s infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    color: C.white,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {fmt(vs)}
                </span>
              </>
            ) : (
              <>
                <span>🎙</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                  Dictar medicamento
                </span>
              </>
            )}
          </div>
          {von ? (
            <button
              onClick={() => {
                setVon(false);
                setPend('Jardiance 10 mg — VO diario');
              }}
              style={{
                padding: '5px 11px',
                borderRadius: 20,
                border: 'none',
                background: C.teal,
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
              }}
            >
              ✓ Listo
            </button>
          ) : (
            <button
              onClick={() => setVon(true)}
              style={{
                padding: '5px 11px',
                borderRadius: 20,
                border: 'none',
                background: C.navy,
                cursor: 'pointer',
                fontFamily: 'Sora,sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: C.white,
              }}
            >
              Hablar →
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && txt.trim()) {
              setPend(txt.trim());
              setTxt('');
            }
          }}
          placeholder="Escribir medicamento…"
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 9,
            border: '1.5px solid ' + C.border,
            fontSize: 12,
            fontFamily: 'Sora,sans-serif',
            color: C.text,
            background: C.off,
            outline: 'none',
          }}
        />
        <button
          onClick={() => {
            if (txt.trim()) {
              setPend(txt.trim());
              setTxt('');
            }
          }}
          style={{
            padding: '8px 12px',
            borderRadius: 9,
            border: 'none',
            background: C.teal,
            cursor: 'pointer',
            color: C.white,
            fontFamily: 'Sora,sans-serif',
            fontWeight: 700,
          }}
        >
          ✓
        </button>
      </div>
      <p style={{ fontSize: 10, color: C.dgray, margin: '6px 0 0' }}>
        {meds.length} medicamento{meds.length !== 1 ? 's' : ''} cargado
        {meds.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ── Quick Labs inside drawer ───────────────────────────────────────────────────
function LabsQuick({ res, setRes, toast }) {
  const [queue, setQueue] = useState([]);
  const OPTS = [
    { id: 'foto', icon: '📸', l: 'Foto' },
    { id: 'pdf', icon: '📄', l: 'PDF' },
    { id: 'wa', icon: '💬', l: 'WhatsApp' },
    { id: 'med', icon: '💊', l: 'Foto med' },
  ];
  function add(id) {
    const o = OPTS.find((x) => x.id === id);
    const qid = 'q' + Date.now();
    setQueue((p) => [...p, { id: qid, icon: o.icon, l: o.l, pct: 0 }]);
    toast(o.icon + ' Procesando en segundo plano…');
    let p = 0;
    const iv = setInterval(() => {
      p += 5;
      setQueue((q) =>
        q.map((x) => (x.id === qid ? { ...x, pct: Math.min(p, 100) } : x))
      );
      if (p >= 100) {
        clearInterval(iv);
        setQueue((q) => q.filter((x) => x.id !== qid));
        setRes([
          ...res,
          { id: 'r' + Date.now(), icon: o.icon, l: o.l, ok: false },
        ]);
      }
    }, 80);
  }
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          color: C.dgray,
          margin: '0 0 8px',
          fontWeight: 600,
        }}
      >
        OCR asincrónico — la grabación continúa
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          marginBottom: 8,
        }}
      >
        {OPTS.map((o) => (
          <button
            key={o.id}
            onClick={() => add(o.id)}
            style={{
              padding: '8px',
              borderRadius: 10,
              border: '1.5px solid ' + C.border,
              background: C.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span style={{ fontSize: 18 }}>{o.icon}</span>
            <span
              style={{
                fontFamily: 'Sora,sans-serif',
                fontWeight: 600,
                fontSize: 11,
                color: C.navy,
              }}
            >
              {o.l}
            </span>
          </button>
        ))}
      </div>
      {queue.map((q) => (
        <div
          key={q.id}
          style={{
            background: C.lteal,
            borderRadius: 9,
            padding: '7px 10px',
            marginBottom: 5,
            border: '1px solid ' + C.teal + '44',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '2px solid ' + C.teal,
                borderTop: '2px solid transparent',
                animation: 'SP 0.8s linear infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color: C.teal }}>
              {q.icon} Procesando…
            </span>
          </div>
          <div
            style={{
              height: 3,
              background: 'rgba(11,140,128,0.2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: C.teal,
                width: q.pct + '%',
                transition: 'width 0.15s',
              }}
            />
          </div>
        </div>
      ))}
      {res.length > 0 && (
        <p
          style={{
            fontSize: 10,
            color: C.teal,
            margin: '4px 0 0',
            fontWeight: 600,
          }}
        >
          {res.length} resultado{res.length !== 1 ? 's' : ''} añadido
          {res.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ── Main RecordingScreen ───────────────────────────────────────────────────────
export default function RecordingScreen({
  secs,
  ant,
  setAnt,
  meds,
  setMeds,
  res,
  setRes,
  notas,
  setNotas,
  toast,
  onFinish,
  offline,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('hist');
  const [npOpen, setNpOpen] = useState(false);

  const TABS = [
    { id: 'hist', icon: '🩺', l: 'Historia' },
    { id: 'meds', icon: '💊', l: 'Meds' },
    { id: 'labs', icon: '🧪', l: 'Resultados' },
    { id: 'nota', icon: '📝', l: 'Nota privada' },
  ];

  return (
    <div
      style={{
        fontFamily: 'Sora,sans-serif',
        maxWidth: 390,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'linear-gradient(175deg,#0B2545,#0A2D5A)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toast m={null} />

      {/* Nota privada drawer */}
      <PrivateNoteDrawer
        open={npOpen}
        onClose={() => setNpOpen(false)}
        notas={notas}
        onChange={setNotas}
        toast={toast}
      />

      {/* Header sticky — EN VIVO siempre visible */}
      <div
        style={{
          background: 'rgba(0,0,0,0.22)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.white }}>
            Carlos Méndez · 58a
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            HTA · DM2 · ERC 3
          </div>
        </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#EF4444',
                animation: 'PL 1.2s infinite',
              }}
            />
            <span
              style={{
                color: '#EF4444',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 1.5,
                fontFamily: 'JetBrains Mono,monospace',
              }}
            >
              EN VIVO
            </span>
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'JetBrains Mono,monospace',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {fmt(secs)}
          </span>
        </div>
      </div>

      {/* Visualizador */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          gap: 18,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 4, height: 68 }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3.5,
                borderRadius: 4,
                background: 'rgba(11,140,128,0.88)',
                animation: `W ${0.32 + (i % 7) * 0.08}s ease-in-out infinite ${
                  i * 0.038
                }s`,
              }}
            />
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: C.white,
              margin: '0 0 8px',
            }}
          >
            🎙️ IA escuchando…
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Hable con su paciente normalmente.
            <br />
            La IA documenta. Usted atiende.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(11,140,128,0.1)',
            border: '1px solid rgba(11,140,128,0.22)',
            borderRadius: 22,
            padding: '9px 18px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: C.teal,
                animation: `BL 1.4s ease-in-out infinite ${i * 0.28}s`,
              }}
            />
          ))}
          <span
            style={{
              fontSize: 11,
              color: C.teal,
              fontWeight: 600,
              marginLeft: 5,
            }}
          >
            Filtrando ruido · Español dominicano
          </span>
        </div>
        <div
          style={{
            width: '100%',
            background: 'rgba(185,28,28,0.16)',
            border: '1px solid rgba(185,28,28,0.35)',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            gap: 9,
          }}
        >
          <span style={{ fontSize: 15 }}>🔴</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FCA5A5' }}>
              Hallazgos de alto riesgo detectados
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                marginTop: 2,
              }}
            >
              Dolor torácico + diaforesis + disnea — evalúe al terminar
            </div>
          </div>
        </div>
      </div>

      {/* Botones principales */}
      <div
        style={{
          padding: '8px 18px 80px',
          flexShrink: 0,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={() => toast('⏸ Audio pausado')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'rgba(255,255,255,0.75)',
            fontFamily: 'Sora,sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ⏸
        </button>
        <button
          onClick={onFinish}
          style={{
            flex: 4,
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg,' + C.teal + ',#0A7A6E)',
            fontFamily: 'Sora,sans-serif',
            fontWeight: 800,
            fontSize: 14,
            color: C.white,
            boxShadow: '0 6px 22px rgba(11,140,128,0.45)',
          }}
        >
          Terminar y revisar →
        </button>
      </div>

      {/* Botón ⊕ flotante — MODO ENTREVISTA */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 150,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: open
            ? '#EF4444'
            : 'linear-gradient(135deg,' + C.teal + ',#0A9E92)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          color: C.white,
          fontWeight: 800,
          transition: 'all 0.22s',
        }}
      >
        {open ? '✕' : '⊕'}
      </button>

      {/* Drawer parcial ~44vh */}
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 130 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 140,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 390,
                background: C.white,
                borderRadius: '18px 18px 0 0',
                boxShadow: '0 -6px 30px rgba(0,0,0,0.24)',
                animation: 'SU 0.2s ease',
                maxHeight: '46vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '8px 14px 0', flexShrink: 0 }}>
                <div
                  style={{
                    width: 34,
                    height: 3,
                    borderRadius: 2,
                    background: C.mgray,
                    margin: '0 auto 9px',
                  }}
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: 8,
                        border:
                          '1.5px solid ' + (tab === t.id ? C.teal : C.border),
                        background: tab === t.id ? C.lteal : C.white,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{t.icon}</span>
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          color: tab === t.id ? C.teal : C.dgray,
                          fontFamily: 'Sora,sans-serif',
                        }}
                      >
                        {t.l}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '10px 14px 24px',
                }}
              >
                {tab === 'hist' && (
                  <HistoriaQuick ant={ant} setAnt={setAnt} toast={toast} />
                )}
                {tab === 'meds' && (
                  <MedsQuick meds={meds} setMeds={setMeds} toast={toast} />
                )}
                {tab === 'labs' && (
                  <LabsQuick res={res} setRes={setRes} toast={toast} />
                )}
                {tab === 'nota' && (
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: C.dgray,
                        margin: '0 0 9px',
                        lineHeight: 1.5,
                      }}
                    >
                      El paciente no escucha.{' '}
                      <strong>Requieren aprobación.</strong>
                    </p>
                    {notas.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        {notas.map((n) => (
                          <div
                            key={n.id}
                            style={{
                              display: 'flex',
                              gap: 7,
                              padding: '5px 8px',
                              background: 'rgba(124,58,237,0.07)',
                              borderRadius: 8,
                              marginBottom: 3,
                            }}
                          >
                            <span>📝</span>
                            <span style={{ fontSize: 11, color: C.text }}>
                              {n.t}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        marginBottom: 8,
                      }}
                    >
                      {NP_SUGS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setNotas([
                              ...notas,
                              {
                                id: 'np' + Date.now(),
                                t: s,
                                f: 'sugerencia',
                                ok: false,
                              },
                            ]);
                            toast('📝 Añadida');
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '7px 10px',
                            borderRadius: 8,
                            background: C.gray,
                            border: '1px solid ' + C.border,
                            cursor: 'pointer',
                            fontFamily: 'Sora,sans-serif',
                            fontSize: 11,
                            color: C.text,
                          }}
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setOpen(false);
                        setNpOpen(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px',
                        borderRadius: 9,
                        border: '1px solid ' + C.border,
                        background: C.off,
                        cursor: 'pointer',
                        fontFamily: 'Sora,sans-serif',
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.navy,
                      }}
                    >
                      🎤 Abrir dictado completo →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
