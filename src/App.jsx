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

// ── Support contact ────────────────────────────────────────────────────────
const SUPPORT_EMAIL = "cryptoforextraining@gmail.com";

function openSupportEmail(){
  const subject = "New Inquiry — Automated Financial Marketing";
  const body =
`Hello Automated Financial Marketing Team,

Welcome! Thank you for reaching out. To help us assess your account and trading goals properly, please answer the following before a specialist responds:

1) How would you like us to assess you?
   [ ] Beginner — New to crypto/forex, need full guidance
   [ ] Intermediate — Some experience, want optimized strategy
   [ ] Advanced — Experienced trader, want account scaling
   [ ] Institutional — Managing larger capital / a group

2) What is your primary goal?
   [ ] Long-term investment growth
   [ ] Active short-term trading
   [ ] Passive automated trading
   [ ] Not sure yet — need a recommendation

3) Estimated starting deposit range:
   [ ] $100 - $500
   [ ] $500 - $2,000
   [ ] $2,000 - $10,000
   [ ] $10,000+

Please reply with your selections (e.g. "1) Beginner, 2) Passive automated trading, 3) $500-$2,000") and our team will get back to you within 24 hours.

— Automated Financial Marketing Support`;

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function openWithdrawalEmail(userName, userEmail, amount, walletAddress, coinType){
  const subject = `Withdrawal Request — ${amount} ${coinType} from ${userName}`;
  const body =
`Withdrawal Request Details:

User Name: ${userName}
User Email: ${userEmail}
Amount: ${amount} ${coinType}
Wallet Address: ${walletAddress}
Requested At: ${new Date().toLocaleString()}

Status: Pending Review

Please verify this withdrawal request and process accordingly.

— Automated Financial Marketing System`;

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

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
}

// ── Toast Notifications ───────────────────────────────────────────────────────
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

  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    setErr("");
    if(!form.email||!form.password) return setErr("All fields are required.");
    if(mode==="register"){
      if(!form.name) return setErr("Full name is required.");
      if(form.password!==form.confirm) return setErr("Passwords don't match.");
      if(form.password.length<6) return setErr("Password must be 6+ characters.");
    }
    setLoading(true);
    try{
      const endpoint = mode==="register" ? "/api/signup" : "/api/login";
      const body = mode==="register"
        ? {name:form.name,email:form.email,password:form.password}
        : {email:form.email,password:form.password};
      const res = await fetch(endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
      });
      const data = await res.json();
      if(!res.ok){
        setErr(data.error||"Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      localStorage.setItem("afm_token", data.token);
      onAuth(data.user);
    }catch(e){
      setErr("Network error. Please check your connection and try again.");
    }
    setLoading(false);
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
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 20px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontWeight:700,fontSize:13,color:C.text}}>Automated Financial Marketing</div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px"}}>
          <span style={{fontSize:12}}>🕐</span>
          <span style={{fontSize:10,color:C.gold,fontFamily:"monospace"}}>{fmtTime(serverTime)}</span>
        </div>
      </div>

      {/* Logo Banner */}
      <div style={{position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0A1F3D,#0C2A4A)",padding:"22px 20px",borderBottom:`2px solid ${C.accent}`}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.25}} viewBox="0 0 400 140">
          {[...Array(14)].map((_,i)=>(
            <circle key={i} cx={Math.random()*400} cy={Math.random()*140} r="1.6" fill={C.accent}/>
          ))}
          <line x1="20" y1="20" x2="120" y2="60" stroke={C.accent} strokeWidth=".5"/>
          <line x1="120" y1="60" x2="220" y2="30" stroke={C.accent} strokeWidth=".5"/>
          <line x1="220" y1="30" x2="320" y2="90" stroke={C.accent} strokeWidth=".5"/>
          <line x1="60" y1="100" x2="180" y2="70" stroke={C.accent} strokeWidth=".5"/>
        </svg>
        <div style={{position:"relative",display:"flex",alignItems:"center",gap:14}}>
          <svg width="58" height="58" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="bullGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={C.gold}/>
                <stop offset="100%" stopColor={C.accent}/>
              </linearGradient>
            </defs>
            <path d="M50 12 L38 30 L20 24 L28 42 L15 50 L30 56 L25 75 L45 65 L50 88 L55 65 L75 75 L70 56 L85 50 L72 42 L80 24 L62 30 Z" fill="url(#bullGrad)" opacity="0.95"/>
            <circle cx="50" cy="52" r="20" fill="#0A1F3D"/>
            <path d="M38 44 Q50 36 62 44" stroke={C.gold} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="42" cy="52" r="3" fill={C.accent}/>
            <circle cx="58" cy="52" r="3" fill={C.accent}/>
            <path d="M44 62 Q50 67 56 62" stroke={C.gold} strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{fontWeight:900,fontSize:21,letterSpacing:-.5,color:"#fff",lineHeight:1.05}}>AUTOMATED</div>
            <div style={{fontWeight:900,fontSize:21,letterSpacing:-.5,background:`linear-gradient(90deg,${C.accent},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.05}}>FINANCIAL MARKETING</div>
          </div>
        </div>
      </div>

      <Ticker cryptos={CRYPTOS}/>

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

            <button onClick={submit} disabled={loading} style={{marginTop:4,background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,fontSize:14,cursor:loading?"default":"pointer",letterSpacing:.3,boxShadow:`0 4px 20px rgba(0,198,255,.3)`,opacity:loading?.7:1}}>
              {loading?"Please wait...":(mode==="login"?"Sign In →":"Create My Account →")}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{display:"flex",gap:16,marginTop:24,flexWrap:"wrap",justifyContent:"center"}}>
          {["🔒 SSL Secured","⚡ Instant Execution","🌍 Global Markets","💎 Pro Trading"].map(b=>(
            <div key={b} style={{fontSize:11,color:C.muted,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 12px"}}>{b}</div>
          ))}
        </div>
      </div>

      <button onClick={openSupportEmail} title="Chat with Support"
        style={{position:"fixed",bottom:24,right:16,width:54,height:54,borderRadius:"50%",
          background:`linear-gradient(135deg,${C.accent},#0057FF)`,border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,
          boxShadow:"0 6px 20px rgba(0,198,255,.4)",zIndex:150}}>
        💬
      </button>

      <ToastStack toasts={toasts}/>
    </div>
  );
}

