import React, { useRef } from "react";
import { 
  FileText, Printer, Award, ShieldAlert, CheckSquare, Layers, Globe, Clock, CheckCircle
} from "lucide-react";
import { Product, Country, ProspectBuyer, Supplier } from "../types";

interface ReportsProps {
  products: Product[];
  countries: Country[];
  buyers: ProspectBuyer[];
  suppliers: Supplier[];
}

export default function Reports({ products, countries, buyers, suppliers }: ReportsProps) {
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const wonBuyers = buyers.filter(b => b.status === "Won");
  const negotiationBuyers = buyers.filter(b => b.status === "Negotiation");
  const sampleBuyers = buyers.filter(b => b.status === "Sample Sent");

  return (
    <div className="space-y-6" id="reports-tab">
      
      {/* Configuration Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 no-print">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">Technical Export Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Generate beautifully formatted summaries of current trade pipelines, target certifications, and supply chain readiness.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white transition px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
        >
          <Printer size={15} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Report Print Area */}
      <div ref={printAreaRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-8 font-sans text-slate-800">
        
        {/* Report Corporate Letterhead Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-teal-800 pb-6 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-teal-900 text-teal-100 font-bold px-2 py-0.5 rounded">
                ✓ VERIFIED – OFFICIAL COMPANY SOURCE
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Official Domain: <a href="https://galina-eg.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-bold">galina-eg.com</a>
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-teal-900 font-display">Export Market Intelligence &amp; Lead Generator</h2>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Galina Agro-Export Group · Alexandria &amp; Beheira Processing Hubs, Egypt</p>
            <p className="text-[10px] text-slate-400">Official Portal: https://galina-eg.com · BRCGS Grade AA · IFS Food v8 · FDA FSVP Compliant</p>
          </div>
          <div className="sm:text-right shrink-0">
            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg text-xs font-bold uppercase">
              Official Technical Dossier
            </span>
            <p className="text-xs text-slate-600 font-medium mt-2">Report Generated: {new Date().toISOString().split("T")[0]}</p>
            <p className="text-[10px] text-slate-400 font-mono">Ref: GEX-2026-INTEL-01</p>
          </div>
        </div>

        {/* Executive summary block */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-bold text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <FileText size={14} />
            <span>1. Executive Trade Summary</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This technical trade dossier has been compiled dynamically for <strong>Galina Egypt</strong>. It covers our target global markets, Active Individual Quick Freezing (IQF) crop catalog, local Egyptian sourcing farms, and current B2B client pipeline status. Currently, we operate active export channels in <strong>{countries.length} destination countries</strong> and hold active trade talks with <strong>{buyers.length} international prospects</strong>.
          </p>
        </div>

        {/* Sourcing/Logistics readiness check */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Layers size={14} />
            <span>2. IQF Production Lines & Sourcing Readiness</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <p className="font-bold text-slate-500 uppercase text-[9px]">Registered Production Lines ({products.length})</p>
              <ul className="space-y-1.5">
                {products.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">{p.name} ({p.hsCode})</span>
                    <span className="text-[10px] text-slate-400">Season: {p.seasonStart} - {p.seasonEnd}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-500 uppercase text-[9px]">Verified Agricultural Suppliers ({suppliers.length})</p>
              <ul className="space-y-1.5">
                {suppliers.map(s => (
                  <li key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">{s.name} ({s.type})</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{s.certificates[0]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CRM B2B Sales Pipeline audit */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Globe size={14} />
            <span>3. Active Sourcing Negotiations (CRM Auditing)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold border-b border-slate-200">
                  <th className="p-2.5">Buyer Company</th>
                  <th className="p-2.5">Country</th>
                  <th className="p-2.5">Purchasing Manager</th>
                  <th className="p-2.5 text-center">AI Fit</th>
                  <th className="p-2.5 text-right">Negotiation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buyers.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-700">
                      <div>{b.name}</div>
                      {b.website && (
                        <a
                          href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-normal text-teal-600 hover:underline mt-0.5"
                        >
                          <Globe size={10} />
                          <span>{b.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-500">{b.country}</td>
                    <td className="p-2.5 text-slate-500">{b.purchasingManager}</td>
                    <td className="p-2.5 text-center text-teal-600 font-bold">{b.aiScore}%</td>
                    <td className="p-2.5 text-right">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality certifications & policy assurance */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-bold text-teal-800 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <Award size={14} />
            <span>4. Quality Assurance & Cold Chain Compliance</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All registered Egyptian agricultural lots conform strictly to maximum residue limit (MRL) parameters required by destination jurisdictions (including FDA, CFIA, and EU regulations). Quick freezing operates at a static tunnel threshold of -40°C, and ocean transport requires reefers maintaining uniform -18°C temperature logs. BRCGS and IFS certificates are regularly renewed to guarantee continuous global compliance.
          </p>
        </div>

        {/* Signatures and Sign-off */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-600">Report Compiled By:</p>
            <p className="font-bold text-slate-800 mt-1 font-display">Galina Export Intelligence AI Engine</p>
            <p className="text-[10px] text-slate-400">Autonomous Trade Analytics System</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-600">Authorized Export Director Signature:</p>
            <div className="h-8 w-32 border-b border-slate-300 ml-auto mt-2 italic font-mono text-xs text-slate-300">
              Galina Quality Node
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Galina Egypt Import-Export Hub</p>
          </div>
        </div>

      </div>
    </div>
  );
}
