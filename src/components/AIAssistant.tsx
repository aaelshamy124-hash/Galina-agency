import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Bot, User, Trash2, ArrowRight, ShieldCheck, 
  ExternalLink, Search, CheckCircle2, XCircle, AlertTriangle, 
  Globe, Mail, Phone, MapPin, Building2, Copy, Check, RefreshCw
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string }>;
}

export interface VerificationResult {
  companyName: string;
  verificationStatus: "Verified" | "Partially Verified" | "Unverified";
  officialWebsite: { value: string; status: "Verified" | "Unverified" };
  email: { value: string; status: "Verified" | "Unverified" };
  phone: { value: string; status: "Verified" | "Unverified" };
  address: { value: string; status: "Verified" | "Unverified" };
  businessActivity: { value: string; status: "Verified" | "Unverified" };
  targetCropsInterest?: string;
  confidenceScore: number;
  conciseSummary: string;
  sources: Array<{ title: string; url: string }>;
}

export default function AIAssistant() {
  // Verification states
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `**Galina Export Advisor AI** is active and ready.

I am your rapid export advisor and international client verifier for Galina Group Egypt. I use live web search and authoritative B2B registries to verify companies globally with strict authenticity.

**How can I assist you right now?**
- Verify any international buyer's company name, official website, procurement email, phone number, address, and core activity.
- Check target market readiness and tariff requirements for Egyptian IQF Strawberry, Mango, Broccoli, and Artichoke.
- Evaluate supply chain risks and negotiate B2B container contracts with European, US, and Gulf importers.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Direct Client Verification Execution
  const handleVerifyClient = async (companyNameToVerify?: string) => {
    const target = (companyNameToVerify || verifyQuery).trim();
    if (!target) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/gemini/verify-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: target })
      });

      if (!response.ok) {
        throw new Error("Verification service failed.");
      }

      const data: VerificationResult = await response.json();
      setVerificationResult(data);
    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        companyName: target,
        verificationStatus: "Unverified",
        officialWebsite: { value: "Unverified - network error", status: "Unverified" },
        email: { value: "Unverified", status: "Unverified" },
        phone: { value: "Unverified", status: "Unverified" },
        address: { value: "Unverified", status: "Unverified" },
        businessActivity: { value: "Unverified", status: "Unverified" },
        confidenceScore: 0,
        conciseSummary: "Unable to verify at this time. Please ensure server connectivity and valid GEMINI_API_KEY.",
        sources: []
      });
    } finally {
      setVerifying(false);
    }
  };

  // 2. Chat Send Handler
  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    if (!textToSend) setInput("");

    const updatedMessages = [...messages, { role: "user", content: prompt } as Message];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error("Unable to contact export AI node.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.text,
        sources: data.sources || []
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, could not communicate with the Galina Export Advisor AI engine. Please verify your GEMINI_API_KEY settings in the server environment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Export Advisor session reset. How can I assist you with international client verification or market analysis today?"
      }
    ]);
  };

  const verificationPresets = [
    "EDEKA ZENTRALE (Germany)",
    "Döhler Group (Germany)",
    "Brakes Group (UK)",
    "Sysco Corporation (USA)",
    "Almarai Company (Saudi Arabia)"
  ];

  const suggestions = [
    { text: "Verify procurement contacts for German IQF strawberry buyers", icon: "🍓" },
    { text: "Check import tariffs & FDA standards for Egypt produce in USA", icon: "🇺🇸" },
    { text: "Identify verified French frozen vegetable distributors", icon: "🇫🇷" },
    { text: "Draft executive B2B proposal for UK food service wholesalers", icon: "📑" }
  ];

  return (
    <div className="space-y-6" id="ai-assistant-tab">
      
      {/* 1. Global Client Verifier Engine Panel (Top Feature) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500 text-teal-950 rounded-xl shadow-md font-bold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base font-display text-white">
                  Global Client Verifier
                </h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold">
                  Live Web Search Grounding
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Authoritative verification of Company Name, Official Website, Email, Phone, Address, and Business Activity without guesswork.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Quick Verify:</span>
            {verificationPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setVerifyQuery(preset);
                  handleVerifyClient(preset);
                }}
                disabled={verifying}
                className="bg-slate-800/90 hover:bg-teal-700/80 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer text-[10px] font-medium"
              >
                {preset.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Input Bar */}
        <div className="p-5 bg-slate-50/70 border-b border-slate-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyClient();
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter international company name (e.g. EDEKA, Sysco, Döhler, Rewe, Brakes Group)..."
                value={verifyQuery}
                onChange={(e) => setVerifyQuery(e.target.value)}
                disabled={verifying}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent font-medium shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !verifyQuery.trim()}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer shrink-0"
            >
              {verifying ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying via Sources...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Verify Client Globally</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {verificationResult && (
          <div className="p-6 bg-white animate-in fade-in duration-300 space-y-5">
            {/* Top Bar: Company Name & Overall Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="font-extrabold text-base text-slate-900 font-display">
                    {verificationResult.companyName}
                  </h4>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    verificationResult.verificationStatus === "Verified"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : verificationResult.verificationStatus === "Partially Verified"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}>
                    {verificationResult.verificationStatus === "Verified" ? (
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={12} className="text-amber-600" />
                    )}
                    <span>{verificationResult.verificationStatus}</span>
                  </span>
                </div>
                {verificationResult.targetCropsInterest && (
                  <p className="text-xs text-teal-800 font-semibold mt-1">
                    Produce Demand: {verificationResult.targetCropsInterest}
                  </p>
                )}
              </div>

              {/* Confidence Score & Action */}
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Verification Confidence</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full rounded-full ${
                          verificationResult.confidenceScore >= 80 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${verificationResult.confidenceScore}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-xs text-slate-800">{verificationResult.confidenceScore}%</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(JSON.stringify(verificationResult, null, 2), "dossier")}
                  className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition bg-slate-50"
                  title="Copy Verification Dossier"
                >
                  {copiedKey === "dossier" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Grid of Verified Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              
              {/* 1. Official Website */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Globe size={12} className="text-teal-600" />
                    <span>Official Website</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    verificationResult.officialWebsite.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {verificationResult.officialWebsite.status}
                  </span>
                </div>
                {verificationResult.officialWebsite.value.startsWith("http") ? (
                  <a
                    href={verificationResult.officialWebsite.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{verificationResult.officialWebsite.value}</span>
                    <ExternalLink size={10} className="shrink-0" />
                  </a>
                ) : (
                  <span className="font-semibold text-slate-600 break-all">{verificationResult.officialWebsite.value}</span>
                )}
              </div>

              {/* 2. Procurement Email */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Mail size={12} className="text-teal-600" />
                    <span>Procurement / Contact Email</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    verificationResult.email.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {verificationResult.email.status}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 block break-all">{verificationResult.email.value}</span>
              </div>

              {/* 3. Direct Phone Numbers */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Phone size={12} className="text-teal-600" />
                    <span>Contact Phone</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    verificationResult.phone.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {verificationResult.phone.status}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 block">{verificationResult.phone.value}</span>
              </div>

              {/* 4. Physical Headquarters Address */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" />
                    <span>Headquarters Address</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    verificationResult.address.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {verificationResult.address.status}
                  </span>
                </div>
                <span className="font-medium text-slate-800 block">{verificationResult.address.value}</span>
              </div>

              {/* 5. Business Activity */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Building2 size={12} className="text-teal-600" />
                    <span>Business Activity</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    verificationResult.businessActivity.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {verificationResult.businessActivity.status}
                  </span>
                </div>
                <span className="font-medium text-slate-800 block line-clamp-2">{verificationResult.businessActivity.value}</span>
              </div>

            </div>

            {/* Concise Summary */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-950 space-y-1">
              <strong className="block font-bold text-[11px] uppercase tracking-wider text-teal-800">
                Executive Verification Summary:
              </strong>
              <p className="leading-relaxed">{verificationResult.conciseSummary}</p>
            </div>

            {/* Clickable Verification Source URLs */}
            {verificationResult.sources && verificationResult.sources.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Corroborated Verification Sources & Public Registries:
                </span>
                <div className="flex flex-wrap gap-2">
                  {verificationResult.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-medium transition"
                    >
                      <span className="line-clamp-1">{src.title}</span>
                      <ExternalLink size={10} className="text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* 2. Interactive Advisor AI Chat Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[560px] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-teal-400 rounded-xl">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                <span>Galina Export Advisor AI Chat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <p className="text-[10px] text-slate-500">Autonomous produce trade advisor with live Google Search</p>
            </div>
          </div>

          <button 
            onClick={clearChat}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center h-8 w-8 shadow-xs ${
                msg.role === "user" ? "bg-slate-900 text-white" : "bg-teal-600 text-white"
              }`}>
                {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div className="space-y-2">
                <div className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-xs ${
                  msg.role === "user" 
                    ? "bg-slate-900 text-white font-medium" 
                    : "bg-slate-50 text-slate-800 border border-slate-200"
                }`}>
                  {msg.content}
                </div>

                {/* Grounding sources for assistant message */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Sources:</span>
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md"
                      >
                        <span className="line-clamp-1">{src.title}</span>
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="p-2 rounded-xl bg-teal-600 text-white h-8 w-8 flex items-center justify-center animate-pulse">
                <Bot size={15} />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2.5">
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-200"></span>
                <span className="text-xs font-semibold text-slate-600">Verifying live databases & calculating trade metrics...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggestions & Input Bar */}
        <div className="p-4 border-t border-slate-200 shrink-0 space-y-3 bg-white">
          {messages.length <= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.text)}
                  className="text-left p-2.5 bg-slate-50 hover:bg-slate-100 transition border border-slate-200 rounded-xl text-[11px] text-slate-700 font-medium flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="line-clamp-1 flex-1">{s.text}</span>
                  <ArrowRight size={12} className="text-slate-400" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-transparent">
            <input
              type="text"
              placeholder="Ask Galina Export Advisor AI to verify clients, tariffs, cold pitch angles..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-xs px-3 text-slate-800 placeholder-slate-400 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg transition shrink-0 cursor-pointer shadow-xs"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
