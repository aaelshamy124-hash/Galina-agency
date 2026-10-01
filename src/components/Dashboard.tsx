import React from "react";
import { 
  Globe, Users, Layers, Award, TrendingUp, AlertCircle, Ship, MapPin, CheckCircle
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Product, Country, ProspectBuyer } from "../types";

interface DashboardProps {
  products: Product[];
  countries: Country[];
  buyers: ProspectBuyer[];
  setActiveTab: (tab: string) => void;
  setSelectedCountry: (c: Country) => void;
}

export default function Dashboard({ products, countries, buyers, setActiveTab, setSelectedCountry }: DashboardProps) {
  // Compute analytics
  const activeLeadsCount = buyers.length;
  const wonLeadsCount = buyers.filter(b => b.status === "Won").length;
  const totalEmployeesContacted = buyers.reduce((acc, curr) => acc + (curr.employees || 0), 0);
  
  // Pipeline status counts
  const pipelineStats = [
    { name: "New Lead", count: buyers.filter(b => b.status === "New Lead").length, color: "#94a3b8" },
    { name: "Contacted", count: buyers.filter(b => b.status === "Contacted").length, color: "#38bdf8" },
    { name: "Negotiation", count: buyers.filter(b => b.status === "Negotiation").length, color: "#fbbf24" },
    { name: "Sample Sent", count: buyers.filter(b => b.status === "Sample Sent").length, color: "#c084fc" },
    { name: "Won", count: buyers.filter(b => b.status === "Won").length, color: "#10b981" },
    { name: "Lost", count: buyers.filter(b => b.status === "Lost").length, color: "#f87171" }
  ];

  // Country attractiveness rating
  const countryStatusData = [
    { name: "Excellent Markets", value: countries.filter(c => c.marketVibe === "Excellent").length, color: "#0d9488" },
    { name: "Good Markets", value: countries.filter(c => c.marketVibe === "Good").length, color: "#d97706" },
    { name: "Competitive", value: countries.filter(c => c.marketVibe === "Competitive").length, color: "#64748b" }
  ];

  // Map markers for top hubs
  const mapHubs = [
    { name: "USA Hub", x: "15%", y: "30%", score: "96%", status: "Excellent" },
    { name: "Western Europe", x: "48%", y: "25%", score: "98%", status: "Excellent" },
    { name: "Poland Hub", x: "54%", y: "22%", score: "94%", status: "Excellent" },
    { name: "GCC (Saudi/UAE)", x: "60%", y: "45%", score: "97%", status: "Excellent" },
    { name: "East Asia (Japan/Korea)", x: "85%", y: "35%", score: "88%", status: "Competitive" },
    { name: "Brazil Hub", x: "32%", y: "70%", score: "85%", status: "Competitive" }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">Export Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time B2B intelligence, pipeline flow, and target markets for Galina IQF.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Galina Cloud Service: Active (Alexandria Node)
        </div>
      </div>

      {/* Seasonal Alert Broadcast */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-4 rounded-xl shadow-sm border border-teal-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6 pointer-events-none">
          <Globe size={240} />
        </div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-teal-800/80 rounded-lg shrink-0 mt-0.5 md:mt-0">
              <AlertCircle className="text-teal-300" size={20} />
            </div>
            <div>
              <span className="bg-teal-700/80 text-teal-200 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
                AI Seasonality Alert
              </span>
              <h3 className="text-sm font-semibold mt-1">Surge in European IQF Strawberry Demand Detected</h3>
              <p className="text-xs text-teal-100 mt-0.5 max-w-2xl">
                Unfavorable weather has severely disrupted local harvests in Poland and Serbia. Wholesalers in Germany and France are aggressively sourcing alternative BRCGS-certified supplies. Recommended: Push **IQF Strawberry** campaigns to Western Europe immediately.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("finder")}
            className="shrink-0 bg-white text-teal-900 hover:bg-teal-50 transition px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
          >
            Launch Market Finder
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Target Markets</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">{countries.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total B2B Leads</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">{activeLeadsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Won Contracts</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">{wonLeadsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">IQF Product Lines</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Global Coverage</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">
              {Math.round((wonLeadsCount / (activeLeadsCount || 1)) * 100)}%
            </h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Vector Hub Map */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Global Export Network & Target Regions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hover or evaluate key shipping corridors and AI demand spots.</p>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span> Excellent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Competitive</span>
            </div>
          </div>
          
          {/* Simulated world map container */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg h-64 relative overflow-hidden flex items-center justify-center">
            {/* World Map Grids / Outlines */}
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Minimal Map Art SVG Representation */}
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 absolute inset-0 text-slate-800 pointer-events-none">
              {/* North America */}
              <path d="M50,100 L150,80 L250,110 L300,160 L280,240 L220,280 L180,220 L120,180 Z" fill="currentColor" />
              {/* South America */}
              <path d="M220,300 L260,320 L290,380 L270,440 L230,480 L190,400 Z" fill="currentColor" />
              {/* Europe */}
              <path d="M450,120 L550,100 L580,150 L530,220 L440,200 Z" fill="currentColor" />
              {/* Africa */}
              <path d="M450,220 L520,210 L590,260 L580,340 L530,420 L480,380 L440,280 Z" fill="currentColor" />
              {/* Asia */}
              <path d="M580,110 L780,130 L880,180 L850,300 L750,340 L650,280 L580,200 Z" fill="currentColor" />
              {/* Australia */}
              <path d="M780,360 L840,380 L860,420 L800,440 Z" fill="currentColor" />
            </svg>

            {/* Egypt (Alexandria Base Node) */}
            <div className="absolute left-[54%] top-[40%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <span className="bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow mt-1 font-semibold whitespace-nowrap border border-slate-700">
                🇪🇬 ALEXANDRIA (HQ)
              </span>
            </div>

            {/* Hub markers */}
            {mapHubs.map((hub, idx) => (
              <div 
                key={idx} 
                className="absolute flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md border border-slate-200/80 shadow-xs"
                style={{ left: hub.x, top: hub.y }}
              >
                <MapPin size={10} className={hub.status === "Excellent" ? "text-teal-600" : "text-amber-500"} />
                <div className="text-[10px]">
                  <p className="font-semibold text-slate-800 line-clamp-1">{hub.name}</p>
                  <p className="text-[8px] text-slate-500">AI Score: <span className="font-bold text-teal-600">{hub.score}</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Ship size={14} className="text-teal-600" />
                <span>Rotterdam Corridor</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Transit: 7-9 days (Reefer)</p>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-500 h-1" style={{ width: "95%" }}></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Ship size={14} className="text-teal-600" />
                <span>Jeddah Islamic Port</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Transit: 3 days (Fast Marine)</p>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-500 h-1" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Ship size={14} className="text-amber-600" />
                <span>New York Gateway</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Transit: 14-16 days (Atlantic Line)</p>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-400 h-1" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Attractiveness Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col">
          <h3 className="font-semibold text-slate-800 text-sm mb-1">Market Quality Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Evaluation categorization of listed country profiles.</p>
          
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {countryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Countries`, 'Markets']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {countryStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRM Pipeline Flow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Pipeline Funnel chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">B2B CRM Pipeline Funnel</h3>
              <p className="text-xs text-slate-400 mt-0.5">Visual representation of active import negotiations.</p>
            </div>
            <button 
              onClick={() => setActiveTab("crm")}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
            >
              Open B2B Pipeline →
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value) => [`${value} Leads`, 'Total']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipelineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sourcing & Supply Assurance Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Local Sourcing Assurance</h3>
            <p className="text-xs text-slate-400 mb-4">Securing raw fruit/vegetable inputs from verified farms.</p>
            
            <div className="space-y-3">
              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100/50 flex items-start gap-2.5">
                <CheckCircle size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-teal-900">100% GLOBALG.A.P. Certified</h4>
                  <p className="text-[11px] text-teal-700 mt-0.5">All registered local suppliers in Beheira & Suez conform to strict pesticide control criteria.</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 flex items-start gap-2.5">
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-900">Cold Chain Integrated Log</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Suez reefers operate at static -18°C monitoring linked directly to export customs clearance nodes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Egypt Trade Score:</span>
            <span className="font-bold text-slate-700">A+ Stable</span>
          </div>
        </div>

      </div>
    </div>
  );
}
