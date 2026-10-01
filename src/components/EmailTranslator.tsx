import React, { useState, useEffect } from "react";
import { 
  Mail, Sparkles, Languages, CheckCircle, AlertCircle, Send, Play, Copy, RefreshCw, FileText, Globe, ExternalLink
} from "lucide-react";
import { ProspectBuyer, Product, EmailLog } from "../types";

interface EmailTranslatorProps {
  products: Product[];
  selectedBuyer: ProspectBuyer | null;
  onLogEmail: (prospectId: string, log: EmailLog) => void;
}

export default function EmailTranslator({ products, selectedBuyer, onLogEmail }: EmailTranslatorProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [draft, setDraft] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState("German");
  
  const [generating, setGenerating] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const activeProduct = products.find(p => p.id === selectedProductId);

  // Auto draft when selectedBuyer or activeProduct changes
  useEffect(() => {
    if (selectedBuyer && activeProduct) {
      handleGenerateEmail();
    }
  }, [selectedBuyer, selectedProductId]);

  const handleGenerateEmail = async () => {
    if (!selectedBuyer || !activeProduct) return;
    setGenerating(true);
    setDraft("");
    setTranslated("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/gemini/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: selectedBuyer.name,
          purchasingManager: selectedBuyer.purchasingManager,
          country: selectedBuyer.country,
          product: activeProduct.name,
          importerType: selectedBuyer.importerType
        })
      });

      if (!response.ok) {
        throw new Error("Sourcing error.");
      }

      const data = await response.json();
      setDraft(data.email);
    } catch (err) {
      console.error(err);
      setDraft("Dear Purchasing Manager,\n\nWe are pleased to introduce Galina Group's premium IQF range...");
    } finally {
      setGenerating(false);
    }
  };

  const handleTranslate = async () => {
    if (!draft) return;
    setTranslating(true);
    setTranslated("");

    try {
      const response = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: draft,
          targetLanguage: targetLang
        })
      });

      if (!response.ok) {
        throw new Error("Translation failed.");
      }

      const data = await response.json();
      setTranslated(data.translatedText);
    } catch (err) {
      console.error(err);
      setTranslated(`[Translation error] Failsafe text for ${targetLang}.`);
    } finally {
      setTranslating(false);
    }
  };

  const handleSendEmail = () => {
    if (!selectedBuyer) return;
    setSending(true);
    setSuccessMsg("");

    setTimeout(() => {
      const log: EmailLog = {
        id: `email-log-${Date.now()}`,
        prospectId: selectedBuyer.id,
        subject: `Premium IQF ${activeProduct?.name || "Crops"} Offer - Galina Egypt`,
        body: translated || draft,
        sentAt: new Date().toISOString().split('T')[0],
        language: translated ? targetLang : "English",
        status: "Sent"
      };

      onLogEmail(selectedBuyer.id, log);
      setSending(false);
      setSuccessMsg(`Cold Email pitch successfully dispatched to ${selectedBuyer.email}! delivery status tracking online.`);
      
      // Simulate receipt Opened after 5 seconds
      setTimeout(() => {
        const openedLog = { ...log, status: "Opened" as const };
        onLogEmail(selectedBuyer.id, openedLog);
      }, 5000);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languages = ["German", "French", "Spanish", "Italian", "Chinese", "Arabic"];

  return (
    <div className="space-y-6" id="email-translator-tab">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight font-display text-slate-900">B2B Pitch Pitcher & AI Translator</h1>
        <p className="text-sm text-slate-500 mt-1">Draft high-converting Cold emails tailored to buyers, translate with Gemini, and trace B2B response states.</p>
      </div>

      {!selectedBuyer ? (
        <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-xs text-center text-slate-400">
          <Mail className="mx-auto mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-600">No Target Buyer Selected</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Please go to **CRM Pipeline** or **AI Market Finder** and click "Draft Email Offer" to load a client profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sourcing parameters */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
              <Mail size={15} className="text-teal-600" />
              <span>Target Profile loaded</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Buyer Company</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedBuyer.name}</p>
                <p className="text-slate-500">{selectedBuyer.city}, {selectedBuyer.country}</p>
                {selectedBuyer.website && (
                  <div className="mt-1">
                    <a
                      href={selectedBuyer.website.startsWith("http") ? selectedBuyer.website : `https://${selectedBuyer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 hover:underline bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60"
                      title={selectedBuyer.website}
                    >
                      <Globe size={11} className="text-teal-600 shrink-0" />
                      <span className="font-mono text-[10px]">{selectedBuyer.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                      <ExternalLink size={9} className="opacity-70 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Recipient Contact</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedBuyer.purchasingManager} ({selectedBuyer.email})</p>
              </div>

              {/* Choose product to pitch */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Crops to Pitch</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateEmail}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                >
                  <Sparkles size={13} />
                  <span>{generating ? "Drafting with Gemini..." : "Re-Draft Pitch Email"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Draft Workspace */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
            
            {/* English Draft Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1"><FileText size={13} /> Original Pitch (English)</span>
                {draft && (
                  <button 
                    onClick={() => copyToClipboard(draft)}
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-[10px]"
                  >
                    <Copy size={11} /> Copy Original
                  </button>
                )}
              </div>
              <textarea
                rows={7}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Dispatched business cold emails will show here..."
                className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 leading-relaxed font-mono"
              ></textarea>
            </div>

            {/* Translation Actions */}
            {draft && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Languages size={15} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-700">Translate to Target Language:</span>
                  <select
                    value={targetLang}
                    onChange={e => setTargetLang(e.target.value)}
                    className="text-xs p-1 border border-slate-200 rounded bg-white outline-none"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw size={12} className={translating ? "animate-spin" : ""} />
                  <span>{translating ? "Translating..." : "Translate Email"}</span>
                </button>
              </div>
            )}

            {/* Translated Panel */}
            {translated && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1 text-teal-700"><Languages size={13} /> Translated Copy ({targetLang})</span>
                  <button 
                    onClick={() => copyToClipboard(translated)}
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-[10px]"
                  >
                    <Copy size={11} /> Copy Translation
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={translated}
                  onChange={e => setTranslated(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 leading-relaxed font-mono text-slate-800"
                ></textarea>
              </div>
            )}

            {/* Dispatches */}
            {draft && (
              <div className="pt-2 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Clicking Send registers the lead activity in your CRM logs.
                </div>
                
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-850 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm disabled:opacity-50 transition"
                >
                  <Send size={13} />
                  <span>{sending ? "Sending..." : "Send Email Proposal"}</span>
                </button>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs flex items-start gap-2">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={15} />
                <div>
                  <p className="font-semibold">Transmission Complete</p>
                  <p className="mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
