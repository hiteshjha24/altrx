import { useState, useEffect, useRef, useCallback } from "react";

const MOCK_MEDICINES = [
  { id:1, brand_name:"Crocin", manufacturer:"GSK Consumer", dosage_form:"Tablet", strength:"500mg", price:22.00, price_per_unit:1.4667, salt_name:"Paracetamol 500mg", is_generic:false, alternatives_count:5, match_score:1.0 },
  { id:2, brand_name:"Dolo 650", manufacturer:"Micro Labs", dosage_form:"Tablet", strength:"650mg", price:30.00, price_per_unit:2.0, salt_name:"Paracetamol 500mg", is_generic:false, alternatives_count:5, match_score:0.9 },
  { id:3, brand_name:"Brufen", manufacturer:"Abbott", dosage_form:"Tablet", strength:"400mg", price:42.00, price_per_unit:2.8, salt_name:"Ibuprofen 400mg", is_generic:false, alternatives_count:4, match_score:0.85 },
  { id:4, brand_name:"Lipitor", manufacturer:"Pfizer", dosage_form:"Tablet", strength:"10mg", price:165.00, price_per_unit:16.5, salt_name:"Atorvastatin 10mg", is_generic:false, alternatives_count:4, match_score:0.8 },
  { id:5, brand_name:"Glucophage", manufacturer:"Merck", dosage_form:"Tablet", strength:"500mg", price:55.00, price_per_unit:2.75, salt_name:"Metformin 500mg", is_generic:false, alternatives_count:4, match_score:0.75 },
  { id:6, brand_name:"P-500 (Generic)", manufacturer:"Jan Aushadhi", dosage_form:"Tablet", strength:"500mg", price:12.00, price_per_unit:0.4, salt_name:"Paracetamol 500mg", is_generic:true, alternatives_count:5, match_score:0.7 },
];

const MOCK_ALTERNATIVES = {
  1: {
    target: {
      id:1, brand_name:"Crocin", manufacturer:"GSK Consumer Healthcare", dosage_form:"Tablet",
      strength:"500mg", pack_size:15, pack_unit:"tablets", price:22.00, price_per_unit:1.4667,
      is_generic:false, is_otc:true, prescription_required:false,
      salt_id:1, salt_name:"Paracetamol 500mg", drug_class:"Analgesic / Antipyretic", schedule:"OTC",
      primary_uses:["Fever","Mild to moderate pain","Headache"],
      mechanism:"Reduces fever by acting on the hypothalamus and relieves pain by inhibiting prostaglandin synthesis in the CNS.",
      side_effects:["Nausea","Rash","Liver damage (at high doses)"],
      safety_warnings:{
        pregnancy:{safe:true,note:"Safe in all trimesters at recommended doses"},
        alcohol:{safe:false,note:"Avoid — increases liver damage risk significantly"},
        driving:{safe:true,note:"No known impairment"},
        liver:{safe:false,note:"Avoid in severe liver disease"},
        breastfeed:{safe:true,note:"Safe to use while breastfeeding"},
      }
    },
    alternatives_count: 5,
    max_savings_percentage: 72.7,
    alternatives: [
      { id:6, brand_name:"P-500 (Generic)", manufacturer:"Jan Aushadhi", dosage_form:"Tablet", strength:"500mg", pack_size:30, pack_unit:"tablets", price:12.00, price_per_unit:0.40, is_generic:true, is_otc:true, salt_name:"Paracetamol 500mg", savings_percentage:72.7, is_cheaper:true },
      { id:5, brand_name:"Pacimol", manufacturer:"Ipca Laboratories", dosage_form:"Tablet", strength:"500mg", pack_size:15, pack_unit:"tablets", price:18.50, price_per_unit:1.233, is_generic:false, is_otc:true, salt_name:"Paracetamol 500mg", savings_percentage:15.9, is_cheaper:true },
      { id:7, brand_name:"Metacin", manufacturer:"Pfizer", dosage_form:"Tablet", strength:"500mg", pack_size:20, pack_unit:"tablets", price:28.00, price_per_unit:1.40, is_generic:false, is_otc:true, salt_name:"Paracetamol 500mg", savings_percentage:4.6, is_cheaper:true },
      { id:3, brand_name:"Calpol", manufacturer:"Haleon", dosage_form:"Tablet", strength:"500mg", pack_size:20, pack_unit:"tablets", price:35.00, price_per_unit:1.75, is_generic:false, is_otc:true, salt_name:"Paracetamol 500mg", savings_percentage:0, is_cheaper:false },
      { id:2, brand_name:"Dolo 650", manufacturer:"Micro Labs", dosage_form:"Tablet", strength:"650mg", pack_size:15, pack_unit:"tablets", price:30.00, price_per_unit:2.00, is_generic:false, is_otc:true, salt_name:"Paracetamol 500mg", savings_percentage:0, is_cheaper:false },
    ]
  }
};