// ── Trade Modal ───────────────────────────────────────────────────────────────
function TradeModal({crypto,user,onClose,onTrade}){
  const [side,setSide]=useState("buy");
  const [amount,setAmount]=useState("");
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  const usd=parseFloat(amount)||0;
  const qty=usd/crypto.price;
  const holding=(user.portfolio||[]).find(p=>p.id===crypto.id);

  const exec=async()=>{
    setMsg("");
    if(!usd||usd<=0) return setMsg("Enter a valid amount.");
    if(side==="buy"&&usd>user.balance) return setMsg("Insufficient balance. Please deposit first.");
    if(side==="sell"&&(!holding||holding.qty*crypto.price<usd)) return setMsg("Insufficient holdings.");
    setBusy(true);
    const ok=await onTrade(side,crypto,usd,qty);
    setBusy(false);
    if(ok){
      setMsg(side==="buy"?`✓ Bought ${qty.toFixed(6)} ${crypto.id}`:`✓ Sold ${qty.toFixed(6)} ${crypto.id}`);
      setAmount("");
    } else {
      setMsg("Trade failed. Please try again.");
    }
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
        </div>

        <div style={{color:C.muted,fontSize:12,marginBottom:12}}>
          Available: <span style={{color:C.text}}>
            {side==="buy"?`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`:
             holding?`${holding.qty.toFixed(6)} ${crypto.id}`:"0"}
          </span>
        </div>

        {msg&&<div style={{marginBottom:12,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}

        <button onClick={exec} disabled={busy} style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:busy?"default":"pointer",fontWeight:800,fontSize:14,opacity:busy?.7:1,
          background:side==="buy"?`linear-gradient(135deg,#16a34a,#15803d)`:`linear-gradient(135deg,#dc2626,#b91c1c)`,color:"#fff"}}>
          {busy?"Processing...":`${side==="buy"?"Buy":"Sell"} ${crypto.id}`}
        </button>
      </div>
    </div>
  );
}

