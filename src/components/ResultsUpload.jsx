import { useState } from "react";
import { C } from "../data/constants";

// ── Laboratorios dominicanos frecuentes ──────────────────────────────────────
const LAB_SOURCES = ["Amadita","Referencia","Cedimat","Hospiten","IMG","Otro"];

// Valores de referencia + OCR simulado por tipo de archivo
const OCR_RESULTS = {
  foto:    [{n:"HbA1c",     v:9.2,  u:"%",      ref:[4,5.7],  prev:8.8},
            {n:"Glucosa",   v:187,  u:"mg/dL",  ref:[70,100], prev:210},
            {n:"LDL",       v:165,  u:"mg/dL",  ref:[0,100],  prev:158}],
  pdf:     [{n:"Creatinina",v:2.1,  u:"mg/dL",  ref:[0.6,1.2],prev:2.0},
            {n:"eGFR",      v:34,   u:"mL/min", ref:[60,999], prev:38},
            {n:"BUN",       v:28,   u:"mg/dL",  ref:[7,20],   prev:24}],
  wa:      [{n:"HbA1c",     v:8.4,  u:"%",      ref:[4,5.7],  prev:9.2},
            {n:"Hemoglobina",v:11.2,u:"g/dL",   ref:[12,16],  prev:11.8}],
  foto_med:[{n:"Levotiroxina",v:"25mcg",u:"",   ref:null,     prev:null}],
};

function trend(v,prev,ref){
  if(!prev||!ref) return null;
  const hiNow  = v>ref[1];
  const hiPrev = prev>ref[1];
  if(v===prev) return {icon:"→",color:C.dgray,label:"Estable"};
  if(hiNow&&v>prev)  return {icon:"↑",color:C.red,  label:"Empeorando"};
  if(hiNow&&v<prev)  return {icon:"↓",color:C.amber,label:"Mejorando"};
  if(!hiNow&&v<prev) return {icon:"↓",color:C.green,label:"Mejorando"};
  return {icon:"↑",color:C.amber,label:"Cambiando"};
}

function ValCard({item,onApprove,approved}){
  const t = typeof item.v==="number" ? trend(item.v,item.prev,item.ref) : null;
  const hi = item.ref && typeof item.v==="number" && (item.v<item.ref[0]||item.v>item.ref[1]);
  return(
    <div style={{background:approved?C.lgreen:C.white,borderRadius:10,
      border:"1.5px solid "+(approved?"#BBF7D0":hi?C.lred:C.border),
      padding:"9px 11px",marginBottom:6,transition:"all 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <span style={{fontSize:12,fontWeight:800,color:C.navy}}>{item.n}</span>
            {hi&&<span style={{fontSize:9,fontWeight:700,background:C.lred,color:C.red,padding:"1px 6px",borderRadius:6}}>↑ Fuera de rango</span>}
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:5}}>
            <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:16,fontWeight:700,color:hi?C.red:C.navy}}>{item.v}</span>
            <span style={{fontSize:10,color:C.dgray}}>{item.u}</span>
            {item.prev&&typeof item.v==="number"&&(
              <span style={{fontSize:10,color:C.dgray}}>vs {item.prev} {item.u} anterior</span>
            )}
          </div>
          {t&&(
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
              <span style={{fontSize:13,fontWeight:800,color:t.color}}>{t.icon}</span>
              <span style={{fontSize:10,fontWeight:600,color:t.color}}>{t.label}</span>
            </div>
          )}
        </div>
        {!approved&&(
          <button onClick={onApprove}
            style={{padding:"6px 12px",borderRadius:18,border:"none",background:C.teal,
              cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:C.white,
              flexShrink:0}}>
            ✓ Aprobar
          </button>
        )}
        {approved&&<span style={{fontSize:16}}>✅</span>}
      </div>
    </div>
  );
}

