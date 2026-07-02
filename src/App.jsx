import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#050B18", surface: "#0C1526", card: "#111E35", border: "#1A2D4A",
  accent: "#00C6FF", gold: "#F4C430", green: "#00E676", red: "#FF4B4B",
  muted: "#4A6080", text: "#D6E8FF", subtext: "#7090B0",
};

const CRYPTOS = [
  { id:"BTC", name:"Bitcoin", price:67843.21, change: 2.34, icon:"₿", color:"#F7931A" },
  { id:"ETH", name:"Ethereum", price:3521.80, change:-1.12, icon:"Ξ", color:"#627EEA" },
  { id:"SOL", name:"Solana", price:182.44, change: 5.67, icon:"◎", color:"#9945FF" },
  { id:"BNB", name:"BNB", price:608.30, change: 0.88, icon:"B", color:"#F3BA2F" },
  { id:"ADA", name:"Cardano", price:0.4812, change:-2.45, icon:"₳", color:"#0096D6" },
  { id:"XRP", name:"XRP", price:0.5923, change: 1.23, icon:"✕", color:"#00AAE4" },
  { id:"DOGE", name:"Dogecoin", price:0.1634, change: 3.91, icon:"Ð", color:"#C2A633" },
  { id:"AVAX", name:"Avalanche", price:38.92, change:-0.77, icon:"▲", color:"#E84142" },
];

const SUPPORT_EMAIL = "cryptoforextraining@gmail.com";
const FAKE_NAMES = ["James K.","Maria S.","Ahmed R.","Liu W.","Fatima O.","Carlos M.","Priya N."];
const FAKE_AMOUNTS = [500,1000,2500,5000,750,1200,3000];
const COUNTRIES = ["🇺🇸","🇬🇧","🇳🇬","🇨🇦","🇦🇺","🇩🇪","🇫🇷"];

const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

const makeToast = (type) => {
  const name = randItem(FAKE_NAMES);
  const amount = randItem(FAKE_AMOUNTS);
  const flag = randItem(COUNTRIES);
  if (type === "deposit") return { id: Date.now()+Math.random(), text:`${flag} ${name} deposited $${amount.toLocaleString()}`, icon:"💰" };
  if (type === "withdraw") return { id: Date.now()+Math.random(), text:`${flag} ${name} withdrew $${amount.toLocaleString()} profit`, icon:"🏆" };
  return null;
};

function Ticker({ cryptos }) {
  const ref = useRef(null);
  useEffect(() => {
    let pos = 0, raf;
    const tick = () => {
      pos += 0.5;
      if (ref.current) ref.current.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [...cryptos, ...cryptos];
  return (
    <div style={{overflow:"hidden",background:"#040A15",borderBottom:`1px solid ${C.border}`,height:34,display:"flex",alignItems:"center"}}>
      <div ref={ref} style={{display:"flex",whiteSpace:"nowrap"}}>
        {items.map((c,i)=>(
          <span key={i} style={{padding:"0 24px",fontSize:12,fontFamily:"monospace",display:"inline-flex",gap:6,alignItems:"center"}}>
            <span style={{color:C.muted}}>{c.id}</span>
            <span style={{color:C.text}}>${c.price<1?c.price.toFixed(4):c.price.toLocaleString()}</span>
            <span style={{color:c.change>=0?C.green:C.red}}>{c.change>=0?"▲":"▼"}{Math.abs(c.change)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div style={{position:"fixed",bottom:80,left:12,right:12,zIndex:200,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
      {toasts.slice(0,3).map(t=>(
        <div key={t.id} style={{background:"rgba(11,20,40,0.95)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,backdropFilter:"blur(12px)"}}>
          <span style={{fontSize:18}}>{t.icon}</span>
          <span style={{fontSize:12,color:C.text}}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

function LoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const types = ["deposit","withdraw"];
    const fire = () => {
      const t = makeToast(randItem(types));
      setToasts(p=>[t,...p].slice(0,3));
      setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),4000);
    };
    fire();
    const iv = setInterval(fire, 5000);
    return ()=>clearInterval(iv);
  }, []);

  const submit = async() => {
    setErr("");
    if(!form.email||!form.password) return setErr("All fields required.");
    if(mode==="register") {
      if(!form.name) return setErr("Full name required.");
      if(form.password!==form.confirm) return setErr("Passwords don't match.");
      if(form.password.length<6) return setErr("Password 6+ chars.");
    }
    setLoading(true);
    try {
      const endpoint = mode==="register" ? "/api/signup" : "/api/login";
      const res = await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
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
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <style>{`@keyframes slideIn{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"16px 20px"}}>
        <div style={{fontWeight:800,fontSize:16,letterSpacing:-.3}}>
          <span style={{color:C.accent}}>Automated</span> <span style={{color:C.text}}>Financial</span>
        </div>
      </div>
      <Ticker cryptos={CRYPTOS}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px 100px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h1 style={{margin:0,fontSize:28,fontWeight:900,lineHeight:1.2}}>
            Grow Your Future<br/>
            <span style={{background:`linear-gradient(135deg,${C.accent},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Through Technology</span>
          </h1>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:360}}>
          <div style={{display:"flex",background:"#040A15",borderRadius:10,padding:4,marginBottom:22}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:mode===m?`linear-gradient(135deg,${C.accent},#0057FF)`:"transparent",color:mode===m?"#fff":C.muted}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mode==="register"&&<input style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}} name="name" placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>}
            <input style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}} name="email" type="email" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            <input style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}} name="password" type="password" placeholder="Password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            {mode==="register"&&<input style={{background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box"}} name="confirm" type="password" placeholder="Confirm" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))}/>}
            {err&&<div style={{color:C.red,fontSize:12,background:"#2A0A0A",padding:"8px 12px",borderRadius:7}}>{err}</div>}
            <button onClick={submit} disabled={loading} style={{background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:"pointer",opacity:loading?.7:1}}>
              {loading?"Please wait...":(mode==="login"?"Sign In →":"Create Account →")}
            </button>
          </div>
        </div>
      </div>
      <ToastStack toasts={toasts}/>
    </div>
  );
}

