// ── EXPEDIENTE LONGITUDINAL ────────────────────────────────────────────────────
// Persiste en localStorage entre visitas.
// Cada entrada tiene: fecha, fuente, acción, datos.
// Nunca se sobrescribe — solo se añade.

const KEY = "mrd_expediente_v1";

function hoy() {
  return new Date().toLocaleDateString("es-DO");
}

function loadExp() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultExp();
    return JSON.parse(raw);
  } catch(e) {
    return defaultExp();
  }
}

function saveExp(exp) {
  try {
    localStorage.setItem(KEY, JSON.stringify(exp));
  } catch(e) {}
}

function defaultExp() {
  return {
    paciente: {
      nombre: "Paciente Demo",
      edad: 58,
      sexo: "M",
    },
    // Problemas activos — acumulan visita por visita
    problemas: [
      { id:"p1", dx:"Hipertensión arterial (HTA)", icd:"I10",
        fecha:"15/3/2024", fuente:"Expediente previo", activo:true },
      { id:"p2", dx:"Diabetes mellitus tipo 2", icd:"E11",
        fecha:"15/3/2024", fuente:"Expediente previo", activo:true },
      { id:"p3", dx:"ERC estadio 3", icd:"N18.3",
        fecha:"2/1/2024", fuente:"Expediente previo", activo:true },
    ],
    // Historia de medicamentos — cronológica, nunca se borra
    medicamentos: [
      { id:"m1", nombre:"Metformina 850 mg", dosis:"c/12h",
        accion:"iniciado", fecha:"15/3/2024", fuente:"Expediente previo", activo:true },
      { id:"m2", nombre:"Atorvastatina 20 mg", dosis:"nocturna",
        accion:"iniciado", fecha:"15/3/2024", fuente:"Expediente previo", activo:true },
      { id:"m3", nombre:"Losartán 50 mg", dosis:"diario",
        accion:"iniciado", fecha:"2/1/2024", fuente:"Expediente previo", activo:true },
    ],
    // Alergias — permanentes
    alergias: [
      { id:"a1", alergia:"Penicilina", reaccion:"Rash",
        fecha:"2019", fuente:"Expediente previo" },
    ],
    // Resultados históricos — labs, imágenes, EKG
    resultados: [],
    // Visitas anteriores — resumen de cada consulta firmada
    visitas: [],
  };
}

// ── API pública ────────────────────────────────────────────────────────────────

export function getExpediente() {
  return loadExp();
}

// Añadir diagnóstico desde Plan
export function addDiagnostico({ dx, icd, fuente = "Plan médico firmado" }) {
  const exp = loadExp();
  // No duplicar si ya existe activo
  const existe = exp.problemas.find(p =>
    p.dx.toLowerCase() === dx.toLowerCase() && p.activo
  );
  if (existe) return exp;
  exp.problemas.push({
    id: "p" + Date.now(),
    dx, icd: icd || "—",
    fecha: hoy(),
    fuente,
    activo: true,
  });
  saveExp(exp);
  return exp;
}

// Registrar cambio de medicamento desde Plan
export function registrarMedicamento({ nombre, dosis, accion, fuente = "Plan médico firmado" }) {
  // accion: "iniciado" | "suspendido" | "dosis cambiada" | "frecuencia cambiada"
  const exp = loadExp();
  // Si se suspende, marcar el activo como inactivo
  if (accion === "suspendido") {
    exp.medicamentos = exp.medicamentos.map(m =>
      m.nombre.toLowerCase().includes(nombre.toLowerCase()) && m.activo
        ? { ...m, activo:false, fechaSuspendido:hoy(), fuenteSuspendido:fuente }
        : m
    );
  }
  // Siempre añadir entrada en historial
  exp.medicamentos.push({
    id: "m" + Date.now(),
    nombre, dosis: dosis || "",
    accion, fecha: hoy(),
    fuente,
    activo: accion === "iniciado",
  });
  saveExp(exp);
  return exp;
}

// Guardar resultado aportado por paciente
export function addResultado({ nombre, tipo, valor, unidad, fuente, lab }) {
  // tipo: "laboratorio" | "imagen" | "ecocardiograma" | "ekg" | "otro"
  const exp = loadExp();
  exp.resultados.push({
    id: "r" + Date.now(),
    nombre, tipo,
    valor: valor || null,
    unidad: unidad || "",
    fuente: fuente || "Aportado por paciente",
    lab: lab || "",
    fecha: hoy(),
  });
  saveExp(exp);
  return exp;
}

// Guardar visita completa tras firma
export function registrarVisita({ soap, meds, res, notas, secs, firmaId }) {
  const exp = loadExp();
  exp.visitas.push({
    id: "v" + Date.now(),
    fecha: hoy(),
    duracion: secs,
    firmaId,
    resumen: {
      motivo: "Dolor torácico precordial",
      dx_principal: "Dolor torácico a estudio (R07.9)",
      plan_resumen: "Referir emergencia — descartar SCA",
      meds_count: meds.length,
      notas_count: notas.filter(n=>n.ok).length,
      resultados_count: res.length,
    },
    soap_snapshot: soap,
  });
  saveExp(exp);
  return exp;
}

// Limpiar expediente (solo para testing)
export function clearExpediente() {
  try { localStorage.removeItem(KEY); } catch(e) {}
}