const POPULAR = ["Crocin","Dolo 650","Brufen","Lipitor","Glucophage","Amoxil","Combiflam","Atorva"];

const C = {
  bg:       "#0A0F1E",     
  surface:  "#111827",     
  surfaceL: "#1A2235",     
  border:   "#1E3A5F",     
  borderH:  "#2563EB",     
  green:    "#10B981",     
  greenL:   "#D1FAE5",     
  greenD:   "#065F46",     
  blue:     "#3B82F6",     
  blueL:    "#DBEAFE",
  teal:     "#14B8A6",     
  tealL:    "#CCFBF1",
  red:      "#EF4444",     
  redL:     "#FEE2E2",
  amber:    "#F59E0B",
  amberL:   "#FEF3C7",
  text:     "#F9FAFB",
  textSec:  "#9CA3AF",
  textMut:  "#6B7280",
  generic:  "#A855F7",
  genericL: "#F3E8FF",
};

const card = {
  background: C.surface,
  border: `2px solid ${C.border}`,
  borderRadius: 12,
  boxShadow: `4px 4px 0 0 #000`,
};

const cardAccent = {
  background: C.surfaceL,
  border: `2px solid ${C.teal}`,
  borderRadius: 12,
  boxShadow: `4px 4px 0 0 ${C.teal}55`,
};

const btn = (bg, color="#fff", border=bg) => ({
  background: bg,
  color: color,
  border: `2px solid ${border}`,
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "3px 3px 0 0 #000",
  transition: "transform 0.1s, box-shadow 0.1s",
  fontFamily: "inherit",
});

