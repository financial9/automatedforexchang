import { useState, useEffect } from "react";

const C = {
  bg: "#050B18", surface: "#0C1526", card: "#111E35", border: "#1A2D4A",
  accent: "#00C6FF", gold: "#F4C430", green: "#00E676", red: "#FF4B4B",
  muted: "#4A6080", text: "#D6E8FF", subtext: "#7090B0",
};

const CRYPTOS = [
  { id:"BTC", name:"Bitcoin", price:67843.21, change: 2.34 },
  { id:"ETH", name:"Ethereum", price:3521.80, change:-1.12 },
  { id:"SOL", name:"Solana", price:182.44, change: 5.67 },
  { id:"BNB", name:"BNB", price:608.30, change: 0.88 },
];

function Ticker({ cryptos }) {
  const items = [...cryptos, ...cryptos];
  return (
    <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,height:34,display:"flex",alignItems:"center",overflow:"hidden"}}>
      <div style={{display:"flex",whiteSpace:"nowrap",gap:"20px",animation:"scroll 30s linear infinite"}}>
        {items.map((c,i)=>(
          <span key={i} style={{fontSize:12,fontFamily:"monospace",color:C.text}}>
            <span style={{color:C.muted}}>{c.id}</span> ${c.price.toLocaleString()} <span style={{color:c.change>=0?C.green:C.red}}>{c.change>=0?"▲":"▼"}{Math.abs(c.change)}%</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll {0% {transform: translateX(0)} 100% {transform: translateX(-50%)}}`}</style>
    </div>
  );
}

function LoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async() => {
    setErr("");
    if(!form.email||!form.password) return setErr("All fields required.");
    if(mode==="register") {
      if(!form.name) return setErr("Name required.");
      if(form.password!==form.confirm) return setErr("Passwords don't match.");
      if(form.password.length<6) return setErr("Password 6+ chars.");
    }
    setLoading(true);
    try {
      const endpoint = mode==="register" ? "/api/signup" : "/api/login";
      const res = await fetch(endpoint, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(mode==="register" ? {name:form.name,email:form.email,password:form.password} : {email:form.email,password:form.password})
      });
      const data = await res.json();
      if(!res.ok) return setErr(data.error||"Error");
      localStorage.setItem("afm_token", data.token);
      onAuth(data.user);
    } catch(e) {
      setErr("Network error");
    }
    setLoading(false);
  };return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#fff"}}>AF</div>
          <div>
            <div style={{fontWeight:800,fontSize:13,letterSpacing:-0.3}}>
              <span style={{color:C.accent}}>Automated</span>
              <span style={{color:C.text}}> Financial</span>
            </div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Marketing</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px"}}>
          <span style={{fontSize:12}}>🕐</span>
          <span style={{fontSize:10,color:C.gold,fontFamily:"monospace"}}>29, June 2026 / 09:17:12AM</span>
        </div>
      </div>

      <Ticker cryptos={CRYPTOS}/>

      {/* Main Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,color:C.accent,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Institutional-Grade Crypto Platform</div>
          <h1 style={{margin:0,fontSize:32,fontWeight:900,lineHeight:1.2,letterSpacing:-0.5,marginBottom:8}}>
            Grow Your Future
          </h1>
          <h2 style={{margin:0,fontSize:32,fontWeight:900,lineHeight:1.2,letterSpacing:-0.5,background:`linear-gradient(135deg,${C.accent},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Through Technology
          </h2>
          <p style={{margin:"12px 0 0 0",color:C.subtext,fontSize:13}}>Trade crypto assets with confidence</p>
        </div>

        {/* Auth Card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:360}}>
          <div style={{display:"flex",background:"#040A15",borderRadius:10,padding:4,marginBottom:20}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:mode===m?C.accent:"transparent",color:mode===m?"#000":C.muted}}>
                {m==="login"?"Sign In":"Sign Up"}
              </button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mode==="register"&&<input placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>}
            <input placeholder="Email address" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            {mode==="register"&&<input placeholder="Confirm password" type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>}
            
            {err&&<div style={{color:C.red,fontSize:12,background:"#2A0A0A",padding:"8px 12px",borderRadius:7}}>{err}</div>}
            
            <button onClick={submit} disabled={loading} style={{background:C.accent,color:"#000",border:"none",borderRadius:10,padding:"12px 0",fontWeight:800,fontSize:14,cursor:"pointer",opacity:loading?0.6:1}}>
              {loading?"Signing in...":mode==="login"?"Sign In →":"Create Account →"}
            </button>{mode==="login"&&<div style={{textAlign:"center",color:C.muted,fontSize:12}}>Demo: any email + password</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("market");

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontWeight:800,fontSize:14}}>📈 Automated Financial</div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12}}>Sign Out</button>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {tab==="market"&&<div style={{padding:16}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:12}}>📈 Markets</div>
          {CRYPTOS.map(c=>(
            <div key={c.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.id}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:13}}>${c.price.toLocaleString()}</div><div style={{fontSize:11,color:c.change>=0?C.green:C.red}}>{c.change>=0?"▲":"▼"}{Math.abs(c.change)}%</div></div>
            </div>
          ))}
        </div>}

        {tab==="portfolio"&&<div style={{padding:16}}><div style={{fontSize:13,color:C.muted}}>💼 Portfolio</div><div style={{marginTop:16,textAlign:"center",color:C.muted}}>No positions yet</div></div>}

        {tab==="history"&&<div style={{padding:16}}><div style={{fontSize:13,color:C.muted}}>📋 History</div><div style={{marginTop:16,textAlign:"center",color:C.muted}}>No transactions yet</div></div>}

        {tab==="account"&&<div style={{padding:16}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:16}}>👤 Account</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px"}}>
            <div style={{fontSize:11,color:C.muted}}>Logged in as</div>
            <div style={{fontSize:14,fontWeight:700,marginTop:4}}>{user.name}</div>
            <div style={{fontSize:12,color:C.muted}}>{user.email}</div>
          </div>
        </div>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#040A15",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {["market","portfolio","history","account"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:tab===t?"#0C1526":"transparent",color:tab===t?C.accent:C.muted,borderTop:tab===t?`2px solid ${C.accent}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:16}}>{t==="market"?"📈":(t==="portfolio"?"💼":(t==="history"?"📋":"👤"))}</span>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("afm_token");
    if(!token) return setAuthChecked(true);
    fetch("/api/me", {headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>setUser(data.user))
      .catch(()=>localStorage.removeItem("afm_token"))
      .finally(()=>setAuthChecked(true));
  }, []);

  if(!authChecked) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>Loading...</div>;
  if(!user) return <LoginPage onAuth={setUser}/>;

  return <Dashboard user={user} onLogout={()=>{localStorage.removeItem("afm_token");setUser(null);}} />;
}