// ── Withdrawal Modal ─────────────────────────────────────────────────────────
function WithdrawalModal({user,onClose}){
  const [amount,setAmount]=useState("");
  const [walletAddr,setWalletAddr]=useState("");
  const [coinType,setCoinType]=useState("BTC");
  const [msg,setMsg]=useState("");

  const submit=()=>{
    setMsg("");
    const n=parseFloat(amount);
    if(!n||n<=0) return setMsg("Enter a valid amount.");
    if(n>user.balance) return setMsg("Insufficient balance.");
    if(!walletAddr||walletAddr.length<20) return setMsg("Enter a valid wallet address.");
    
    // Send to email
    openWithdrawalEmail(user.name,user.email,n,walletAddr,coinType);
    setMsg(`✓ Withdrawal request sent! Check your email confirmation.`);
    setTimeout(()=>onClose(),2000);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:340,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>💸 Withdraw Funds</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        <div style={{background:"#0A1628",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:C.muted,lineHeight:1.6}}>
          Your available balance: <span style={{color:C.green,fontWeight:700}}>${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>

        <div style={{marginBottom:10,fontSize:13,color:C.subtext,fontWeight:600}}>Coin Type</div>
        <select value={coinType} onChange={e=>setCoinType(e.target.value)}
          style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:13,outline:"none",marginBottom:14,boxSizing:"border-box"}}>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="USDT">USDT (ERC20)</option>
          <option value="USDC">USDC (ERC20)</option>
          <option value="SOL">Solana (SOL)</option>
        </select>

        <div style={{marginBottom:6,fontSize:13,color:C.subtext,fontWeight:600}}>Withdrawal Amount</div>
        <div style={{position:"relative",marginBottom:14}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted}}>$</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
            style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px 10px 28px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[100,250,500,1000].map(v=>(
            user.balance>=v&&<button key={v} onClick={()=>setAmount(String(v))}
              style={{flex:1,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:6,color:C.subtext,fontSize:11,padding:"6px 0",cursor:"pointer"}}>
              ${v}
            </button>
          ))}
        </div>

        <div style={{marginBottom:6,fontSize:13,color:C.subtext,fontWeight:600}}>Wallet Address</div>
        <input type="text" value={walletAddr} onChange={e=>setWalletAddr(e.target.value)} placeholder="Your receiving wallet address..."
          style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px",fontSize:12,outline:"none",marginBottom:14,boxSizing:"border-box",fontFamily:"monospace"}}/>

        {msg&&<div style={{marginBottom:10,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}

        <button onClick={submit}
          style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,
            background:`linear-gradient(135deg,${C.gold},#D4A017)`,color:"#000"}}>
          💸 Send Withdrawal Request
        </button>
      </div>
    </div>
  );
}

// ── Deposit Modal ─────────────────────────────────────────────────────────────
function DepositModal({onClose}){
  const networks=[
    {name:"Bitcoin (BTC)",addr:"bc1qptzxttxd53jk3xqku3wdmlsfjy73hquerqhhy7",icon:"₿",color:"#F7931A"},
    {name:"USDT (ERC20)",addr:"0x1428c889083234E6F158EAD22397C578E410e3B2",icon:"₮",color:"#26A17B"},
    {name:"Solana (SOL)",addr:"FMn7bivQuYzKWaE5hLXJBbtNbxDez6jswXCsjqFKvk3U",icon:"◎",color:"#9945FF"},
    {name:"USDC (ERC20)",addr:"0x1428c889083234E6F158EAD22397C578E410e3B2",icon:"$",color:"#2775CA"},
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
        <button onClick={openSupportEmail}
          style={{width:"100%",marginTop:4,padding:"11px 0",borderRadius:10,border:`1px solid ${C.accent}`,background:`${C.accent}11`,color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          💬 Notify Support After Sending
        </button>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:8}}>After sending, contact support with your TX hash</div>
      </div>
    </div>
  );
}

