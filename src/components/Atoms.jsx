import React from "react";

export function Toast() {
  return null;
}

export function useAutoSave() {
  return {
    offline:false,
    saved:true,
    checkRecovery:()=>{},
    clearSave:()=>{}
  };
}

export function Bb({children}) {
  return (
    <b>{children}</b>
  );
}

export function AIResumen({texto}) {
  return (
    <div style={{
      padding:10,
      border:"1px solid #ddd",
      borderRadius:8,
      marginTop:10
    }}>
      🤖 {texto}
    </div>
  );
}