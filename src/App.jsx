import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       "#050B18",
  surface:  "#0C1526",
  card:     "#111E35",
  border:   "#1A2D4A",
  accent:   "#00C6FF",
  gold:     "#F4C430",
  green:    "#00E676",
  red:      "#FF4B4B",
  muted:    "#4A6080",
  text:     "#D6E8FF",
  subtext:  "#7090B0",
};

// ── Crypto Data ───────────────────────────────────────────────────────────────
const CRYPTOS = [
  { id:"BTC",  name:"Bitcoin",   price:67843.21, change: 2.34, icon:"₿", color:"#F7931A" },
  { id:"ETH",  name:"Ethereum",  price:3521.80,  change:-1.12, icon:"Ξ", color:"#627EEA" },
  { id:"SOL",  name:"Solana",    price:182.44,   change: 5.67, icon:"◎", color:"#9945FF" },
  { id:"BNB",  name:"BNB",       price:608.30,   change: 0.88, icon:"B", color:"#F3BA2F" },
  { id:"ADA",  name:"Cardano",   price:0.4812,   change:-2.45, icon:"₳", color:"#0096D6" },
  { id:"XRP",  name:"XRP",       price:0.5923,   change: 1.23, icon:"✕", color:"#00AAE4" },
  { id:"DOGE", name:"Dogecoin",  price:0.1634,   change: 3.91, icon:"Ð", color:"#C2A633" },
  { id:"AVAX", name:"Avalanche", price:38.92,    change:-0.77, icon:"▲", color:"#E84142" },
];

// ── Fake user names for social proof ─────────────────────────────────────────
const FAKE_NAMES = [
  "James K.","Maria S.","Ahmed R.","Liu W.","Fatima O.","Carlos M.","Priya N.",
  "David T.","Sophie L.","Omar A.","Anna B.","Kwame D.","Elena V.","Michael J.",
  "Hana M.","Ibrahim F.","Grace Y.","Luca P.","Aisha C.","Nathan H.",
];
const FAKE_AMOUNTS = [500,1000,2500,5000,750,1200,3000,800,4500,2000,350,1800,600,10000,250];
const COUNTRIES    = ["🇺🇸","🇬🇧","🇳🇬","🇨🇦","🇦🇺","🇩🇪","🇫🇷","🇿🇦","🇮🇳","🇧🇷","🇦🇪","🇸🇬"];

const randItem = arr => arr[Math.floor(Math.random() * arr.length)];

function makeToast(type) {
  const name   = randItem(FAKE_NAMES);
  const amount = randItem(FAKE_AMOUNTS);
  const flag   = randItem(COUNTRIES);
  const coin   = randItem(CRYPTOS);
  if (type === "register") return { id: Date.now()+Math.random(), type:"register", text:`${flag} ${name} just created an account`, icon:"🎉" };
  if (type === "deposit")  return { id: Date.now()+Math.random(), type:"deposit",  text:`${flag} ${name} deposited $${amount.toLocaleString()}`, icon:"💰" };
  if (type === "withdraw") return { id: Date.now()+Math.random(), type:"withdraw", text:`${flag} ${name} withdrew $${amount.toLocaleString()} profit`, icon:"🏆" };
  if (type === "trade")    return { id: Date.now()+Math.random(), type:"trade",    text:`${flag} ${name} bought ${coin.id}`, icon:"📈" };
  return null;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, up }) {
  const w=80, h=32;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={up?C.green:C.red} strokeWidth="1.5"/>
    </svg>
  );
}

function genChart(base,n=20){
  let v=base; const d=[];
  for(let i=0;i<n;i++){v=v*(1+(Math.random()-0.48)*0.03);d.push(+v.toFixed(2));}
  return d;
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ cryptos }) {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    let pos=0; const half=el.scrollWidth/2;
    let raf; const tick=()=>{
      pos+=0.5; if(pos>=half)pos=0;
      el.style.transform=`translateX(-${pos}px)`;
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);
  const items=[...cryptos,...cryptos];
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
    }// ── Toast Notifications ───────────────────────────────────────────────────────