function UploadItem({item,onApproveVal,onApproveAll}){
  const vals = item.values||[];
  const pendientes = vals.filter(v=>!v.approved).length;

  return(
    <div style={{background:C.white,borderRadius:12,border:"1px solid "+C.border,
      marginBottom:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      {/* Header */}
      <div style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:9,
        background:vals.length>0?"linear-gradient(135deg,#0F172A,#1E293B)":C.gray,
        borderBottom:"1px solid "+C.border}}>
        <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:vals.length>0?C.white:C.text,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.l}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
            <span style={{fontSize:9,fontWeight:700,
              background:"rgba(11,140,128,0.25)",color:C.teal,
              padding:"1px 7px",borderRadius:6}}>{item.source}</span>
            {vals.length>0&&<span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>
              {vals.filter(v=>v.approved).length}/{vals.length} aprobados
            </span>}
          </div>
        </div>
        {pendientes===0&&vals.length>0&&<span style={{fontSize:11,fontWeight:700,color:C.green,background:C.lgreen,padding:"3px 9px",borderRadius:10}}>✅ Listo</span>}
        {pendientes>0&&<button onClick={onApproveAll}
          style={{padding:"5px 11px",borderRadius:18,border:"none",
            background:"linear-gradient(135deg,"+C.teal+",#0A9E92)",
            cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:9,fontWeight:700,color:C.white,flexShrink:0}}>
          Aprobar todo
        </button>}
      </div>

      {/* Valores extraídos */}
      {vals.length>0&&(
        <div style={{padding:"9px 12px"}}>
          <div style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",
            letterSpacing:0.7,marginBottom:6}}>🤖 IA extrajo — confirme cada valor:</div>
          {vals.map((v,i)=>(
            <ValCard key={i} item={v} approved={v.approved}
              onApprove={()=>onApproveVal(item.id,i)}/>
          ))}
        </div>
      )}

      {/* Sin OCR */}
      {vals.length===0&&!item.processing&&(
        <div style={{padding:"9px 12px",fontSize:11,color:C.dgray}}>
          No se detectaron valores numéricos. Revise el archivo manualmente.
        </div>
      )}
    </div>
  );
}