// ─── Global Styles ────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: ${C.bg}; color: ${C.text}; }
    input, button { font-family: inherit; }
    button:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 #000 !important; }
    button:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 0 #000 !important; }
    .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; border:1.5px solid; }
    .tag { display:inline-block; padding:4px 12px; border-radius:6px; font-size:12px; font-weight:600; border:1.5px solid #000; margin:2px; }
    a { color: ${C.teal}; text-decoration:none; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    @keyframes fadeIn { from {opacity:0;transform:translateY(8px)} to {opacity:1;transform:translateY(0)} }
    .fade-in { animation: fadeIn 0.3s ease; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  `}</style>
);

// ─── Navbar ───────────────────────────────────────────────────────────────
function Navbar({ onHome }) {
  return (
    <nav style={{
      background: C.surface,
      borderBottom: `2px solid ${C.border}`,
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64, position: "sticky", top: 0, zIndex: 100,
      boxShadow: `0 2px 0 0 #000`,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={onHome}>
        {/* Logo placeholder — swap for <img src="/logo.png"> */}
        <div style={{
          width:40, height:40, borderRadius:8,
          border:`2px solid ${C.teal}`,
          background:`linear-gradient(135deg, ${C.teal}33, ${C.blue}33)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:20, fontWeight:900, color:C.teal,
          boxShadow:`2px 2px 0 0 #000`,
        }}>Rx</div>
        <span style={{fontSize:22, fontWeight:900, letterSpacing:-0.5}}>
          Alt<span style={{color:C.teal}}>Rx</span>
        </span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:12,color:C.textSec,padding:"4px 10px",border:`1.5px solid ${C.border}`,borderRadius:6,background:C.bg}}>
          🔒 Informational only
        </span>
      </div>
    </nav>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────
function HomeView({ onSearch, onSelectSuggestion }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const filtered = MOCK_MEDICINES.filter(m =>
      m.brand_name.toLowerCase().includes(query.toLowerCase()) ||
      m.salt_name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0,5));
    setShowSugg(true);
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setShowSugg(false);
    onSearch(query);
  };

  return (
    <div style={{minHeight:"calc(100vh - 64px)", display:"flex", flexDirection:"column"}}>
      {/* Hero */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"60px 24px 40px",
        background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${C.teal}18, transparent)`,
      }}>
        <div style={{
          display:"inline-block", padding:"4px 16px",
          border:`2px solid ${C.teal}`, borderRadius:20,
          fontSize:13, fontWeight:700, color:C.teal, marginBottom:20,
          background:`${C.teal}15`,
        }}>
          🧬 Same salt. Better price.
        </div>

        <h1 style={{
          fontSize:"clamp(36px,6vw,72px)", fontWeight:900, textAlign:"center",
          lineHeight:1.05, marginBottom:16, letterSpacing:-2,
        }}>
          Your Prescription,{" "}
          <span style={{color:C.teal}}>Our Priority.</span>
        </h1>

        <p style={{
          fontSize:18, color:C.textSec, textAlign:"center",
          maxWidth:520, marginBottom:40, lineHeight:1.6,
        }}>
          Upload a prescription or search by brand name to find affordable generic alternatives
          with <strong style={{color:C.text}}>identical active ingredients</strong>.
        </p>

        {/* Search box */}
        <div style={{width:"100%", maxWidth:640, position:"relative"}}>
          <form onSubmit={handleSubmit}>
            <div style={{
              display:"flex", gap:0,
              border:`3px solid ${C.teal}`, borderRadius:12,
              overflow:"hidden", background:C.surface,
              boxShadow:`4px 4px 0 0 #000`,
            }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => query.length>=2 && setShowSugg(true)}
                onBlur={() => setTimeout(()=>setShowSugg(false),150)}
                placeholder="Search brand name or active ingredient…"
                style={{
                  flex:1, padding:"18px 20px", fontSize:16,
                  background:"transparent", border:"none", outline:"none",
                  color:C.text,
                }}
              />
              <button type="submit" style={{
                ...btn(C.teal,"#fff",C.teal),
                borderRadius:0, margin:0, boxShadow:"none",
                padding:"18px 28px", fontSize:16,
              }}>
                Search →
              </button>
            </div>
          </form>

          {/* Autocomplete */}
          {showSugg && suggestions.length > 0 && (
            <div style={{
              position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:50,
              background:C.surface, border:`2px solid ${C.border}`, borderRadius:10,
              boxShadow:`4px 4px 0 0 #000`, overflow:"hidden",
            }}>
              {suggestions.map(s => (
                <div key={s.id}
                  onMouseDown={() => { setQuery(s.brand_name); setShowSugg(false); onSelectSuggestion(s); }}
                  style={{
                    padding:"12px 16px", cursor:"pointer", display:"flex",
                    justifyContent:"space-between", alignItems:"center",
                    borderBottom:`1px solid ${C.border}`,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.surfaceL}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div>
                    <div style={{fontWeight:700, fontSize:15}}>{s.brand_name}</div>
                    <div style={{fontSize:12, color:C.textSec}}>{s.salt_name} · {s.dosage_form}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14, fontWeight:700, color:C.teal}}>₹{s.price}</div>
                    <div style={{fontSize:11, color:C.textMut}}>{s.alternatives_count} alternatives</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular suggestions */}
        <div style={{marginTop:24, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:620}}>
          <span style={{fontSize:13,color:C.textMut}}>Popular:</span>
          {POPULAR.map(p => (
            <button key={p} onClick={()=>{ setQuery(p); onSearch(p); }}
              style={{
                background:C.surfaceL, color:C.textSec, border:`1.5px solid ${C.border}`,
                borderRadius:20, padding:"5px 14px", fontSize:13, cursor:"pointer",
                fontFamily:"inherit", transition:"all 0.15s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.teal; e.currentTarget.style.color=C.teal}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSec}}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{padding:"60px 24px", background:C.surface, borderTop:`2px solid ${C.border}`}}>
        <h2 style={{textAlign:"center", fontSize:28, fontWeight:900, marginBottom:8}}>How AltRx Works</h2>
        <p style={{textAlign:"center", color:C.textSec, marginBottom:40}}>
          Three steps to smarter, affordable healthcare
        </p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20, maxWidth:860, margin:"0 auto"}}>
          {[
            { step:"01", icon:"🔍", title:"Search", desc:"Enter the branded medicine name or active ingredient you were prescribed.", color:C.blue },
            { step:"02", icon:"⚗️", title:"Match by Salt", desc:"We identify the exact chemical formulation and dosage, not just the brand.", color:C.teal },
            { step:"03", icon:"💰", title:"Compare Prices", desc:"See all alternatives sorted cheapest-first with clear savings percentages.", color:C.green },
            { step:"04", icon:"🛡️", title:"Stay Safe", desc:"Every result includes full safety data, side effects, and doctor consultation reminders.", color:C.amber },
          ].map(step => (
            <div key={step.step} style={{...card, padding:24, position:"relative", overflow:"hidden"}}>
              <div style={{
                position:"absolute", top:-10, right:-10,
                fontSize:64, fontWeight:900, color:`${step.color}18`, lineHeight:1,
                pointerEvents:"none",
              }}>{step.step}</div>
              <div style={{fontSize:32, marginBottom:12}}>{step.icon}</div>
              <div style={{fontSize:12, fontWeight:700, color:step.color, marginBottom:4}}>STEP {step.step}</div>
              <div style={{fontSize:17, fontWeight:800, marginBottom:8}}>{step.title}</div>
              <div style={{fontSize:14, color:C.textSec, lineHeight:1.6}}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerFooter />
    </div>
  );
}

// ─── Search Results View ──────────────────────────────────────────────────
function SearchResultsView({ query, onSelectMedicine }) {
  const [filter, setFilter] = useState("All");
  const forms = ["All","Tablet","Capsule","Syrup","Injection"];
  const results = MOCK_MEDICINES.filter(m =>
    (filter === "All" || m.dosage_form === filter) &&
    (m.brand_name.toLowerCase().includes(query.toLowerCase()) ||
     m.salt_name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{padding:"32px 24px", maxWidth:900, margin:"0 auto"}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13, color:C.textSec, marginBottom:4}}>Search results for</div>
        <h1 style={{fontSize:28, fontWeight:900, letterSpacing:-0.5}}>"{query}"</h1>
        <div style={{fontSize:14, color:C.textSec, marginTop:4}}>
          {results.length} {results.length === 1 ? "result" : "results"} found
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex", gap:8, marginBottom:24, flexWrap:"wrap"}}>
        <span style={{fontSize:13, color:C.textMut, padding:"6px 0"}}>Filter:</span>
        {forms.map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{
            background: filter===f ? C.teal : C.surface,
            color: filter===f ? "#fff" : C.textSec,
            border: `2px solid ${filter===f ? C.teal : C.border}`,
            borderRadius:8, padding:"6px 16px", fontSize:13, cursor:"pointer",
            fontFamily:"inherit", fontWeight:600, boxShadow: filter===f ? "2px 2px 0 0 #000":"none",
          }}>{f}</button>
        ))}
      </div>

      {results.length === 0 ? (
        <div style={{...card, padding:48, textAlign:"center"}}>
          <div style={{fontSize:48, marginBottom:12}}>🔍</div>
          <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>No medicines found</div>
          <div style={{color:C.textSec}}>Try a different spelling or use the active ingredient name</div>
        </div>
      ) : (
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {results.map((med, idx) => (
            <div key={med.id} className="fade-in"
              style={{
                ...(idx===0 ? {background:C.surfaceL, border:`2px solid ${C.teal}`, borderRadius:12, boxShadow:`4px 4px 0 0 ${C.teal}44`} : card),
                padding:20, display:"flex", justifyContent:"space-between",
                alignItems:"center", flexWrap:"wrap", gap:12, cursor:"pointer",
              }}
              onClick={() => onSelectMedicine(med)}
            >
              <div style={{flex:1, minWidth:220}}>
                <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:6}}>
                  {idx===0 && <span style={{...span(C.teal, C.tealL)}}>Best Match</span>}
                  {med.is_generic && <span style={{...span(C.generic, C.genericL)}}>Generic</span>}
                  {med.is_otc && <span style={{...span(C.green, C.greenL)}}>OTC</span>}
                </div>
                <div style={{fontSize:18, fontWeight:800, marginBottom:2}}>{med.brand_name}</div>
                <div style={{fontSize:13, color:C.textSec}}>{med.manufacturer} · {med.dosage_form} · {med.strength}</div>
                <div style={{fontSize:12, color:C.textMut, marginTop:4}}>
                  🧬 Active: <span style={{color:C.teal}}>{med.salt_name}</span>
                </div>
              </div>
              <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8}}>
                <div style={{fontSize:22, fontWeight:900, color:C.teal}}>₹{med.price.toFixed(2)}</div>
                <div style={{fontSize:12, color:C.textMut}}>₹{med.price_per_unit.toFixed(2)}/unit</div>
                <button onClick={e=>{e.stopPropagation();onSelectMedicine(med)}} style={{
                  ...btn(C.teal),
                  padding:"8px 16px", fontSize:13,
                }}>
                  {med.alternatives_count} alternatives →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <DisclaimerFooter />
    </div>
  );
}

const span = (color, bg) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  color: color,
  background: bg,
  border: `1.5px solid ${color}`,
});

// ─── Alternatives View ────────────────────────────────────────────────────
function AlternativesView({ medicine, onViewDetail }) {
  const data = MOCK_ALTERNATIVES[medicine.id] || MOCK_ALTERNATIVES[1];
  const [selected, setSelected] = useState(null);
  const [monthlySaving, setMonthlySaving] = useState(1);

  const cheapest = data.alternatives.find(a=>a.is_cheaper) || data.alternatives[0];
  const cheapestPPU = cheapest?.price_per_unit || 0;
  const targetPPU = data.target.price_per_unit;
  const monthlyUnits = monthlySaving * 30;
  const saving = Math.max(0, (targetPPU - cheapestPPU) * monthlyUnits);

  return (
    <div style={{padding:"32px 24px", maxWidth:1000, margin:"0 auto"}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13, color:C.textSec, marginBottom:4}}>Finding alternatives for</div>
        <h1 style={{fontSize:28, fontWeight:900, letterSpacing:-0.5}}>{data.target.brand_name}</h1>
        <div style={{fontSize:14, color:C.textSec, display:"flex", gap:8, flexWrap:"wrap", marginTop:6}}>
          <span>🧬 {data.target.salt_name}</span>
          <span>·</span>
          <span>{data.target.dosage_form}</span>
          <span>·</span>
          <span>{data.target.strength}</span>
          <span>·</span>
          <span style={{color:C.textMut}}>{data.target.drug_class}</span>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24}}>
        {/* Max savings badge */}
        <div style={{
          background:`linear-gradient(135deg, ${C.green}22, ${C.teal}22)`,
          border:`2px solid ${C.green}`, borderRadius:12,
          padding:24, boxShadow:`4px 4px 0 0 ${C.green}55`,
        }}>
          <div style={{fontSize:13, fontWeight:700, color:C.green, marginBottom:4}}>MAX SAVINGS AVAILABLE</div>
          <div style={{fontSize:42, fontWeight:900, color:C.green, lineHeight:1}}>{data.max_savings_percentage}%</div>
          <div style={{fontSize:14, color:C.textSec, marginTop:4}}>vs cheapest generic alternative</div>
        </div>

        {/* Savings calculator */}
        <div style={{...card, padding:24}}>
          <div style={{fontSize:13, fontWeight:700, color:C.amber, marginBottom:12}}>💡 SAVINGS CALCULATOR</div>
          <div style={{fontSize:13, color:C.textSec, marginBottom:6}}>
            Tablets per day: <strong style={{color:C.text}}>{monthlySaving}</strong>
          </div>
          <input type="range" min="1" max="6" value={monthlySaving}
            onChange={e=>setMonthlySaving(+e.target.value)}
            style={{width:"100%", marginBottom:12, accentColor:C.teal}}
          />
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontSize:11, color:C.textMut}}>Monthly saving (30 days)</div>
              <div style={{fontSize:26, fontWeight:900, color:C.green}}>₹{saving.toFixed(0)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11, color:C.textMut}}>Yearly saving</div>
              <div style={{fontSize:20, fontWeight:800, color:C.green}}>₹{(saving*12).toFixed(0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target vs Alternatives layout */}
      <div style={{display:"grid", gridTemplateColumns:"300px 1fr", gap:20}}>

        {/* Target medicine */}
        <div>
          <div style={{fontSize:12, fontWeight:700, color:C.textMut, marginBottom:8, letterSpacing:1}}>YOUR MEDICINE</div>
          <div style={{
            ...cardAccent, padding:20,
            cursor:"pointer",
          }} onClick={()=>onViewDetail(data.target)}>
            <div style={{fontSize:11, fontWeight:700, color:C.teal, marginBottom:6}}>TARGET BRAND</div>
            <div style={{fontSize:18, fontWeight:800, marginBottom:4}}>{data.target.brand_name}</div>
            <div style={{fontSize:12, color:C.textSec, marginBottom:12}}>by {data.target.manufacturer}</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
              <div>
                <div style={{fontSize:22, fontWeight:900, color:C.text}}>₹{data.target.price.toFixed(2)}</div>
                <div style={{fontSize:11, color:C.textMut}}>₹{targetPPU.toFixed(2)}/tablet</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11, color:C.textSec}}>{data.target.pack_size} {data.target.pack_unit}</div>
                {data.target.is_otc && <span style={{...span(C.green,C.greenL), fontSize:10}}>OTC</span>}
              </div>
            </div>
            <button onClick={e=>{e.stopPropagation();onViewDetail(data.target)}} style={{
              ...btn("transparent",C.teal,C.teal), marginTop:14, width:"100%", padding:"8px",
              boxShadow:"none",
            }}>View Safety Data</button>
          </div>
        </div>

        {/* Alternatives */}
        <div>
          <div style={{fontSize:12, fontWeight:700, color:C.textMut, marginBottom:8, letterSpacing:1}}>
            CHEAPER ALTERNATIVES — same active ingredient
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {data.alternatives.map((alt, idx) => (
              <div key={alt.id}
                style={{
                  ...(selected===alt.id ? {...card, border:`2px solid ${C.blue}`} : card),
                  padding:"16px 20px", cursor:"pointer", transition:"border-color 0.2s",
                  display:"flex", justifyContent:"space-between", alignItems:"center", gap:12,
                }}
                onClick={()=>setSelected(selected===alt.id?null:alt.id)}
              >
                <div style={{display:"flex", gap:12, alignItems:"center", flex:1}}>
                  <div style={{
                    width:36, height:36, borderRadius:8, display:"flex",
                    alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14,
                    background: idx===0 ? `${C.green}22` : `${C.border}`,
                    color: idx===0 ? C.green : C.textSec,
                    border:`1.5px solid ${idx===0?C.green:C.border}`, flexShrink:0,
                  }}>#{idx+1}</div>
                  <div>
                    <div style={{display:"flex", gap:6, marginBottom:2}}>
                      {alt.is_generic && <span style={{...span(C.generic,C.genericL),fontSize:10}}>Generic</span>}
                      {idx===0 && alt.is_cheaper && <span style={{...span(C.green,C.greenL),fontSize:10}}>Cheapest</span>}
                    </div>
                    <div style={{fontWeight:700, fontSize:15}}>{alt.brand_name}</div>
                    <div style={{fontSize:12, color:C.textSec}}>{alt.manufacturer}</div>
                  </div>
                </div>
                <div style={{textAlign:"right", flexShrink:0}}>
                  <div style={{fontSize:18, fontWeight:900, color: alt.is_cheaper?C.green:C.text}}>
                    ₹{alt.price.toFixed(2)}
                  </div>
                  <div style={{fontSize:11, color:C.textMut}}>₹{alt.price_per_unit.toFixed(2)}/unit</div>
                  {alt.savings_percentage > 0 && (
                    <div style={{
                      fontSize:12, fontWeight:700, color:C.green,
                      marginTop:4, display:"flex", alignItems:"center", gap:2, justifyContent:"flex-end",
                    }}>
                      ↓ {alt.savings_percentage}% cheaper
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DisclaimerFooter />
    </div>
  );
}

// ─── Medicine Detail View ─────────────────────────────────────────────────
function MedicineDetailView({ medicine }) {
  const detail = medicine.safety_warnings
    ? medicine
    : (MOCK_ALTERNATIVES[1]?.target || medicine);

  const warnings = detail.safety_warnings || {};
  const warningItems = [
    { key:"pregnancy",  icon:"🤰", label:"Pregnancy",    color:C.blue },
    { key:"alcohol",    icon:"🍺", label:"Alcohol",      color:C.red },
    { key:"driving",    icon:"🚗", label:"Driving",      color:C.amber },
    { key:"liver",      icon:"🫁", label:"Liver",        color:C.red },
    { key:"breastfeed", icon:"👶", label:"Breastfeeding",color:C.blue },
    { key:"kidneys",    icon:"🫘", label:"Kidneys",      color:C.amber },
  ].filter(w => warnings[w.key]);

  return (
    <div style={{padding:"32px 24px", maxWidth:860, margin:"0 auto"}}>
      {/* Header */}
      <div style={{...cardAccent, padding:28, marginBottom:20}}>
        <div style={{display:"flex", gap:12, flexWrap:"wrap", marginBottom:12}}>
          {detail.is_generic && <span style={{...span(C.generic,C.genericL)}}>Generic</span>}
          {detail.is_otc && <span style={{...span(C.green,C.greenL)}}>OTC</span>}
          {detail.prescription_required && <span style={{...span(C.red,C.redL)}}>Prescription Required</span>}
          {detail.schedule && <span style={{...span(C.amber,C.amberL)}}>{detail.schedule}</span>}
        </div>
        <h1 style={{fontSize:32, fontWeight:900, marginBottom:4}}>{detail.brand_name}</h1>
        <div style={{fontSize:15, color:C.textSec, marginBottom:16}}>
          by {detail.manufacturer} · {detail.dosage_form} · {detail.strength}
        </div>
        <div style={{display:"flex", gap:24, flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:12, color:C.textMut}}>Pack Price</div>
            <div style={{fontSize:28, fontWeight:900, color:C.teal}}>₹{detail.price?.toFixed(2)}</div>
          </div>
          <div>
            <div style={{fontSize:12, color:C.textMut}}>Per {detail.pack_unit?.replace("tablets","Tablet").replace("capsules","Capsule")}</div>
            <div style={{fontSize:22, fontWeight:800, color:C.text}}>₹{(detail.price_per_unit||0).toFixed(2)}</div>
          </div>
          {detail.pack_size && (
            <div>
              <div style={{fontSize:12, color:C.textMut}}>Pack Size</div>
              <div style={{fontSize:22, fontWeight:800, color:C.text}}>{detail.pack_size} {detail.pack_unit}</div>
            </div>
          )}
        </div>
      </div>

      {/* Active Salt */}
      <div style={{...card, padding:24, marginBottom:20}}>
        <div style={{fontSize:13, fontWeight:700, color:C.teal, marginBottom:12}}>🧬 ACTIVE SALT COMPOSITION</div>
        <div style={{fontSize:20, fontWeight:800, marginBottom:4}}>{detail.salt_name}</div>
        {detail.iupac_name && <div style={{fontSize:12, color:C.textMut, marginBottom:12, fontFamily:"monospace"}}>{detail.iupac_name}</div>}
        <div style={{fontSize:14, color:C.textSec, lineHeight:1.7, marginBottom:12}}>{detail.mechanism}</div>
        <div style={{fontSize:12, fontWeight:700, color:C.textMut, marginBottom:8}}>PRIMARY USES</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
          {(detail.primary_uses||[]).map(u=>(
            <span key={u} className="tag" style={{background:`${C.teal}22`, color:C.teal, borderColor:C.teal}}>{u}</span>
          ))}
        </div>
      </div>

      {/* Side effects */}
      {(detail.side_effects||[]).length > 0 && (
        <div style={{...card, padding:24, marginBottom:20}}>
          <div style={{fontSize:13, fontWeight:700, color:C.amber, marginBottom:12}}>⚠️ SIDE EFFECTS</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {detail.side_effects.map(e=>(
              <span key={e} className="tag" style={{background:`${C.amber}18`, color:C.amber, borderColor:C.amber}}>{e}</span>
            ))}
          </div>
        </div>
      )}

      {/* Safety warnings */}
      {warningItems.length > 0 && (
        <div style={{...card, padding:24, marginBottom:20}}>
          <div style={{fontSize:13, fontWeight:700, color:C.red, marginBottom:16}}>🛡️ SAFETY INFORMATION</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12}}>
            {warningItems.map(w => {
              const info = warnings[w.key];
              const safe = info?.safe;
              const color = safe===true ? C.green : safe===false ? C.red : C.amber;
              return (
                <div key={w.key} style={{
                  background:`${color}15`, border:`1.5px solid ${color}44`,
                  borderRadius:10, padding:16,
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                    <span style={{fontSize:20}}>{w.icon}</span>
                    <span style={{fontWeight:700, fontSize:13, color}}>{w.label}</span>
                    <span style={{
                      marginLeft:"auto", fontSize:11, fontWeight:700,
                      color, background:`${color}25`, padding:"2px 8px", borderRadius:20,
                    }}>
                      {safe===true?"✓ Safe":safe===false?"✗ Caution":"⚠ Ask Doctor"}
                    </span>
                  </div>
                  <div style={{fontSize:12, color:C.textSec, lineHeight:1.5}}>{info?.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drug class & schedule */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20}}>
        <div style={{...card, padding:20}}>
          <div style={{fontSize:11, color:C.textMut, marginBottom:4}}>DRUG CLASS</div>
          <div style={{fontSize:17, fontWeight:700}}>{detail.drug_class || "—"}</div>
        </div>
        <div style={{...card, padding:20}}>
          <div style={{fontSize:11, color:C.textMut, marginBottom:4}}>SCHEDULE / AVAILABILITY</div>
          <div style={{fontSize:17, fontWeight:700}}>{detail.schedule || "—"}</div>
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  );
}

// ─── Disclaimer Footer ─────────────────────────────────────────────────────
function DisclaimerFooter() {
  return (
    <footer style={{
      marginTop:40, padding:"20px 24px",
      background:"#100000", border:`2px solid ${C.red}66`,
      borderRadius:12, textAlign:"center",
    }}>
      <div style={{fontSize:13, fontWeight:800, color:C.red, marginBottom:6}}>
        ⚕️ IMPORTANT MEDICAL DISCLAIMER
      </div>
      <p style={{fontSize:12, color:C.textSec, maxWidth:760, margin:"0 auto", lineHeight:1.6}}>
        AltRx is a <strong style={{color:C.text}}>purely informational platform</strong>. The information provided does not constitute medical advice and is not a substitute for professional medical consultation, diagnosis, or treatment. Always consult a qualified doctor or pharmacist before switching or stopping any medication. Do not self-medicate. Medicine availability, pricing, and safety profiles may vary. AltRx does not sell medicines or endorse any brand.
      </p>
    </footer>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────
export default function AltRxApp() {
  const [view, setView] = useState("home");  // home | results | alternatives | detail
  const [query, setQuery] = useState("");
  const [selectedMed, setSelectedMed] = useState(null);
  const [detailMed, setDetailMed] = useState(null);

  const goHome = () => setView("home");
  const doSearch = (q) => { setQuery(q); setView("results"); };
  const selectMed = (med) => { setSelectedMed(med); setView("alternatives"); };
  const viewDetail = (med) => { setDetailMed(med); setView("detail"); };

  return (
    <>
      <GlobalStyles />
      <Navbar onHome={goHome} />
      <main>
        {view === "home" && (
          <HomeView onSearch={doSearch} onSelectSuggestion={selectMed} />
        )}
        {view === "results" && (
          <SearchResultsView query={query} onSelectMedicine={selectMed} />
        )}
        {view === "alternatives" && selectedMed && (
          <>
            <div style={{padding:"12px 24px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", gap:8}}>
              <button onClick={()=>setView("results")} style={{...btn("transparent",C.textSec,C.border), padding:"6px 14px", boxShadow:"none", fontSize:13}}>← Back to results</button>
              <span style={{fontSize:13, color:C.textMut, alignSelf:"center"}}>/ {selectedMed.brand_name} alternatives</span>
            </div>
            <AlternativesView medicine={selectedMed} onViewDetail={viewDetail} />
          </>
        )}
        {view === "detail" && detailMed && (
          <>
            <div style={{padding:"12px 24px", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", gap:8}}>
              <button onClick={()=>setView("alternatives")} style={{...btn("transparent",C.textSec,C.border), padding:"6px 14px", boxShadow:"none", fontSize:13}}>← Back to alternatives</button>
            </div>
            <MedicineDetailView medicine={detailMed} />
          </>
        )}
      </main>
    </>
  );
}
