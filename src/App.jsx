import { useState } from "react";

export default function App() {
  return (
    <div style={{minHeight:"100vh",background:"#050B18",color:"#00C6FF",fontFamily:"system-ui",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <h1 style={{fontSize:"32px",marginBottom:"20px"}}>✅ BROKER IS WORKING!</h1>
      <p style={{fontSize:"18px",marginBottom:"30px"}}>If you see this, React is loading correctly</p>
      <button style={{padding:"12px 24px",background:"#00C6FF",color:"#000",border:"none",borderRadius:"8px",fontSize:"16px",fontWeight:"bold",cursor:"pointer"}}>
        Test Button
      </button>
    </div>
  );
}