export default function ResultsUpload({items,onChange,toast}){
  const[queue,setQueue]=useState([]);
  const[selSource,setSelSource]=useState("Amadita");
  const[showSrc,setShowSrc]=useState(false);

  const OPTS=[
    {id:"foto",    icon:"📸",l:"Tomar foto"},
    {id:"pdf",     icon:"📄",l:"PDF"},
    {id:"wa",      icon:"💬",l:"WhatsApp"},
    {id:"foto_med",icon:"💊",l:"Foto medicamento"},
  ];

  function add(id){
    const o=OPTS.find(x=>x.id===id);
    const qid="q"+Date.now();
    setQueue(p=>[...p,{id:qid,icon:o.icon,l:o.l,pct:0}]);
    toast(o.icon+" Procesando con OCR — la grabación continúa…");
    let p=0;
    const iv=setInterval(()=>{
      p+=3;
      setQueue(q=>q.map(x=>x.id===qid?{...x,pct:Math.min(p,100)}:x));
      if(p>=100){
        clearInterval(iv);
        setQueue(q=>q.filter(x=>x.id!==qid));
        // Simular extracción OCR con valores reales
        const vals=(OCR_RESULTS[id]||[]).map(r=>({...r,approved:false}));
        const newItem={
          id:"r"+Date.now(),
          icon:o.icon,
          l:o.l+" — "+selSource,
          source:selSource,
          tipo:id,
          ok:vals.length===0,
          values:vals,
        };
        onChange([...items,newItem]);
        toast(vals.length>0
          ? "🔬 "+vals.length+" valor"+( vals.length>1?"es extraídos":"extraído")+" — confirme cada uno"
          : "📎 Archivo añadido — sin valores detectados"
        );
      }
    },60);
  }

  function approveVal(itemId,valIdx){
    onChange(items.map(it=>{
      if(it.id!==itemId)return it;
      const newVals=it.values.map((v,i)=>i===valIdx?{...v,approved:true}:v);
      return{...it,values:newVals,ok:newVals.every(v=>v.approved)};
    }));
  }

  function approveAll(itemId){
    onChange(items.map(it=>{
      if(it.id!==itemId)return it;
      return{...it,values:it.values.map(v=>({...v,approved:true})),ok:true};
    }));
    toast("✅ Todos los valores aprobados");
  }

  return(
    <div>
      <p style={{fontSize:10,color:C.dgray,margin:"0 0 9px",fontWeight:600,lineHeight:1.5}}>
        Paciente trae sus resultados — la IA extrae valores, usted aprueba
      </p>

      {/* Selector de fuente */}
      <div style={{marginBottom:9}}>
        <div style={{fontSize:9,fontWeight:700,color:C.mgray,textTransform:"uppercase",letterSpacing:0.7,marginBottom:5}}>Fuente del resultado:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {LAB_SOURCES.map(s=>(
            <button key={s} onClick={()=>setSelSource(s)}
              style={{padding:"4px 10px",borderRadius:18,border:"1.5px solid "+(selSource===s?C.teal:C.border),background:selSource===s?C.lteal:C.white,cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:10,fontWeight:700,color:selSource===s?C.teal:C.dgray}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Botones upload */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:9}}>
        {OPTS.map(o=>(
          <button key={o.id} onClick={()=>add(o.id)}
            style={{padding:"9px 8px",borderRadius:10,border:"1.5px solid "+C.border,
              background:C.white,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:18}}>{o.icon}</span>
            <span style={{fontFamily:"Sora,sans-serif",fontWeight:600,fontSize:11,color:C.navy}}>{o.l}</span>
          </button>
        ))}
      </div>

      {/* OCR en progreso */}
      {queue.map(q=>(
        <div key={q.id} style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:10,
          padding:"9px 12px",marginBottom:7,border:"1px solid rgba(11,140,128,0.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{width:13,height:13,borderRadius:"50%",border:"2px solid "+C.teal,
              borderTop:"2px solid transparent",animation:"SP 0.8s linear infinite",flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:600,color:C.teal}}>
              🔬 OCR extrayendo valores — grabación activa
            </span>
          </div>
          <div style={{height:4,background:"rgba(11,140,128,0.15)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,"+C.teal+",#1464A0)",
              width:q.pct+"%",transition:"width 0.1s",borderRadius:3}}/>
          </div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:4,textAlign:"right"}}>{q.pct}%</div>
        </div>
      ))}

      {/* Items procesados */}
      {items.length===0&&queue.length===0&&(
        <div style={{padding:"12px 14px",background:C.gray,borderRadius:10,
          border:"1.5px dashed "+C.border,textAlign:"center"}}>
          <p style={{fontSize:12,fontWeight:600,color:C.navy,margin:"0 0 3px"}}>Sin resultados cargados</p>
          <p style={{fontSize:10,color:C.dgray,margin:0,lineHeight:1.5}}>Amadita · Referencia · Cedimat<br/>Foto · PDF · WhatsApp</p>
        </div>
      )}

      {items.map(it=>(
        <UploadItem key={it.id} item={it}
          onApproveVal={approveVal}
          onApproveAll={()=>approveAll(it.id)}/>
      ))}

      {/* Resumen de valores aprobados */}
      {items.flatMap(it=>it.values||[]).filter(v=>v.approved).length>0&&(
        <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:11,
          padding:"10px 13px",marginTop:4,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",
            textTransform:"uppercase",letterSpacing:0.7,marginBottom:7}}>📊 Valores confirmados:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
            {items.flatMap(it=>it.values||[]).filter(v=>v.approved).map((v,i)=>{
              const hi=v.ref&&typeof v.v==="number"&&(v.v<v.ref[0]||v.v>v.ref[1]);
              return(
                <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"6px 8px"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",fontWeight:700,textTransform:"uppercase",marginBottom:1}}>{v.n}</div>
                  <div style={{fontFamily:"JetBrains Mono,monospace",fontSize:14,fontWeight:700,color:hi?"#FCA5A5":"#6EE7B7"}}>{v.v}<span style={{fontSize:9,marginLeft:2,color:"rgba(255,255,255,0.3)"}}>{v.u}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