// ── Admin Page (separate from user app) ──────────────────────────────────────
function AdminPage(){
  const [pwd,setPwd]=useState("");
  const [adminToken,setAdminToken]=useState(()=>sessionStorage.getItem("afm_admin_token")||"");
  const [authErr,setAuthErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [users,setUsers]=useState([]);
  const [deposits,setDeposits]=useState([]);
  const [selected,setSelected]=useState(null);
  const [addAmt,setAddAmt]=useState("");
  const [msg,setMsg]=useState("");
  const [search,setSearch]=useState("");
  const [tab,setTab]=useState("users");

  const fetchData=async(token)=>{
    setLoading(true);
    try{
      const res=await fetch("/api/admin-users",{headers:{Authorization:`Bearer ${token}`}});
      const data=await res.json();
      if(!res.ok){
        setAuthErr(data.error||"Failed to load");
        sessionStorage.removeItem("afm_admin_token");
        setAdminToken("");
      } else {
        setUsers(data.users||[]);
        setDeposits(data.deposits||[]);
      }
    }catch(e){
      setAuthErr("Network error loading admin data.");
    }
    setLoading(false);
  };

  useEffect(()=>{
    if(adminToken) fetchData(adminToken);
  },[]);

  const login=async()=>{
    setAuthErr("");
    setLoading(true);
    try{
      const res=await fetch("/api/admin-login",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pwd})
      });
      const data=await res.json();
      if(!res.ok){ setAuthErr(data.error||"Wrong password"); setLoading(false); return; }
      sessionStorage.setItem("afm_admin_token",data.token);
      setAdminToken(data.token);
      fetchData(data.token);
    }catch(e){
      setAuthErr("Network error. Please try again.");
      setLoading(false);
    }
  };

  const logout=()=>{
    sessionStorage.removeItem("afm_admin_token");
    setAdminToken("");
    setPwd("");
    setUsers([]);
    setDeposits([]);
  };

  if(!adminToken){
    return(
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:40,width:"100%",maxWidth:420,boxShadow:"0 24px 80px rgba(0,0,0,.6)"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:40,marginBottom:12}}>🔐</div>
            <div style={{fontWeight:800,fontSize:22,color:C.text}}>Admin Dashboard</div>
            <div style={{fontSize:13,color:C.muted,marginTop:6}}>Enter your admin password to continue</div>
          </div>

          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyPress={e=>e.key==="Enter"&&login()} placeholder="Admin password"
            style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"12px 16px",fontSize:14,outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
          
          <button onClick={login} disabled={loading}
            style={{width:"100%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",border:"none",borderRadius:10,padding:"12px 0",fontWeight:700,cursor:"pointer",fontSize:14,opacity:loading?.7:1,marginBottom:10}}>
            {loading?"Checking...":"Unlock Admin Access"}
          </button>

          {authErr&&<div style={{color:C.red,fontSize:12,textAlign:"center",background:"#2B0A0A",padding:"8px 12px",borderRadius:7,border:`1px solid #4A1010`}}>{authErr}</div>}

          <div style={{textAlign:"center",marginTop:16}}>
            <a href="/" style={{color:C.accent,fontSize:12,textDecoration:"none",cursor:"pointer"}}>← Back to platform</a>
          </div>
        </div>
      </div>
    );
  }

  const applyDeposit=async()=>{
    const n=parseFloat(addAmt);
    if(!n||n<=0||!selected) return setMsg("Enter a valid amount.");
    setLoading(true);
    try{
      const res=await fetch("/api/admin-add-balance",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${adminToken}`},
        body:JSON.stringify({userId:selected._id,amount:n,note:"Manual admin top-up"})
      });
      const data=await res.json();
      if(!res.ok){ setMsg(data.error||"Failed to add balance."); setLoading(false); return; }
      setMsg(`✓ Added $${n.toLocaleString()} to ${selected.name}'s balance!`);
      setAddAmt("");
      fetchData(adminToken);
      setSelected(s=>s?{...s,balance:data.newBalance}:s);
    }catch(e){
      setMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  const filtered=users.filter(u=>
    u.name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.gold}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          <div style={{fontWeight:800,fontSize:18,color:C.gold}}>⚙️ Admin Dashboard</div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>Automated Financial Marketing</div>
        </div>
        <button onClick={logout} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"8px 14px",fontSize:12,cursor:"pointer"}}>Sign Out</button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",background:"#040A15",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {["users","deposits"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"12px 0",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,
            background:tab===t?C.card:"transparent",color:tab===t?C.gold:C.muted,borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent"}}>
            {t==="users"?`👥 Users (${users.length})`:`💰 Deposits (${deposits.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {tab==="users"?(
          <>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."
              style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:13,outline:"none",marginBottom:16,boxSizing:"border-box"}}/>
            {filtered.length===0?(
              <div style={{textAlign:"center",color:C.muted,padding:40,fontSize:13}}>No users found.</div>
            ):filtered.map(u=>(
              <div key={u._id} onClick={()=>{setSelected(u);setMsg("");setAddAmt("");}}
                style={{background:selected?._id===u._id?`${C.gold}11`:C.card,border:`1px solid ${selected?._id===u._id?C.gold:C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:C.text}}>{u.name}</div>
                    <div style={{fontSize:12,color:C.muted}}>{u.email}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:4}}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontFamily:"monospace",fontSize:16,color:C.green}}>${(u.balance||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                    <div style={{fontSize:11,color:C.muted}}>{(u.portfolio||[]).length} position{u.portfolio?.length!==1?"s":""}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ):(
          deposits.length===0?(
            <div style={{textAlign:"center",color:C.muted,padding:40,fontSize:13}}>No deposits recorded yet.</div>
          ):deposits.map((d,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{d.userName}</div>
                  <div style={{fontSize:12,color:C.muted}}>{d.userEmail}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:4}}>{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div style={{fontWeight:800,fontFamily:"monospace",color:C.gold,fontSize:16}}>+${d.amount.toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Funds Panel */}
      {selected&&(
        <div style={{background:C.surface,borderTop:`1px solid ${C.gold}`,padding:20,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:C.text}}>💰 Add Balance: {selected.name}</div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{position:"relative",marginBottom:10}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted}}>$</span>
            <input type="number" value={addAmt} onChange={e=>setAddAmt(e.target.value)} placeholder="Amount"
              style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px 10px 28px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[100,500,1000,5000].map(v=>(
              <button key={v} onClick={()=>setAddAmt(String(v))}
                style={{flex:1,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:6,color:C.subtext,fontSize:11,padding:"6px 0",cursor:"pointer"}}>
                ${v}
              </button>
            ))}
          </div>
          {msg&&<div style={{marginBottom:10,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}
          <button onClick={applyDeposit} disabled={loading}
            style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:800,fontSize:13,
              background:`linear-gradient(135deg,${C.gold},#D4A017)`,color:"#000",opacity:loading?.7:1}}>
            {loading?"Processing...":"💰 Add Balance"}
          </button>
        </div>
      )}
    </div>
  );
}


  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  const [tab,setTab]=useState("market");
  const [prices,setPrices]=useState(CRYPTOS);
  const [charts,setCharts]=useState(()=>{
    const d={}; CRYPTOS.forEach(c=>{d[c.id]=genChart(c.price);}); return d;
  });
  const [txHistory,setTxHistory]=useState([]);
  const [tradeCrypto,setTradeCrypto]=useState(null);
  const [search,setSearch]=useState("");
  const [showDeposit,setShowDeposit]=useState(false);
  const [showWithdrawal,setShowWithdrawal]=useState(false);
  const [toasts,setToasts]=useState([]);
  const [tradeErr,setTradeErr]=useState("");

  // Restore session on load
  useEffect(()=>{
    const token=localStorage.getItem("afm_token");
    if(!token){ setAuthChecked(true); return; }
    fetch("/api/me",{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>setUser(data.user))
      .catch(()=>localStorage.removeItem("afm_token"))
      .finally(()=>setAuthChecked(true));
  },[]);

  // Periodically refresh balance/portfolio from server (e.g. after admin top-up)
  useEffect(()=>{
    if(!user) return;
    const token=localStorage.getItem("afm_token");
    if(!token) return;
    const iv=setInterval(()=>{
      fetch("/api/me",{headers:{Authorization:`Bearer ${token}`}})
        .then(r=>r.ok?r.json():null)
        .then(data=>{ if(data) setUser(data.user); })
        .catch(()=>{});
    },10000);
    return ()=>clearInterval(iv);
  },[user?.id]);

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

  const onTrade=async(side,crypto,usd,qty)=>{
    setTradeErr("");
    const token=localStorage.getItem("afm_token");
    if(!token) return setTradeErr("Session expired. Please sign in again.");
    try{
      const res=await fetch("/api/trade",{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({
          side, coinId:crypto.id, coinName:crypto.name, icon:crypto.icon, color:crypto.color,
          usd, qty, price:crypto.price
        })
      });
      const data=await res.json();
      if(!res.ok){ setTradeErr(data.error||"Trade failed."); return false; }
      setUser(data.user);
      setTxHistory(prev=>[{id:Date.now(),side,coinId:crypto.id,name:crypto.name,qty,usd,price:crypto.price,time:new Date().toLocaleTimeString()},...prev].slice(0,50));
      return true;
    }catch(e){
      setTradeErr("Network error. Please try again.");
      return false;
    }
  };

  const portfolioVal=user?(user.portfolio||[]).reduce((s,p)=>{const c=prices.find(x=>x.id===p.id);return s+(c?c.price*p.qty:0);},0):0;
  const totalVal=(user?.balance||0)+portfolioVal;
  const invested=user?(user.portfolio||[]).reduce((s,p)=>s+p.avgPrice*p.qty,0):0;
  const pnl=portfolioVal-invested;

  const signOut=()=>{
    localStorage.removeItem("afm_token");
    setUser(null);
  };

  if(!authChecked){
    return(
      <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontFamily:"'Inter',system-ui,sans-serif"}}>
        Loading...
      </div>
    );
  }

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
      `}</style>

      {/* Top Bar */}
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
          <div onClick={()=>setTab("account")} style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0057FF)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,cursor:"pointer"}}>
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
            </div>

            <button onClick={()=>setShowDeposit(true)} style={{width:"100%",marginBottom:14,padding:"12px 0",borderRadius:10,border:`1px solid ${C.accent}`,background:`${C.accent}11`,color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              + Deposit Funds
            </button>

            <div style={{fontWeight:700,fontSize:12,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Holdings</div>
            {(user.portfolio||[]).length===0?(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:28,marginBottom:8}}>📊</div>
                <div style={{fontSize:13}}>No positions yet. Buy some crypto to get started.</div>
              </div>
            ):(user.portfolio||[]).map(p=>{
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

            {[
              {label:"Total Portfolio Value",value:`$${totalVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`},
              {label:"Cash Balance",value:`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`},
              {label:"Positions",value:(user.portfolio||[]).length},
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
            <button onClick={()=>setShowWithdrawal(true)} style={{width:"100%",marginBottom:8,padding:"11px 0",borderRadius:10,border:`1px solid ${C.gold}`,background:`${C.gold}11`,color:C.gold,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              💸 Withdraw Funds
            </button>
            <button onClick={signOut} style={{width:"100%",padding:"11px 0",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.red,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Floating Chat Button */}
      <button onClick={openSupportEmail} title="Chat with Support"
        style={{position:"fixed",bottom:78,right:16,width:52,height:52,borderRadius:"50%",
          background:`linear-gradient(135deg,${C.accent},#0057FF)`,border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
          boxShadow:"0 6px 20px rgba(0,198,255,.4)",zIndex:150}}>
        💬
      </button>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#040A15",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {navBtn("market","Market","📈")}
        {navBtn("portfolio","Portfolio","💼")}
        {navBtn("history","History","📋")}
        {navBtn("account","Account","👤")}
      </div>

      <ToastStack toasts={toasts}/>
      {tradeCrypto&&<TradeModal crypto={tradeCrypto} user={user} onClose={()=>setTradeCrypto(null)} onTrade={(s,c,u,q)=>{onTrade(s,c,u,q);}}/>}
      {showDeposit&&<DepositModal onClose={()=>setShowDeposit(false)}/>}
      {showWithdrawal&&<WithdrawalModal user={user} onClose={()=>setShowWithdrawal(false)}/>}
    </div>
  );
}

// ── Routing wrapper ──────────────────────────────────────────────────────────
export default function AppRouter(){
  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <AdminPage/> : <App/>;
}