function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [token, setToken] = useState(()=>sessionStorage.getItem("afm_admin_token")||"");
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async() => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pwd})});
      const data = await res.json();
      if(!res.ok) return setErr(data.error||"Wrong password");
      sessionStorage.setItem("afm_admin_token", data.token);
      setToken(data.token);
      const usersRes = await fetch("/api/admin-users", {headers:{Authorization:`Bearer ${data.token}`}});
      const usersData = await usersRes.json();
      setUsers(usersData.users||[]);
    } catch(e) {
      setErr("Network error");
    }
    setLoading(false);
  };

  if(!token) {
    return (
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:40,width:"100%",maxWidth:420}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:40,marginBottom:12}}>🔐</div>
            <div style={{fontWeight:800,fontSize:22}}>Admin Dashboard</div>
          </div>
          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyPress={e=>e.key==="Enter"&&login()} placeholder="Admin password" style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"12px 16px",fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
          <button onClick={login} disabled={loading} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,cursor:"pointer",fontSize:14,opacity:loading?.7:1}}>
            {loading?"Checking...":"Unlock"}
          </button>
          {err&&<div style={{color:C.red,fontSize:12,textAlign:"center",marginTop:8}}>{err}</div>}
          <div style={{textAlign:"center",marginTop:16}}>
            <a href="/" style={{color:C.accent,fontSize:12,textDecoration:"none",cursor:"pointer"}}>← Back to platform</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.card,borderBottom:`1px solid ${C.gold}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:18,color:C.gold}}>⚙️ Admin Dashboard</div>
        <button onClick={()=>{sessionStorage.removeItem("afm_admin_token");setToken("");}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Sign Out</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>👥 Users ({users.length})</div>
        {users.map(u=>(
          <div key={u._id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:14}}>{u.name}</div>
            <div style={{fontSize:12,color:C.muted}}>{u.email}</div>
            <div style={{fontSize:12,color:C.green,fontWeight:700,marginTop:4}}>${(u.balance||0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("market");
  const [prices, setPrices] = useState(CRYPTOS);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("afm_token");
    if(!token) return setAuthChecked(true);
    fetch("/api/me", {headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>setUser(data.user))
      .catch(()=>localStorage.removeItem("afm_token"))
      .finally(()=>setAuthChecked(true));
  }, []);

  useEffect(() => {
    if(!user) return;
    const fire = () => {
      const t = makeToast(Math.random()>.5?"deposit":"withdraw");
      if(t) setToasts(p=>[t,...p].slice(0,3));
    };
    fire();
    const iv = setInterval(fire, 5000);
    return ()=>clearInterval(iv);
  }, [user]);

  useEffect(() => {
    if(!user) return;
    const iv = setInterval(() => setPrices(prev=>prev.map(c=>({...c,price:+(c.price*(1+(Math.random()-.49)*.002)).toFixed(c.price<1?4:2)}))) ,2000);
    return ()=>clearInterval(iv);
  }, [user]);

  if(!authChecked) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontFamily:"'Inter',system-ui,sans-serif"}}>Loading...</div>;
  if(!user) return <LoginPage onAuth={setUser}/>;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontWeight:700,fontSize:13}}>Automated Financial</div>
        <button onClick={()=>setUser(null)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12}}>Sign Out</button>
      </div>
      <Ticker cryptos={prices}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {tab==="market"&&<div style={{padding:14}}><div style={{fontSize:13,color:C.text}}>📈 Markets</div></div>}
        {tab==="portfolio"&&<div style={{padding:14}}><div style={{fontSize:13,color:C.text}}>💼 Portfolio</div></div>}
        {tab==="history"&&<div style={{padding:14}}><div style={{fontSize:13,color:C.text}}>📋 History</div></div>}
        {tab==="account"&&<div style={{padding:14}}><div style={{fontSize:13,color:C.text}}>👤 Account</div><div style={{marginTop:20}}><button onClick={()=>window.location.href="/admin"} style={{width:"100%",padding:"12px 0",borderRadius:10,border:`1px solid ${C.gold}`,background:`${C.gold}11`,color:C.gold,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:10}}>⚙️ Admin Panel</button></div></div>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#040A15",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {["market","portfolio","history","account"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:tab===t?"#0C1526":"transparent",color:tab===t?C.accent:C.muted,borderTop:tab===t?`2px solid ${C.accent}`:"2px solid transparent"}}>
            {t==="market"?"📈":(t==="portfolio"?"💼":(t==="history"?"📋":"👤"))} {t}
          </button>
        ))}
      </div>
      <ToastStack toasts={toasts}/>
    </div>
  );
}

export default function AppRouter(){
  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <AdminPage/> : <App/>;
}
