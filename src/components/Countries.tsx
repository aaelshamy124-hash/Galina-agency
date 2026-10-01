import React, { useState } from "react";
import { 
  Globe, Search, Award, ShieldAlert, Anchor, CheckCircle2, ChevronRight, DollarSign, Users, Sparkles
} from "lucide-react";
import { Country } from "../types";

interface CountriesProps {
  countries: Country[];
}

export default function Countries({ countries }: CountriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVibe, setFilterVibe] = useState<"All" | "Excellent" | "Good" | "Competitive">("All");

  const filtered = countries.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.currency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVibe === "All" ? true : c.marketVibe === filterVibe;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6" id="countries-tab">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">Target Global Markets</h1>
          <p className="text-sm text-slate-500 mt-1">Socio-economic parameters, customs duties, and import certifications required per destination.</p>
        </div>
      </div>

      {/* Filtering Options */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-xs flex-1">
          <Search className="text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search country, currency, or language..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="text-xs bg-transparent border-none outline-none w-full"
          />
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(["All", "Excellent", "Good", "Competitive"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterVibe(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                filterVibe === tab 
                  ? "bg-white text-teal-800 shadow-xs" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden hover:border-teal-100 transition flex flex-col justify-between">
            {/* Country Header */}
            <div className="p-5 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base font-display">{c.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">ISO: {c.code}</p>
                  </div>
                </div>
                
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  c.marketVibe === "Excellent" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                  c.marketVibe === "Good" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                  "bg-slate-100 text-slate-700 border border-slate-200"
                }`}>
                  {c.marketVibe} Market
                </span>
              </div>

              {/* Economic parameters */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                <div className="text-center border-r border-slate-200/50">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Pop</p>
                  <p className="font-bold text-slate-700 mt-0.5">{c.population}</p>
                </div>
                <div className="text-center border-r border-slate-200/50">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Food Imp.</p>
                  <p className="font-bold text-slate-700 mt-0.5">{c.foodImportValue}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Tariff</p>
                  <p className="font-bold text-slate-700 mt-0.5">{c.tariffRate}</p>
                </div>
              </div>

              {/* Core Port Infrastructure */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-start gap-1.5 text-slate-600">
                  <Anchor size={13} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Primary Sea Ports</p>
                    <p className="text-[11px] font-medium text-slate-700">{c.ports.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Certifications Required */}
            <div className="p-4 bg-slate-50/50 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                  <Award size={11} className="text-teal-600" />
                  <span>Mandatory Import Certificates</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {c.certificates.map(cert => (
                    <span 
                      key={cert}
                      className="bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-500"></span>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Customs details summary */}
              <div className="mt-3 pt-3 border-t border-slate-200/30 flex items-center justify-between text-[10px] text-slate-400">
                <span>Currency: <strong>{c.currency}</strong></span>
                <span>Language: <strong>{c.language}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
