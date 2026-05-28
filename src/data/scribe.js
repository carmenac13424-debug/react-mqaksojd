// MedScribe RD — Ambient Scribe Engine
// Escucha → Clasifica → Propone. El médico decide.

const SOCIAL = [
    /juego|pelota|béisbol|fútbol|tapón|tráfico|lluvia|calor|frío/i,
    /cómo está(n)?|qué tal|buenas|saludos|hasta luego|cuídate|adiós|chao/i,
    /familia|hijo|esposa|negocio|trabajo|precio|costo|dinero/i,
  ];
  
  const CLINICO = {
    motivo: [
      /(?:qué|por qué|motivo|trae|viene|siente|duele|pasa|molesta)/i,
      /(?:dolor|presión|mareo|tos|fiebre|falta de aire|hincha|sangra)/i,
      /(?:desde hace|esta mañana|ayer|días|horas|semana)/i,
    ],
    hpi: [
      /(?:se le corre|irradia|asocia|empeora|mejora|intensidad)/i,
      /(?:brazo|cuello|espalda|pierna|pecho|cabeza|abdomen)/i,
      /(?:sudor|náusea|vómito|disnea|palpitaciones|síncope)/i,
      /(?:medicamento|pastilla|toma|tratamiento|alergi)/i,
    ],
    examen: [
      /(?:pulmones|corazón|abdomen|extremidades|neurológico|cuello)/i,
      /(?:claros|limpios|RRR|NT\/ND|CTA|sin soplos|sin edema|blando)/i,
      /(?:auscultación|palpación|examen|exploro|presión|saturación)/i,
    ],
    impresion: [
      /(?:creo|pienso|sospecho|me preocupa|parece|compatible|probable|posible)/i,
      /(?:diagnóstico|síndrome|coronario|SCA|HTA|diabetes|infarto)/i,
      /(?:descontrolad|descompensad|agudo|crónico|diferencial)/i,
    ],
    plan: [
      /(?:vamos a|hay que|necesita|ordenar|pedir|referir|enviar)/i,
      /(?:ECG|troponina|CBC|CMP|HbA1c|laboratorio|radiografía|eco)/i,
      /(?:aspirina|emergencia|urgencia|seguimiento|control|cita)/i,
      /(?:aumentar|reducir|suspender|iniciar|cambiar|ajustar|dosis)/i,
    ],
  };
  
  export function clasificar(texto) {
    if (!texto || texto.trim().length < 6) return null;
    for (const p of SOCIAL) if (p.test(texto)) return null;
  
    const scores = {};
    for (const [cat, pats] of Object.entries(CLINICO)) {
      scores[cat] = pats.filter(p => p.test(texto)).length;
    }
    const max = Math.max(...Object.values(scores));
    if (max === 0) return null;
    return Object.keys(scores).find(k => scores[k] === max);
  }
  
  // Demo: conversación real de 22 segundos
  const DEMO = [
    { t:1200,  sp:"paciente", txt:"Doctor, me duele el pecho desde esta mañana." },
    { t:3000,  sp:"medico",   txt:"¿Se le corre al brazo? ¿Tiene sudoración?" },
    { t:4800,  sp:"paciente", txt:"Sí, al brazo izquierdo. Y estoy sudando mucho, sin aire." },
    { t:7000,  sp:"medico",   txt:"¿Toma medicamentos? ¿Tiene presión alta, diabetes?" },
    { t:8500,  sp:"paciente", txt:"Losartán y Metformina. Tengo presión e diabetes." },
    { t:10500, sp:"medico",   txt:"¿Cómo estuvo el juego de pelota anoche?" },
    { t:11800, sp:"paciente", txt:"Perdieron. Mucho tapón hoy también." },
    { t:13500, sp:"medico",   txt:"Pulmones claros bilat., RRR sin soplos, sin edema en extremidades." },
    { t:16000, sp:"medico",   txt:"Me preocupa síndrome coronario agudo, probable SCA." },
    { t:18500, sp:"medico",   txt:"Referir a emergencia hoy. ECG inmediato. Troponinas seriadas. Aspirina 325 mg." },
    { t:20500, sp:"medico",   txt:"Seguimiento en 48 horas si SCA descartado." },
  ];
  
  export function iniciarScribe(onCaptura, onIgnorado) {
    const timers = DEMO.map(({ t, sp, txt }) =>
      setTimeout(() => {
        const cat = clasificar(txt);
        if (cat) onCaptura({ id:"c"+t, cat, txt, sp });
        else if (onIgnorado) onIgnorado(txt);
      }, t)
    );
    return () => timers.forEach(clearTimeout);
  }
  
  export const CAT = {
    motivo:    { l:"Motivo de consulta",       color:"#0B2545", icon:"📋" },
    hpi:       { l:"Historia enfermedad act.", color:"#1464A0", icon:"📝" },
    examen:    { l:"Examen físico",            color:"#374151", icon:"🔍" },
    impresion: { l:"Impresión diagnóstica",    color:"#0B8C80", icon:"⚕️"  },
    plan:      { l:"Plan",                     color:"#15803D", icon:"📋" },
  };