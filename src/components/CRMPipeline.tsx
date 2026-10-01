import React, { useState } from "react";
import { 
  Building2, MapPin, Mail, Phone, ExternalLink, Calendar, Edit3, 
  Trash2, MailWarning, MessageCircle, CheckCircle, HelpCircle, Save, Globe
} from "lucide-react";
import { ProspectBuyer } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface CRMPipelineProps {
  buyers: ProspectBuyer[];
  onUpdateBuyerStatus: (id: string, status: ProspectBuyer["status"]) => void;
  onUpdateBuyerNotes: (id: string, notes: string) => void;
  onDeleteBuyer: (id: string) => void;
  onSelectBuyerForEmail: (buyer: ProspectBuyer) => void;
}

export default function CRMPipeline({ 
  buyers, onUpdateBuyerStatus, onUpdateBuyerNotes, onDeleteBuyer, onSelectBuyerForEmail 
}: CRMPipelineProps) {
  const { lang } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const statuses: ProspectBuyer["status"][] = [
    "New Lead", "Contacted", "Negotiation", "Quotation", "Sample Sent", "Won", "Lost"
  ];

  const handleSaveNotes = (id: string) => {
    onUpdateBuyerNotes(id, noteText);
    setEditingId(null);
  };

  const startEditing = (buyer: ProspectBuyer) => {
    setEditingId(buyer.id);
    setNoteText(buyer.notes || "");
  };

  const getStatusStyle = (status: ProspectBuyer["status"]) => {
    switch (status) {
      case "New Lead": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Contacted": return "bg-sky-50 text-sky-700 border-sky-200";
      case "Negotiation": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Quotation": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Sample Sent": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Won": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Lost": return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const filteredBuyers = filterStatus === "All" 
    ? buyers 
    : buyers.filter(b => b.status === filterStatus);

  return (
    <div className="space-y-6" id="crm-tab">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">B2B CRM Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Track import negotiations, sample quality tests, and export delivery states.</p>
        </div>
      </div>

      {/* Kanban filter list */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl max-w-2xl">
        <button
          onClick={() => setFilterStatus("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filterStatus === "All" ? "bg-white text-teal-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All ({buyers.length})
        </button>
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === st ? "bg-white text-teal-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {st} ({buyers.filter(b => b.status === st).length})
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredBuyers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
            <Building2 className="mx-auto mb-3" size={36} />
            <p className="text-sm">No buyers currently registered in this pipeline stage.</p>
            <p className="text-xs text-slate-400 mt-1">Go to **AI Market Finder** or click **New Lead** to append target buyers.</p>
          </div>
        ) : (
          filteredBuyers.map(buyer => (
            <div key={buyer.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Importer Metadata */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-400 shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-sm font-display">{buyer.name}</h3>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                        {buyer.importerType}
                      </span>
                      <span className="text-[10px] text-teal-600 font-extrabold bg-teal-50 px-2 py-0.5 rounded">
                        AI Match: {buyer.aiScore}%
                      </span>
                      {buyer.intentSignalScore && (
                        <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          ⚡ {lang === "ar" ? "طلب زراعي" : "Agro Intent"} {buyer.intentSignalScore}%
                        </span>
                      )}
                      {buyer.website && (
                        <a
                          href={buyer.website.startsWith("http") ? buyer.website : `https://${buyer.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50/80 border border-teal-200/60 px-2 py-0.5 rounded transition"
                          title={buyer.website}
                        >
                          <Globe size={11} className="text-teal-600 shrink-0" />
                          <span className="font-mono text-[10px]">{buyer.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                          <ExternalLink size={9} className="opacity-70 shrink-0" />
                        </a>
                      )}
                    </div>

                    {buyer.procurementRole && (
                      <p className="text-[11px] font-semibold text-teal-800 mt-0.5">
                        {buyer.procurementRole} • {buyer.purchasingManager}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {buyer.city}, {buyer.country}</span>
                      <a href={`mailto:${buyer.procurementEmail || buyer.email}`} className="flex items-center gap-1 font-mono text-teal-700 font-semibold hover:underline">
                        <Mail size={12} className="text-teal-600" /> {buyer.procurementEmail || buyer.email}
                      </a>
                      <div className="flex items-center gap-1 font-mono text-slate-700">
                        <Phone size={12} className="text-slate-400" /> {buyer.realPhone || buyer.phone}
                        <a 
                          href={`https://wa.me/${(buyer.realPhone || buyer.phone).replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 ml-1"
                          title={lang === "ar" ? "واتساب مباشر" : "Direct WhatsApp"}
                        >
                          💬
                        </a>
                      </div>
                      {buyer.contactVerified && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-200">
                          ✔ {lang === "ar" ? "اتصال رسمي موثق" : "Verified Official"}
                        </span>
                      )}
                    </div>

                    {/* Trade & Crop Indicators */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[10px]">
                      {buyer.requiredCrops && buyer.requiredCrops.length > 0 && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          🍓 {buyer.requiredCrops.slice(0, 2).join(", ")}
                        </span>
                      )}
                      {buyer.certificationsRequired && buyer.certificationsRequired.length > 0 && (
                        <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-medium">
                          🏅 {buyer.certificationsRequired.slice(0, 2).join(", ")}
                        </span>
                      )}
                      {buyer.annualImportVolume && (
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                          📦 {buyer.annualImportVolume.split("(")[0].trim()}
                        </span>
                      )}
                      {buyer.incoterms && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          🚢 {buyer.incoterms}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pipeline Status Trigger */}
                <div className="flex items-center gap-2">
                  <select
                    value={buyer.status}
                    onChange={e => onUpdateBuyerStatus(buyer.id, e.target.value as any)}
                    className={`text-xs p-1.5 rounded-lg border font-semibold outline-none ${getStatusStyle(buyer.status)}`}
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => onDeleteBuyer(buyer.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
                    title="Delete buyer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* CRM Discussion Notes Panel */}
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100/50 space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span>Discussion Logs & Sample Testing Status</span>
                  {editingId !== buyer.id ? (
                    <button 
                      onClick={() => startEditing(buyer)}
                      className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-[9px] font-semibold"
                    >
                      <Edit3 size={11} /> Edit Logs
                    </button>
                  ) : null}
                </div>

                {editingId === buyer.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Write current negotiation updates, specific quote rates, container requests, or sample logs..."
                      className="w-full text-xs p-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-teal-500"
                    ></textarea>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-white border border-slate-200 px-3 py-1 rounded text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(buyer.id)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-[10px] font-semibold flex items-center gap-1"
                      >
                        <Save size={10} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">
                    {buyer.notes ? `"${buyer.notes}"` : "No discussion logs added yet. Click edit logs to register notes."}
                  </p>
                )}
              </div>

              {/* Activity actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Last Sourcing Call: {buyer.lastContactDate || "None"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span>Pitch Emails: <strong>{buyer.emailsSentCount} sent</strong></span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a 
                    href={`https://wa.me/${buyer.phone.replace(/[^0-9]/g, "")}?text=Hello%20${buyer.purchasingManager},%20we%20are%20Galina%20Egypt%20regarding%20our%20premium%20IQF%20frozen%20catalogs...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp Pitch</span>
                  </a>

                  <button
                    onClick={() => onSelectBuyerForEmail(buyer)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Mail size={12} />
                    <span>Draft Email Offer</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
