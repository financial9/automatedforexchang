import { useState, useEffect, useRef } from "react";

// --- Mock Data ---
const CRYPTOS = [
  { id: "BTC", name: "Bitcoin",  price: 67843.21, change: 2.34,  icon: "₿", color: "#F7931A" },
  { id: "ETH", name: "Ethereum", price: 3521.80,  change: -1.12, icon: "Ξ", color: "#627EEA" },
  { id: "SOL", name: "Solana",   price: 182.44,   change: 5.67,  icon: "◎", color: "#9945FF" },
  { id: "BNB", name: "BNB",      price: 608.30,   change: 0.88,  icon: "B", color: "#F3BA2F" },
  { id: "ADA", name: "Cardano",  price: 0.4812,   change: -2.45, icon: "A", color: "#0033AD" },
  { id: "XRP", name: "XRP",      price: 0.5923,   change: 1.23,  icon: "X", color: "#00AAE4" },
  { id: "DOGE", name: "Dogecoin",price: 0.1634,   change: 3.91,  icon: "D", color: "#C2A633" },
  { id: "AVAX", name: "Avalanche",price:38.92,    change: -0.77, icon: "A", color: "#E84142" },
];

const generateChart = (base, points = 20) => {
  const data = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    val = val * (1 + (Math.random() - 0.48) * 0.03);
    data.push(+val.toFixed(2));
  }
  return data;
};

// --- Mini Sparkline ---
function Sparkline({ data, color, up }) {
  const w = 80, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.5" />
    </svg>
  );
}

