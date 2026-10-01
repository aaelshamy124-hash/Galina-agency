import React from "react";
import { 
  Building2, Calendar, MapPin, Award, ExternalLink, Globe, HelpCircle, ShieldAlert
} from "lucide-react";
import { Competitor, Exhibition } from "../types";

interface CompetitorsExhibitionsProps {
  competitors: Competitor[];
  exhibitions: Exhibition[];
}

export default function CompetitorsExhibitions({ competitors, exhibitions }: CompetitorsExhibitionsProps) {
  return (
    <div className="space-y-8" id="competitors-tab">
      
      {/* 1. Global Trade Exhibitions Directory */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">International Trade Exhibitions</h1>
          <p className="text-sm text-slate-500 mt-1">Crucial global B2B expos where Galina secures major annual import contracts and meets key buyers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exhibitions.map(ex => (
            <div key={ex.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm font-display">{ex.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {ex.location}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {ex.attendees.split(",")[0]}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {ex.description}
                </p>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold"><Calendar size={13} className="text-teal-600" /> {ex.date}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 mt-4 flex justify-end">
                <a 
                  href={ex.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Exhibition Portal</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Global Competitors Tracker */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold tracking-tight font-display text-slate-900">Global Competitors Intel</h2>
          <p className="text-sm text-slate-500 mt-1">Pricing strategy, certifications, and target markets of global IQF frozen-food exporters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitors.map(comp => (
            <div key={comp.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                    <Globe size={14} className="text-teal-600" />
                    <span>{comp.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">HQ Country: <strong>{comp.country}</strong></p>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  comp.pricingIndex === "Premium" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                  comp.pricingIndex === "Competitive" ? "bg-teal-50 text-teal-700 border border-teal-100" :
                  "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {comp.pricingIndex} Price Tier
                </span>
              </div>

              {/* Core crop lines */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Crop Focus</p>
                <div className="flex flex-wrap gap-1">
                  {comp.products.map(prod => (
                    <span key={prod} className="bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications and target expos */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 text-[11px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[9px]">Sourced Certifications</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{comp.certifications.join(", ")}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase text-[9px]">Attended Expos</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{comp.exhibitions.join(", ")}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