function ToastStack({ toasts }) {
  return (
    <div style={{position:"fixed",bottom:80,left:12,right:12,zIndex:200,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
      {toasts.slice(0,3).map(t=>(
        <div key={t.id} style={{
          background:"rgba(11,20,40,0.95)",border:`1px solid ${C.border}`,
          borderLeft:`3px solid ${t.type==="withdraw"?C.gold:t.type==="deposit"?C.green:C.accent}`,
          borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,
          backdropFilter:"blur(12px)",animation:"slideIn .3s ease",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"
        }}>
          <span style={{fontSize:18}}>{t.icon}</span>
          <span style={{fontSize:12,color:C.text,lineHeight:1.4}}>{t.text}</span>
          <span style={{marginLeft:"auto",fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>just now</span>
        </div>
      ))}
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onAuth }) {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:""});
  const [err,setErr]=useState("");
  const [toasts,setToasts]=useState([]);
  const [serverTime,setServerTime]=useState(new Date());

  // Live clock
  useEffect(()=>{
    const t=setInterval(()=>setServerTime(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  // Pre-login social proof toasts
  useEffect(()=>{
    const types=["register","deposit","withdraw","trade"];
    const fire=()=>{
      const toast=makeToast(randItem(types));
      setToasts(p=>[toast,...p].slice(0,3));
      setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==toast.id)),4000);
    };
    fire();
    const iv=setInterval(fire,3500);
    return ()=>clearInterval(iv);
  },[]);

  const handle=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));

  const submit=()=>{
    setErr("");
    if(!form.email||!form.password) return setErr("All fields are required.");
    if(mode==="register"){
      if(!form.name) return setErr("Full name is required.");
      if(form.password!==form.confirm) return setErr("Passwords don't match.");
      if(form.password.length<6) return setErr("Password must be 6+ characters.");
    }
    onAuth({name:form.name||form.email.split("@")[0],email:form.email,balance:0,portfolio:[]});
  };

  const fmtTime=d=>{
    const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    const pad=n=>String(n).padStart(2,"0");
    const h=d.getHours(),ampm=h>=12?"PM":"AM",h12=((h%12)||12);
    return `${d.getDate()}, ${months[d.getMonth()]} ${d.getFullYear()} / ${pad(h12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${ampm}`;
  };

  const inp={
    background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,
    color:C.text,padding:"12px 16px",fontSize:14,width:"100%",outline:"none",
    boxSizing:"border-box",fontFamily:"inherit",
    transition:"border-color .2s",
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes slideIn{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,198,255,.2)}50%{box-shadow:0 0 24px rgba(0,198,255,.5)}}
        input:focus{border-color:${C.accent}!important}
      `}</style>

      {/* Header */}
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#fff"}}>AF</div>
          <div>
            <div style={{fontWeight:800,fontSize:15,letterSpacing:-.3,lineHeight:1}}>
              <span style={{color:C.accent}}>Automated</span>
              <span style={{color:C.text}}> Financial</span>
            </div>
            <div style={{fontSize:9,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Marketing</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px"}}>
          <span style={{fontSize:14}}>🕐</span>
          <div>
            <div style={{fontSize:9,color:C.muted}}>Server time</div>
            <div style={{fontSize:11,color:C.gold,fontFamily:"monospace"}}>{fmtTime(serverTime)}</div>
          </div>
        </div>
      </div><Ticker cryptos={CRYPTOS}/>

      {/* Hero */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px 100px"}}>
        {/* Tagline */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:11,color:C.accent,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Institutional-Grade Crypto Platform</div>
          <h1 style={{margin:0,fontSize:28,fontWeight:900,lineHeight:1.2,letterSpacing:-.5}}>
            Grow Your Future<br/>
            <span style={{background:`linear-gradient(135deg,${C.accent},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Through Technology</span>
          </h1>
          <p style={{margin:"10px 0 0",color:C.subtext,fontSize:13}}>Trade crypto assets with confidence</p>
        </div>

        {/* Auth Card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:360,boxShadow:"0 24px 80px rgba(0,0,0,.6)",animation:"glow 3s infinite"}}>
          <div style={{display:"flex",background:"#040A15",borderRadius:10,padding:4,marginBottom:22}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}}
                style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
                  background:mode===m?`linear-gradient(135deg,${C.accent},#0057FF)`:"transparent",
                  color:mode===m?"#fff":C.muted,transition:"all .2s"}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mode==="register"&&<input style={inp} name="name" placeholder="Full name" value={form.name} onChange={handle}/>}
            <input style={inp} name="email" type="email" placeholder="Email address" value={form.email} onChange={handle}/>
            <input style={inp} name="password" type="password" placeholder="Password" value={form.password} onChange={handle}/>
            {mode==="register"&&<input style={inp} name="confirm" type="password" placeholder="Confirm password" value={form.confirm} onChange={handle}/>}

            {err&&<div style={{color:C.red,fontSize:12,background:"#2A0A0A",padding:"8px 12px",borderRadius:7,border:`1px solid #4A1010`}}>{err}</div>}

            <button onClick={submit} style={{marginTop:4,background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:"pointer",letterSpacing:.3,boxShadow:`0 4px 20px rgba(0,198,255,.3)`}}>
              {mode==="login"?"Sign In →":"Create My Account →"}
            </button>

            {mode==="login"&&<div style={{textAlign:"center",color:C.muted,fontSize:12,marginTop:2}}>Demo: any email + password</div>}
          </div>
        </div>

        {/* Trust badges */}
        <div style={{display:"flex",gap:16,marginTop:24,flexWrap:"wrap",justifyContent:"center"}}>
          {["🔒 SSL Secured","⚡ Instant Execution","🌍 Global Markets","💎 Pro Trading"].map(b=>(
            <div key={b} style={{fontSize:11,color:C.muted,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 12px"}}>{b}</div>
          ))}
        </div>
      </div>

      <ToastStack toasts={toasts}/>
    </div>
  );
}

// ── Trade Modal ───────────────────────────────────────────────────────────────
function TradeModal({crypto,user,onClose,onTrade}){
  const [side,setSide]=useState("buy");
  const [amount,setAmount]=useState("");
  const [msg,setMsg]=useState("");
  const usd=parseFloat(amount)||0;
  const qty=usd/crypto.price;
  const holding=user.portfolio.find(p=>p.id===crypto.id);

  const exec=()=>{
    setMsg("");
    if(!usd||usd<=0) return setMsg("Enter a valid amount.");
    if(side==="buy"&&usd>user.balance) return setMsg("Insufficient balance. Please deposit first.");
    if(side==="sell"&&(!holding||holding.qty*crypto.price<usd)) return setMsg("Insufficient holdings.");
    onTrade(side,crypto,usd,qty);
    setMsg(side==="buy"?`✓ Bought ${qty.toFixed(6)} ${crypto.id}`:`✓ Sold ${qty.toFixed(6)} ${crypto.id}`);
    setAmount("");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:340,boxShadow:"0 32px 80px rgba(0,0,0,.7)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24,background:crypto.color+"22",borderRadius:8,padding:"4px 10px",color:crypto.color}}>{crypto.icon}</span>
            <div><div style={{fontWeight:700}}>{crypto.name}</div><div style={{fontSize:12,color:C.muted}}>{crypto.id}</div></div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{background:"#040A15",borderRadius:8,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.muted,fontSize:13}}>Market Price</span>
          <span style={{color:C.text,fontWeight:700,fontFamily:"monospace"}}>${crypto.price.toLocaleString()}</span>
        </div>

        <div style={{display:"flex",background:"#040A15",borderRadius:8,padding:4,marginBottom:14}}>
          {["buy","sell"].map(s=>(
            <button key={s} onClick={()=>setSide(s)} style={{flex:1,padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
              background:side===s?(s==="buy"?"#0D2B1A":"#2B0A0A"):"transparent",
              color:side===s?(s==="buy"?C.green:C.red):C.muted}}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{position:"relative",marginBottom:8}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted}}>$</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
            style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px 10px 28px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>

        {usd>0&&<div style={{color:C.muted,fontSize:12,marginBottom:10,textAlign:"right"}}>≈ {qty.toFixed(6)} {crypto.id}</div>}

        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[25,50,75,100].map(pct=>(
            <button key={pct} onClick={()=>{
              const max=side==="buy"?user.balance:(holding?holding.qty*crypto.price:0);
              setAmount((max*pct/100).toFixed(2));
            }} style={{flex:1,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:6,color:C.subtext,fontSize:11,padding:"5px 0",cursor:"pointer"}}>
              {pct}%
            </button>
          ))}
        </div><div style={{color:C.muted,fontSize:12,marginBottom:12}}>
          Available: <span style={{color:C.text}}>
            {side==="buy"?`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`:
             holding?`${holding.qty.toFixed(6)} ${crypto.id}`:"0"}
          </span>
        </div>

        {msg&&<div style={{marginBottom:12,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}

        <button onClick={exec} style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,
          background:side==="buy"?`linear-gradient(135deg,#16a34a,#15803d)`:`linear-gradient(135deg,#dc2626,#b91c1c)`,color:"#fff"}}>
          {side==="buy"?"Buy":"Sell"} {crypto.id}
        </button>
      </div>
    </div>
  );
}

// ── Admin Panel (password gated) ──────────────────────────────────────────────
function AdminPanel({user,setUser,onClose}){
  const [pwd,setPwd]=useState("");
  const [auth,setAuth]=useState(false);
  const [addAmt,setAddAmt]=useState("");
  const [msg,setMsg]=useState("");
  const ADMIN_PWD="admin2024";// change this

  if(!auth){
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:32,width:320}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:28,marginBottom:8}}>🔐</div>
            <div style={{fontWeight:700,fontSize:16,color:C.text}}>Admin Access</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>Enter admin password</div>
          </div>
          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Admin password"
            style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
          <button onClick={()=>{if(pwd===ADMIN_PWD)setAuth(true);else setMsg("Wrong password");}}
            style={{width:"100%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,cursor:"pointer"}}>
            Unlock
          </button>
          {msg&&<div style={{color:C.red,fontSize:12,textAlign:"center",marginTop:8}}>{msg}</div>}
          <button onClick={onClose} style={{width:"100%",marginTop:8,background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 0",color:C.muted,cursor:"pointer",fontSize:13}}>Cancel</button>
        </div>
      </div>
    );
  }

  const applyDeposit=()=>{
    const n=parseFloat(addAmt);
    if(!n||n<=0) return setMsg("Enter a valid amount.");
    setUser(prev=>({...prev,balance:prev.balance+n}));
    setMsg(`✓ Added $${n.toLocaleString()} to ${user.name}'s balance!`);
    setAddAmt("");
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.gold}`,borderRadius:18,padding:32,width:340,boxShadow:`0 0 40px rgba(244,196,48,.2)`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:16,color:C.gold}}>⚙️ Admin Panel</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{background:"#040A15",borderRadius:10,padding:"12px 14px",marginBottom:18}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Current User</div>
          <div style={{fontWeight:700,color:C.text}}>{user.name}</div>
          <div style={{fontSize:12,color:C.muted}}>{user.email}</div>
          <div style={{marginTop:8,fontSize:11,color:C.muted}}>Balance: <span style={{color:C.green,fontWeight:700,fontFamily:"monospace"}}>${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
        </div>

        <div style={{marginBottom:6,fontSize:13,color:C.subtext,fontWeight:600}}>Add Funds to Account</div>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted}}>$</span>
          <input type="number" value={addAmt} onChange={e=>setAddAmt(e.target.value)} placeholder="Amount to add"
            style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px 10px 28px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[100,500,1000,5000].map(v=>(
            <button key={v} onClick={()=>setAddAmt(String(v))}
              style={{flex:1,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:6,color:C.subtext,fontSize:11,padding:"6px 0",cursor:"pointer"}}>
              ${v}
            </button>
          ))}
        </div>

        {msg&&<div style={{marginBottom:10,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}

        <button onClick={applyDeposit}
          style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,
            background:`linear-gradient(135deg,${C.gold},#D4A017)`,color:"#000"}}>
          💰 Add Balance
        </button>
      </div>
    </div>
  );
}

// ── Deposit Modal ─────────────────────────────────────────────────────────────
function DepositModal({onClose}){
  const networks=[
    {name:"Bitcoin (BTC)",addr:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",icon:"₿",color:"#F7931A"},
    {name:"USDT (TRC20)",addr:"TRx7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6",icon:"₮",color:"#26A17B"},
    {name:"Ethereum (ETH)",addr:"0x742d35Cc6634C0532925a3b844Bc454e4438f44e",icon:"Ξ",color:"#627EEA"},
  ];
  const [copied,setCopied]=useState(null);
  const copy=(addr,name)=>{
    navigator.clipboard?.writeText(addr);
    setCopied(name);
    setTimeout(()=>setCopied(null),2000);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:340,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>💳 Deposit Funds</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{background:"#0A1628",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:C.muted,lineHeight:1.6}}>
          Send your deposit to one of the addresses below. Your balance will be updated after confirmation. Minimum deposit: <span style={{color:C.accent}}>$50</span>
        </div>
        {networks.map(n=>(
          <div key={n.name} style={{background:"#040A15",border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{color:n.color,fontWeight:700,fontSize:18}}>{n.icon}</span>
              <span style={{fontWeight:700,fontSize:13,color:C.text}}>{n.name}</span>
            </div>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.muted,wordBreak:"break-all",marginBottom:8,padding:"8px 10px",background:"#0C1526",borderRadius:6}}>{n.addr}</div>
            <button onClick={()=>copy(n.addr,n.name)}
              style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1px solid ${C.border}`,background:"#0A1628",color:copied===n.name?C.green:C.subtext,fontSize:12,cursor:"pointer",fontWeight:600}}>
              {copied===n.name?"✓ Copied!":"Copy Address"}
            </button>
          </div>
        ))}
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:4}}>After sending, contact support with your TX hash</div>
      </div>
    </div>
  );
      }// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("market");
  const [prices,setPrices]=useState(CRYPTOS);
  const [charts,setCharts]=useState(()=>{
    const d={}; CRYPTOS.forEach(c=>{d[c.id]=genChart(c.price);}); return d;
  });
  const [txHistory,setTxHistory]=useState([]);
  const [tradeCrypto,setTradeCrypto]=useState(null);
  const [search,setSearch]=useState("");
  const [showAdmin,setShowAdmin]=useState(false);
  const [showDeposit,setShowDeposit]=useState(false);
  const [toasts,setToasts]=useState([]);

  // Post-login social proof toasts
  useEffect(()=>{
    if(!user) return;
    const types=["deposit","withdraw","trade"];
    const fire=()=>{
      const t=makeToast(randItem(types));
      setToasts(p=>[t,...p].slice(0,3));
      setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),4500);
    };
    fire();
    const iv=setInterval(fire,5000);
    return ()=>clearInterval(iv);
  },[user]);

  // Price simulation
  useEffect(()=>{
    if(!user) return;
    const iv=setInterval(()=>{
      setPrices(prev=>prev.map(c=>{
        const d=(Math.random()-.49)*.002;
        return {...c,price:+(c.price*(1+d)).toFixed(c.price<1?4:2)};
      }));
    },2000);
    return ()=>clearInterval(iv);
  },[user]);

  const onTrade=(side,crypto,usd,qty)=>{
    setUser(prev=>{
      const portfolio=[...prev.portfolio];
      const idx=portfolio.findIndex(p=>p.id===crypto.id);
      if(side==="buy"){
        if(idx>=0) portfolio[idx]={...portfolio[idx],qty:portfolio[idx].qty+qty,avgPrice:(portfolio[idx].avgPrice*portfolio[idx].qty+usd)/(portfolio[idx].qty+qty)};
        else portfolio.push({id:crypto.id,name:crypto.name,qty,avgPrice:crypto.price,icon:crypto.icon,color:crypto.color});
        return {...prev,balance:prev.balance-usd,portfolio};
      } else {
        if(idx>=0){
          const nq=portfolio[idx].qty-qty;
          if(nq<=0.000001)portfolio.splice(idx,1);
          else portfolio[idx]={...portfolio[idx],qty:nq};
        }
        return {...prev,balance:prev.balance+usd,portfolio};
      }
    });
    setTxHistory(prev=>[{id:Date.now(),side,coinId:crypto.id,name:crypto.name,qty,usd,price:crypto.price,time:new Date().toLocaleTimeString()},...prev].slice(0,50));
  };

  const portfolioVal=user?user.portfolio.reduce((s,p)=>{const c=prices.find(x=>x.id===p.id);return s+(c?c.price*p.qty:0);},0):0;
  const totalVal=(user?.balance||0)+portfolioVal;
  const invested=user?user.portfolio.reduce((s,p)=>s+p.avgPrice*p.qty,0):0;
  const pnl=portfolioVal-invested;

  if(!user) return <LoginPage onAuth={u=>setUser(u)}/>;

  const filtered=prices.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.id.toLowerCase().includes(search.toLowerCase()));

  const navBtn=(id,label,icon)=>(
    <button onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
      background:tab===id?"#0C1526":"transparent",color:tab===id?C.accent:C.muted,
      borderTop:tab===id?`2px solid ${C.accent}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:16}}>{icon}</span>{label}
    </button>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes slideIn{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes fadeUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#040A15}::-webkit-scrollbar-thumb{background:#1A2D4A;border-radius:2px}
        input:focus{border-color:${C.accent}!important;outline:none}
      `}</style>{/* Top Bar */}
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#fff"}}>AF</div>
          <div>
            <div style={{fontWeight:800,fontSize:13,letterSpacing:-.3,lineHeight:1}}>
              <span style={{color:C.accent}}>Automated</span><span style={{color:C.text}}> Financial</span>
            </div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Marketing</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.muted}}>Portfolio</div>
            <div style={{fontSize:13,fontWeight:800,color:C.text,fontFamily:"monospace"}}>${totalVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
          <div onClick={()=>setShowAdmin(true)} style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,cursor:"pointer"}}>
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </div>

      <Ticker cryptos={prices}/>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:72}}>

        {/* MARKET */}
        {tab==="market"&&(
          <div style={{padding:"14px 14px 0"}}>
            {/* Deposit CTA */}
            <div onClick={()=>setShowDeposit(true)} style={{background:`linear-gradient(135deg,#0C2040,#0A1A30)`,border:`1px solid ${C.accent}`,borderRadius:14,padding:"14px 16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,animation:"fadeUp .4s ease"}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${C.accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💳</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:C.text}}>Fund Your Account</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Deposit crypto & start trading instantly</div>
              </div>
              <span style={{color:C.accent,fontSize:18}}>›</span>
            </div>

            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coins..."
              style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:13,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

            {filtered.map(c=>(
              <div key={c.id} onClick={()=>setTradeCrypto(c)}
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"55"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{width:40,height:40,borderRadius:10,background:c.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:c.color,fontWeight:700,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{c.id}</div>
                </div>
                <div style={{marginRight:6}}><Sparkline data={charts[c.id]||[c.price]} up={c.change>=0}/></div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontWeight:700,fontFamily:"monospace",fontSize:13}}>${c.price<1?c.price.toFixed(4):c.price.toLocaleString()}</div>
                  <div style={{fontSize:11,fontWeight:700,color:c.change>=0?C.green:C.red}}>{c.change>=0?"▲":"▼"}{Math.abs(c.change)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PORTFOLIO */}
        {tab==="portfolio"&&(
          <div style={{padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {label:"Total Balance",value:`$${totalVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,sub:"USD Value",color:C.accent},
                {label:"Cash",value:`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,sub:"Available",color:C.green},
                {label:"Invested",value:`$${invested.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,sub:"Cost Basis",color:C.gold},
                {label:"P&L",value:`${pnl>=0?"+":""}$${pnl.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,sub:"Unrealized",color:pnl>=0?C.green:C.red},
              ].map(card=>(
                <div key={card.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:5}}>{card.label}</div>
                  <div style={{fontSize:17,fontWeight:800,fontFamily:"monospace",color:card.color}}>{card.value}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2}}>{card.sub}</div>
                </div>
              ))}
            </div><button onClick={()=>setShowDeposit(true)} style={{width:"100%",marginBottom:14,padding:"12px 0",borderRadius:10,border:`1px solid ${C.accent}`,background:`${C.accent}11`,color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              + Deposit Funds
            </button>

            <div style={{fontWeight:700,fontSize:12,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Holdings</div>
            {user.portfolio.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:28,marginBottom:8}}>📊</div>
                <div style={{fontSize:13}}>No positions yet. Buy some crypto to get started.</div>
              </div>
            ):user.portfolio.map(p=>{
              const lp=prices.find(x=>x.id===p.id)?.price||p.avgPrice;
              const cv=lp*p.qty,cost=p.avgPrice*p.qty,gain=cv-cost,gp=(gain/cost)*100;
              return(
                <div key={p.id} onClick={()=>setTradeCrypto(prices.find(x=>x.id===p.id))}
                  style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px",marginBottom:8,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:34,height:34,borderRadius:8,background:p.color+"22",display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:700}}>{p.icon}</div>
                      <div><div style={{fontWeight:700,fontSize:13}}>{p.id}</div><div style={{fontSize:11,color:C.muted}}>{p.qty.toFixed(6)}</div></div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontFamily:"monospace",fontSize:13}}>${cv.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                      <div style={{fontSize:11,color:gain>=0?C.green:C.red}}>{gain>=0?"+":""}{gp.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* HISTORY */}
        {tab==="history"&&(
          <div style={{padding:14}}>
            <div style={{fontWeight:700,fontSize:12,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Transaction History</div>
            {txHistory.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:28,marginBottom:8}}>📋</div>
                <div style={{fontSize:13}}>No transactions yet.</div>
              </div>
            ):txHistory.map(tx=>(
              <div key={tx.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:30,height:30,borderRadius:8,background:tx.side==="buy"?"#052e16":"#450a0a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
                    {tx.side==="buy"?"↓":"↑"}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:12,textTransform:"capitalize"}}>{tx.side} {tx.coinId}</div>
                    <div style={{fontSize:10,color:C.muted}}>{tx.time} · {tx.qty.toFixed(6)}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:12,color:tx.side==="buy"?C.red:C.green}}>{tx.side==="buy"?"-":"+"}${tx.usd.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontSize:10,color:C.muted}}>@ ${tx.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACCOUNT */}
        {tab==="account"&&(
          <div style={{padding:14}}>
            <div style={{background:`linear-gradient(135deg,#0C2040,#0A1A30)`,border:`1px solid ${C.border}`,borderRadius:16,padding:22,marginBottom:14,textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,margin:"0 auto 10px"}}>
                {user.name[0].toUpperCase()}
              </div>
              <div style={{fontWeight:800,fontSize:17}}>{user.name}</div>
              <div style={{color:C.muted,fontSize:12,marginTop:2}}>{user.email}</div>
              <div style={{marginTop:12,background:"#040A15",borderRadius:8,padding:"8px 18px",display:"inline-block"}}>
                <div style={{fontSize:10,color:C.muted}}>Account Status</div>
                <div style={{color:C.green,fontWeight:700,fontSize:12}}>✓ Verified</div>
              </div>
            </div>

            {[{label:"Total Portfolio Value",value:`$${totalVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`},
              {label:"Cash Balance",value:`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`},
              {label:"Positions",value:user.portfolio.length},
              {label:"Total Trades",value:txHistory.length},
            ].map(row=>(
              <div key={row.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.muted,fontSize:13}}>{row.label}</span>
                <span style={{fontWeight:700,fontSize:13}}>{row.value}</span>
              </div>
            ))}

            <button onClick={()=>setShowDeposit(true)} style={{width:"100%",marginTop:6,marginBottom:8,padding:"12px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              💳 Deposit Funds
            </button>
            <button onClick={()=>setShowAdmin(true)} style={{width:"100%",marginBottom:8,padding:"11px 0",borderRadius:10,border:`1px solid ${C.gold}`,background:`${C.gold}11`,color:C.gold,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              ⚙️ Admin Panel
            </button>
            <button onClick={()=>setUser(null)} style={{width:"100%",padding:"11px 0",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.red,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#040A15",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {navBtn("market","Market","📈")}
        {navBtn("portfolio","Portfolio","💼")}
        {navBtn("history","History","📋")}
        {navBtn("account","Account","👤")}
      </div>

      <ToastStack toasts={toasts}/>
      {tradeCrypto&&<TradeModal crypto={tradeCrypto} user={user} onClose={()=>setTradeCrypto(null)} onTrade={(s,c,u,q)=>{onTrade(s,c,u,q);}}/>}
      {showAdmin&&<AdminPanel user={user} setUser={setUser} onClose={()=>setShowAdmin(false)}/>}
      {showDeposit&&<DepositModal onClose={()=>setShowDeposit(false)}/>}
    </div>
  );
                                                             }