// --- Ticker Strip ---
function TickerStrip({ cryptos }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    const half = el.scrollWidth / 2;
    const raf = requestAnimationFrame(function tick() {
      pos += speed;
      if (pos >= half) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...cryptos, ...cryptos];
  return (
    <div style={{ overflow: "hidden", background: "#0f172a", borderBottom: "1px solid #1e293b", height: 36, display: "flex", alignItems: "center" }}>
      <div ref={ref} style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}>
        {items.map((c, i) => (
          <span key={i} style={{ padding: "0 28px", fontSize: 12, color: c.change >= 0 ? "#22c55e" : "#ef4444", fontFamily: "monospace", display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: "#94a3b8" }}>{c.id}</span>
            <span style={{ color: "#e2e8f0" }}>${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString()}</span>
            <span>{c.change >= 0 ? "▲" : "▼"}{Math.abs(c.change)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Auth Forms ---
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = () => {
    setError("");
    if (!form.email || !form.password) return setError("All fields are required.");
    if (mode === "register") {
      if (!form.name) return setError("Name is required.");
      if (form.password !== form.confirm) return setError("Passwords don't match.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    }
    onAuth({ name: form.name || form.email.split("@")[0], email: form.email, balance: 10000, portfolio: [] });
  };

  const inp = { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#e2e8f0", letterSpacing: -1 }}>
          <span style={{ color: "#3b82f6" }}>Apex</span>Trade
        </div>
        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Institutional-grade crypto investing</div>
      </div>

      <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 32, width: 360, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", marginBottom: 24, background: "#0f172a", borderRadius: 8, padding: 4 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: mode === m ? "#3b82f6" : "transparent", color: mode === m ? "#fff" : "#64748b", transition: "all .2s" }}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <input style={inp} name="name" placeholder="Full name" value={form.name} onChange={handle} />
          )}
          <input style={inp} name="email" type="email" placeholder="Email address" value={form.email} onChange={handle} />
          <input style={inp} name="password" type="password" placeholder="Password" value={form.password} onChange={handle} />
          {mode === "register" && (
            <input style={inp} name="confirm" type="password" placeholder="Confirm password" value={form.confirm} onChange={handle} />
          )}

          {error && <div style={{ color: "#ef4444", fontSize: 12, background: "#450a0a", padding: "8px 12px", borderRadius: 6 }}>{error}</div>}

          <button onClick={submit} style={{ marginTop: 4, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: 0.3 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {mode === "login" && (
            <div style={{ textAlign: "center", color: "#64748b", fontSize: 12, marginTop: 4 }}>
              Demo: any email + password works
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Trade Modal ---
function TradeModal({ crypto, user, onClose, onTrade }) {
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  const usdVal = parseFloat(amount) || 0;
  const coinQty = usdVal / crypto.price;
  const holding = user.portfolio.find(p => p.id === crypto.id);

  const execute = () => {
    setMsg("");
    if (!usdVal || usdVal <= 0) return setMsg("Enter a valid amount.");
    if (side === "buy" && usdVal > user.balance) return setMsg("Insufficient balance.");
    if (side === "sell") {
      if (!holding || holding.qty * crypto.price < usdVal) return setMsg("Insufficient holdings.");
    }
    onTrade(side, crypto, usdVal, coinQty);
    setMsg(side === "buy" ? `✓ Bought ${coinQty.toFixed(6)} ${crypto.id}` : `✓ Sold ${coinQty.toFixed(6)} ${crypto.id}`);
    setAmount("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={onClose}>
      <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 340, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, background: crypto.color + "22", borderRadius: 8, padding: "4px 10px", color: crypto.color }}>{crypto.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{crypto.name}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{crypto.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>Market Price</span>
          <span style={{ color: "#e2e8f0", fontWeight: 600, fontFamily: "monospace" }}>${crypto.price.toLocaleString()}</span>
        </div>

        <div style={{ display: "flex", marginBottom: 16, background: "#0f172a", borderRadius: 8, padding: 4 }}>
          {["buy", "sell"].map(s => (
            <button key={s} onClick={() => setSide(s)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: side === s ? (s === "buy" ? "#166534" : "#7f1d1d") : "transparent",
              color: side === s ? (s === "buy" ? "#22c55e" : "#ef4444") : "#64748b" }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 8 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 14 }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px 10px 28px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        {usdVal > 0 && (
          <div style={{ color: "#64748b", fontSize: 12, marginBottom: 12, textAlign: "right" }}>
            ≈ {coinQty.toFixed(6)} {crypto.id}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[25, 50, 75, 100].map(pct => (
            <button key={pct} onClick={() => {
              const max = side === "buy" ? user.balance : (holding ? holding.qty * crypto.price : 0);
              setAmount((max * pct / 100).toFixed(2));
            }} style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 11, padding: "5px 0", cursor: "pointer" }}>
              {pct}%
            </button>
          ))}
        </div>

        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 14 }}>
          Available: <span style={{ color: "#e2e8f0" }}>
            {side === "buy" ? `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : holding ? `${holding.qty.toFixed(6)} ${crypto.id}` : "0"}
          </span>
        </div>

        {msg && <div style={{ marginBottom: 12, fontSize: 12, padding: "8px 12px", borderRadius: 6, background: msg.startsWith("✓") ? "#052e16" : "#450a0a", color: msg.startsWith("✓") ? "#22c55e" : "#ef4444" }}>{msg}</div>}

        <button onClick={execute} style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, letterSpacing: 0.3,
          background: side === "buy" ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff" }}>
          {side === "buy" ? "Buy" : "Sell"} {crypto.id}
        </button>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("market");
  const [tradeCrypto, setTradeCrypto] = useState(null);
  const [prices, setPrices] = useState(CRYPTOS);
  const [chartData, setChartData] = useState(() => {
    const d = {};
    CRYPTOS.forEach(c => { d[c.id] = generateChart(c.price); });
    return d;
  });
  const [txHistory, setTxHistory] = useState([]);
  const [search, setSearch] = useState("");

  // Simulate live price updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setPrices(prev => prev.map(c => {
        const delta = (Math.random() - 0.49) * 0.002;
        const newPrice = +(c.price * (1 + delta)).toFixed(c.price < 1 ? 4 : 2);
        return { ...c, price: newPrice };
      }));
      setChartData(prev => {
        const next = { ...prev };
        prices.forEach(c => {
          const arr = [...(prev[c.id] || []), c.price];
          next[c.id] = arr.slice(-20);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [user, prices]);

  const onTrade = (side, crypto, usd, qty) => {
    setUser(prev => {
      const portfolio = [...prev.portfolio];
      const idx = portfolio.findIndex(p => p.id === crypto.id);
      if (side === "buy") {
        if (idx >= 0) portfolio[idx] = { ...portfolio[idx], qty: portfolio[idx].qty + qty, avgPrice: (portfolio[idx].avgPrice * portfolio[idx].qty + usd) / (portfolio[idx].qty + qty) };
        else portfolio.push({ id: crypto.id, name: crypto.name, qty, avgPrice: crypto.price, icon: crypto.icon, color: crypto.color });
        return { ...prev, balance: prev.balance - usd, portfolio };
      } else {
        if (idx >= 0) {
          const newQty = portfolio[idx].qty - qty;
          if (newQty <= 0.000001) portfolio.splice(idx, 1);
          else portfolio[idx] = { ...portfolio[idx], qty: newQty };
        }
        return { ...prev, balance: prev.balance + usd, portfolio };
      }
    });
    setTxHistory(prev => [{
      id: Date.now(), side, coinId: crypto.id, name: crypto.name, qty, usd, price: crypto.price,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
  };

  const portfolioValue = user ? user.portfolio.reduce((sum, p) => {
    const c = prices.find(x => x.id === p.id);
    return sum + (c ? c.price * p.qty : 0);
  }, 0) : 0;

  const totalValue = user ? user.balance + portfolioValue : 0;
  const invested = user ? user.portfolio.reduce((sum, p) => sum + p.avgPrice * p.qty, 0) : 0;
  const pnl = portfolioValue - invested;

  if (!user) return <AuthPage onAuth={u => setUser(u)} />;

  const filtered = prices.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  const navBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
      background: tab === id ? "#1e293b" : "transparent", color: tab === id ? "#3b82f6" : "#64748b",
      borderTop: tab === id ? "2px solid #3b82f6" : "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
          <span style={{ color: "#3b82f6" }}>Apex</span><span style={{ color: "#e2e8f0" }}>Trade</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>Portfolio</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </div>

      <TickerStrip cryptos={prices} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>

        {/* MARKET TAB */}
        {tab === "market" && (
          <div style={{ padding: "16px 16px 0" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coins..."
              style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 10, color: "#e2e8f0", padding: "10px 14px", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />

            {filtered.map(c => (
              <div key={c.id} onClick={() => setTradeCrypto(c)}
                style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: c.color, fontWeight: 700, flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{c.id}</div>
                </div>
                <div style={{ marginRight: 8 }}>
                  <Sparkline data={chartData[c.id] || [c.price]} up={c.change >= 0} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>
                    ${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.change >= 0 ? "#22c55e" : "#ef4444" }}>
                    {c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {tab === "portfolio" && (
          <div style={{ padding: 16 }}>
            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total Balance", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "USD Value", color: "#3b82f6" },
                { label: "Cash", value: `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "Available", color: "#22c55e" },
                { label: "Invested", value: `$${invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "Cost Basis", color: "#f59e0b" },
                { label: "P&L", value: `${pnl >= 0 ? "+" : ""}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: "Unrealized", color: pnl >= 0 ? "#22c55e" : "#ef4444" },
              ].map(card => (
                <div key={card.label} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Holdings */}
            <div style={{ fontWeight: 600, fontSize: 13, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Holdings</div>
            {user.portfolio.length === 0 ? (
              <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 32, textAlign: "center", color: "#475569" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div>No positions yet. Buy some crypto to get started.</div>
              </div>
            ) : user.portfolio.map(p => {
              const livePrice = prices.find(x => x.id === p.id)?.price || p.avgPrice;
              const curVal = livePrice * p.qty;
              const cost = p.avgPrice * p.qty;
              const gain = curVal - cost;
              const gainPct = (gain / cost) * 100;
              return (
                <div key={p.id} onClick={() => setTradeCrypto(prices.find(x => x.id === p.id))}
                  style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 700 }}>{p.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.id}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{p.qty.toFixed(6)} coins</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontFamily: "monospace" }}>${curVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: 12, color: gain >= 0 ? "#22c55e" : "#ef4444" }}>
                        {gain >= 0 ? "+" : ""}{gainPct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                    <span>Avg. price: <span style={{ color: "#94a3b8" }}>${p.avgPrice.toLocaleString()}</span></span>
                    <span>Live: <span style={{ color: "#94a3b8" }}>${livePrice.toLocaleString()}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Transaction History</div>
            {txHistory.length === 0 ? (
              <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 32, textAlign: "center", color: "#475569" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div>No transactions yet.</div>
              </div>
            ) : txHistory.map(tx => (
              <div key={tx.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: tx.side === "buy" ? "#052e16" : "#450a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {tx.side === "buy" ? "↓" : "↑"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{tx.side} {tx.coinId}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{tx.time} · {tx.qty.toFixed(6)} coins</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: tx.side === "buy" ? "#ef4444" : "#22c55e" }}>
                    {tx.side === "buy" ? "-" : "+"}${tx.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>@ ${tx.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {tab === "account" && (
          <div style={{ padding: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#1e3a5f,#1e293b)", border: "1px solid #1e3a5f", borderRadius: 16, padding: 24, marginBottom: 16, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, margin: "0 auto 12px" }}>
                {user.name[0].toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: "10px 20px", display: "inline-block" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>Account Status</div>
                <div style={{ color: "#22c55e", fontWeight: 600, fontSize: 13 }}>✓ Verified</div>
              </div>
            </div>

            {[
              { label: "Total Portfolio Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Cash Balance", value: `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Positions", value: user.portfolio.length },
              { label: "Total Trades", value: txHistory.length },
            ].map(row => (
              <div key={row.label} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{row.value}</span>
              </div>
            ))}

            <button onClick={() => setUser(null)} style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#ef4444", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f172a", borderTop: "1px solid #1e293b", display: "flex" }}>
        {navBtn("market",    "Market",    "📈")}
        {navBtn("portfolio", "Portfolio", "💼")}
        {navBtn("history",   "History",   "📋")}
        {navBtn("account",   "Account",   "👤")}
      </div>

      {tradeCrypto && (
        <TradeModal crypto={tradeCrypto} user={user} onClose={() => setTradeCrypto(null)} onTrade={(side, crypto, usd, qty) => { onTrade(side, crypto, usd, qty); }} />
      )}
    </div>
  );
}
