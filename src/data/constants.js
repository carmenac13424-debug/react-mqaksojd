// ─── COLORS ───────────────────────────────────────────────────────────────────
export const C = {
  navy:"#0B2545", teal:"#0B8C80", lteal:"#E0F5F3",
  green:"#15803D", lgreen:"#F0FAF4", red:"#B91C1C", lred:"#FEF2F2",
  amber:"#D97706", lamber:"#FFFBEB", blue:"#1D4ED8", lblue:"#EFF6FF",
  purple:"#7C3AED", lpurple:"#F5F3FF",
  white:"#fff", off:"#F8FAFC", gray:"#F1F5F9",
  mgray:"#CBD5E1", dgray:"#64748B", text:"#0F172A", border:"#E2E8F0",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const GCSS = `
  @import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap");
  @keyframes W   { 0%,100%{height:4px} 50%{height:44px} }
  @keyframes PL  { 0%,100%{opacity:1}  50%{opacity:0.1} }
  @keyframes BL  { 0%,80%,100%{opacity:0.1} 40%{opacity:1} }
  @keyframes SP  { to{transform:rotate(360deg)} }
  @keyframes FU  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @keyframes SU  { from{transform:translateY(100%)} to{transform:none} }
  @keyframes POP { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { margin:0; font-family:Sora,sans-serif; background:#F1F5F9; }
  textarea { font-family:Sora,sans-serif; }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const fmt  = s => String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
export const hoy  = () => new Date().toLocaleDateString("es-DO");
export const aho  = () => new Date().toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"});
export const genId = () => "MRD-"+Date.now().toString(36).toUpperCase().slice(-6);

// ─── CLINICAL DATA ────────────────────────────────────────────────────────────
export const INITIAL_ANT = {
  enf:[
    {id:"e1",t:"Hipertensión arterial (HTA)",f:"expediente",ok:true},
    {id:"e2",t:"Diabetes mellitus tipo 2",   f:"expediente",ok:true},
    {id:"e3",t:"ERC estadio 3",              f:"expediente",ok:true},
  ],
  cir:[{id:"c1",t:"Colecistectomía 2018",f:"expediente",ok:true}],
  ale:[{id:"a1",t:"Penicilina — Rash",   f:"expediente",ok:true}],
  soc:[{id:"s1",t:"Fumador activo",f:"expediente",ok:true}],
  fam:[],
};

export const INITIAL_MEDS = [
  {id:"m1",n:"Metformina 850 mg",  d:"c/12h",   f:"expediente",s:"conf",
   al:[{t:"warn",m:"ERC estadio 3 — monitorear creatinina"}]},
  {id:"m2",n:"Atorvastatina 20 mg",d:"nocturna", f:"expediente",s:"conf",al:[]},
  {id:"m3",n:"Lisinopril 10 mg",   d:"diario",   f:"expediente",s:"revisar",
   al:[{t:"danger",m:"Duplicidad IECA+ARA-II — doble bloqueo SRAA. Revisar con nefrólogo"}]},
  {id:"m4",n:"Losartán 50 mg",     d:"diario",   f:"audio",     s:"dijo",
   al:[{t:"danger",m:"Ver Lisinopril — contraindicación combinación IECA/ARA-II"}]},
  {id:"m5",n:"Aspirina 81 mg",     d:"diario",   f:"paciente",  s:"duda",al:[]},
];

export const VITALES = [
  {l:"PA",  v:"158/96",u:"mmHg",hi:true },
  {l:"FC",  v:"92",    u:"lpm", hi:false},
  {l:"SpO2",v:"96%",   u:"",    hi:true },
  {l:"Temp",v:"36.8",  u:"°C",  hi:false},
];

export const DIFS = [
  {id:"sca", d:"Síndrome coronario agudo",    hi:true},
  {id:"dis", d:"Disección aórtica",           hi:true},
  {id:"tep", d:"TEP / Embolia pulmonar",      hi:true},
  {id:"peri",d:"Pericarditis aguda",          hi:false},
  {id:"cos", d:"Costocondritis",              hi:false},
];

export const ICD_CODES = [
  {d:"Dolor torácico a estudio",  c:"R07.9"},
  {d:"HTA no controlada",         c:"I10"},
  {d:"Diabetes mellitus tipo 2",  c:"E11"},
  {d:"ERC estadio 3",             c:"N18.3"},
];

export const ORDENES_LIST = [
  {id:"ecg", icon:"📈",l:"ECG",      urgent:true},
  {id:"trop",icon:"🧪",l:"Troponina",urgent:true},
  {id:"cbc", icon:"🧪",l:"CBC",      urgent:false},
  {id:"cmp", icon:"🧪",l:"CMP",      urgent:false},
  {id:"rx",  icon:"🫁",l:"Rx Tórax", urgent:false},
  {id:"bnp", icon:"❤️",l:"BNP",      urgent:false},
];

export const TIPOS_ANT = [
  {id:"enf",icon:"🩺",l:"Enfermedad"},
  {id:"cir",icon:"🏥",l:"Cirugía"},
  {id:"ale",icon:"⚠️", l:"Alergia"},
  {id:"soc",icon:"🚬",l:"Social"},
  {id:"fam",icon:"👨‍👩‍👧",l:"Familiar"},
];

export const AC_MAP = {
  "hta":"Hipertensión arterial (HTA)","dm2":"Diabetes mellitus tipo 2",
  "erc":"ERC estadio 3","hlp":"Hiperlipidemia",
  "osa":"Apnea obstructiva del sueño","fa":"Fibrilación auricular",
  "hipo":"Hipotiroidismo","gerd":"GERD / Reflujo","epoc":"EPOC",
};
export const FAV_RD = ["HTA","DM2","ERC","HLP","OSA","Hipotiroidismo","GERD"];

export const EMEDS = {
  conf:   {dot:C.green, label:"Confirmado",      bc:"#BBF7D0"},
  dijo:   {dot:C.blue,  label:"Paciente refiere", bc:"#BFDBFE"},
  duda:   {dot:C.amber, label:"Sin confirmar",    bc:"#FDE68A"},
  revisar:{dot:C.red,   label:"Revisar",          bc:"#FECACA"},
  susp:   {dot:C.mgray, label:"Suspendido",       bc:C.border},
};

export const NP_SUGS = [
  "Descartar SCA vs TEP","Preguntar tabaquismo real",
  "Considerar angioTC","Posible ansiedad",
  "Revisar BNP","Preguntar adherencia real",
];

export const MEDICO = {n:"Dr. Carlos R. Medina, MD", eq:"EX-2005-1842"};