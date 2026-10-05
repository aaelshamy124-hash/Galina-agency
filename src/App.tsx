import React, { useState, useEffect } from "react";
import { 
  Globe, Layers, Users, Award, ShieldAlert, Bot, Mail, FileText, 
  Settings, LogOut, MessageCircle, RefreshCw, Sparkles, Shield, Anchor, ShieldCheck,
  Check, ExternalLink, X
} from "lucide-react";

import { Product, Country, ProspectBuyer, Supplier, EmailLog, AppSettings } from "./types";
import { leadDatabase } from "./services/leadDatabase";
import { 
  INITIAL_PRODUCTS, INITIAL_COUNTRIES, INITIAL_BUYERS, 
  INITIAL_SUPPLIERS, INITIAL_EXHIBITIONS, INITIAL_COMPETITORS 
} from "./data";

import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Countries from "./components/Countries";
import MarketFinder from "./components/MarketFinder";
import LeadIntelligenceDatabase from "./components/LeadIntelligenceDatabase";
import CRMPipeline from "./components/CRMPipeline";
import Suppliers from "./components/Suppliers";
import CompetitorsExhibitions from "./components/CompetitorsExhibitions";
import AIAssistant from "./components/AIAssistant";
import EmailTranslator from "./components/EmailTranslator";
import Reports from "./components/Reports";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  // Shared States (synchronized with localStorage safely)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("galina_products") : null;
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.warn("Safe fallback for galina_products:", e);
      return INITIAL_PRODUCTS;
    }
  });

  const [countries] = useState<Country[]>(INITIAL_COUNTRIES);

  const [buyers, setBuyers] = useState<ProspectBuyer[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("galina_buyers") : null;
      return saved ? JSON.parse(saved) : INITIAL_BUYERS;
    } catch (e) {
      console.warn("Safe fallback for galina_buyers:", e);
      return INITIAL_BUYERS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("galina_suppliers") : null;
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch (e) {
      console.warn("Safe fallback for galina_suppliers:", e);
      return INITIAL_SUPPLIERS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedBuyerForEmail, setSelectedBuyerForEmail] = useState<ProspectBuyer | null>(null);
  
  // Official Company Settings (Brand Identity)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => leadDatabase.getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsDomain, setSettingsDomain] = useState(appSettings.official_company_domain);
  const [settingsName, setSettingsName] = useState(appSettings.official_company_name);
  const [settingsWebsite, setSettingsWebsite] = useState(appSettings.official_company_website);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = leadDatabase.updateSettings({
      official_company_domain: settingsDomain,
      official_company_name: settingsName,
      official_company_website: settingsWebsite
    });
    setAppSettings(updated);
    setIsSettingsOpen(false);
  };
  
  // User simulation role
  const [userRole, setUserRole] = useState<"Export Director" | "Sales Executive" | "CEO">("Export Director");

  // Sync to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem("galina_products", JSON.stringify(products));
    } catch (e) {
      console.warn("Could not save products to localStorage", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("galina_buyers", JSON.stringify(buyers));
    } catch (e) {
      console.warn("Could not save buyers to localStorage", e);
    }
  }, [buyers]);

  useEffect(() => {
    try {
      localStorage.setItem("galina_suppliers", JSON.stringify(suppliers));
    } catch (e) {
      console.warn("Could not save suppliers to localStorage", e);
    }
  }, [suppliers]);

  // Event handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers(prev => [newSup, ...prev]);
  };

  const handleAddProspect = (newProspect: ProspectBuyer) => {
    setBuyers(prev => {
      // Check if buyer already exists to prevent duplicate entries
      if (prev.some(b => b.name === newProspect.name)) return prev;
      return [newProspect, ...prev];
    });
  };

  const handleAddLeadToCRM = (lead: any) => {
    const prospect: ProspectBuyer = {
      id: lead.lead_id,
      name: lead.company_name,
      country: lead.country,
      city: lead.city,
      website: lead.official_website,
      email: lead.email,
      phone: lead.phone,
      linkedIn: lead.linkedin_company_url || "",
      purchasingManager: lead.contact_person,
      procurementRole: lead.contact_job_title,
      importerType: lead.business_type,
      companySize: "Large",
      employees: 250,
      yearsInBusiness: 15,
      importsFromEgypt: true,
      importsFromTurkey: false,
      importsFromChina: false,
      importsFromIndia: false,
      competitiveOpportunity: lead.reason_for_buyer_relevance,
      aiScore: lead.lead_quality_score,
      status: "New Lead",
      emailsSentCount: 0,
      requiredCrops: lead.product_categories || [lead.product_category],
      emailVerificationStatus: lead.email_verification_status === "VERIFIED" ? "VERIFIED – OFFICIAL COMPANY SOURCE" : "NOT VERIFIED",
      emailVerificationSource: lead.email_verification_reason,
      emailVerificationDate: lead.verification_date,
      source_evidence: lead.source_evidence,
      source_urls: lead.source_urls
    };
    handleAddProspect(prospect);
  };

  const handleUpdateBuyerStatus = (id: string, status: ProspectBuyer["status"]) => {
    setBuyers(prev => prev.map(b => b.id === id ? { 
      ...b, 
      status, 
      lastContactDate: new Date().toISOString().split('T')[0] 
    } : b));
  };

  const handleUpdateBuyerNotes = (id: string, notes: string) => {
    setBuyers(prev => prev.map(b => b.id === id ? { ...b, notes } : b));
  };

  const handleDeleteBuyer = (id: string) => {
    setBuyers(prev => prev.filter(b => b.id !== id));
  };

  const handleLogEmail = (prospectId: string, log: EmailLog) => {
    setBuyers(prev => prev.map(b => {
      if (b.id !== prospectId) return b;
      
      const updatedLogs = b.emailLogs ? [log, ...b.emailLogs] : [log];
      const newCount = b.emailsSentCount + 1;
      
      // If simulated opened/replied, map buyer notes or activity
      let newNotes = b.notes || "";
      if (log.status === "Opened") {
        newNotes = `Dispatched cold proposal opened by ${b.purchasingManager}. Ready to schedule follow-up reefer details.`;
      }

      return {
        ...b,
        emailsSentCount: newCount,
        emailLogs: updatedLogs,
        notes: newNotes,
        lastContactDate: log.sentAt
      };
    }));

    // If the active draft profile matches, sync selected buyer state
    if (selectedBuyerForEmail && selectedBuyerForEmail.id === prospectId) {
      setSelectedBuyerForEmail(prev => {
        if (!prev) return null;
        return {
          ...prev,
          emailsSentCount: prev.emailsSentCount + 1,
          lastContactDate: log.sentAt
        };
      });
    }
  };

  const handleSelectBuyerForEmail = (buyer: ProspectBuyer) => {
    setSelectedBuyerForEmail(buyer);
    setActiveTab("pitch");
  };

  const { lang, setLang, dir, t } = useLanguage();

  // Nav menus matching tabs with bilingual support
  const tabs = [
    { id: "dashboard", label: t("tabDashboard"), icon: Globe, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "products", label: t("tabProducts"), icon: Layers, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "countries", label: t("tabCountries"), icon: Anchor, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "finder", label: t("tabFinder"), icon: Sparkles, roles: ["Export Director", "CEO"] },
    { id: "lead_db", label: t("tabLeadDatabase"), icon: ShieldCheck, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "crm", label: t("tabCRM"), icon: Users, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "suppliers", label: t("tabSuppliers"), icon: Shield, roles: ["Export Director", "CEO"] },
    { id: "competitors", label: t("tabCompetitors"), icon: ShieldAlert, roles: ["Export Director", "CEO"] },
    { id: "advisor", label: t("tabAdvisor"), icon: Bot, roles: ["Export Director", "Sales Executive", "CEO"] },
    { id: "pitch", label: t("tabPitch"), icon: Mail, roles: ["Export Director", "Sales Executive"] },
    { id: "reports", label: t("tabReports"), icon: FileText, roles: ["Export Director", "CEO"] }
  ];

  const filteredTabs = tabs.filter(t => t.roles.includes(userRole));

  return (
    <div dir={dir} className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* 1. Global Header Bar with Language Switcher */}
      <header className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 text-white shadow-sm px-4 py-3 shrink-0 flex items-center justify-between no-print border-b border-teal-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-500 text-teal-950 p-2 rounded-lg shadow-sm font-extrabold text-xs tracking-wider flex items-center justify-center">
            G
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-sm font-display text-teal-50 flex items-center gap-1.5">
              <span>{t("brandTitle")}</span>
              <span className="text-[10px] bg-teal-600/60 text-teal-200 border border-teal-500/30 px-1.5 py-0.5 rounded-md font-semibold font-sans">
                {t("brandSubtitle")}
              </span>
            </h1>
            <p className="text-[9px] text-teal-300 font-medium">{t("brandTagline")}</p>
          </div>
        </div>

        {/* Right header controls: Official Company Badge, Role Simulation, Settings */}
        <div className="flex items-center gap-3">
          
          {/* Official Company Badge (Section 1 of Prompt) */}
          <div className="flex flex-col items-end border-r border-teal-800/80 pr-3 sm:pr-4">
            <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold tracking-wider uppercase">
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span>VERIFIED – OFFICIAL COMPANY SOURCE</span>
            </div>
            <div className="text-[11px] text-teal-100 flex items-center gap-1.5 mt-0.5">
              <span className="text-teal-300 font-medium">Official Domain:</span>
              <a 
                href={`https://${appSettings.official_company_domain}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-teal-200 underline font-bold font-mono tracking-tight flex items-center gap-0.5 transition-colors"
                title={`Visit official company domain https://${appSettings.official_company_domain}`}
              >
                <span>{appSettings.official_company_domain}</span>
                <ExternalLink className="w-2.5 h-2.5 text-teal-300" />
              </a>
            </div>
          </div>

          {/* Active Advisor Engine Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-teal-950/80 border border-teal-700/60 px-2.5 py-1 rounded-lg text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-[11px] text-teal-200">Export Advisor AI Active</span>
          </div>

          {/* User Role simulation selector */}
          <div className="hidden sm:flex items-center gap-1 bg-teal-800/60 border border-teal-700/50 px-2 py-1 rounded-lg text-xs">
            <span className="text-[10px] text-teal-300 font-medium mr-1">{t("simulationRole")}</span>
            <select
              value={userRole}
              onChange={e => {
                setUserRole(e.target.value as any);
                // Fallback to dashboard if target tab is restricted under new role
                const allowed = tabs.find(t => t.id === activeTab)?.roles.includes(e.target.value);
                if (!allowed) setActiveTab("dashboard");
              }}
              className="bg-transparent text-white font-bold outline-none text-xs border-none cursor-pointer"
            >
              <option value="Export Director" className="bg-slate-900 text-white">{t("roleExportDirector")}</option>
              <option value="Sales Executive" className="bg-slate-900 text-white">{t("roleSalesAgent")}</option>
              <option value="CEO" className="bg-slate-900 text-white">{t("roleCEO")}</option>
            </select>
          </div>

          {/* Admin Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 bg-teal-800/50 hover:bg-teal-700/70 border border-teal-700/50 text-teal-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Configure Official Company Domain & Identity Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Portal Layout Splitter */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar Nav (Desktop only) */}
        <aside className={`w-64 bg-slate-900 text-slate-300 shrink-0 hidden md:flex flex-col justify-between border-slate-800 no-print ${dir === 'rtl' ? 'border-l' : 'border-r'}`}>
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3">{t("portalNav")}</p>
              <nav className="space-y-0.5">
                {filteredTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                        isActive 
                          ? "bg-teal-600 text-white shadow-xs" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sourcing indicators & Advisor status in bottom of sidebar */}
          <div className="p-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-950/60 border border-teal-700/40 text-[11px] text-teal-300">
              <Shield size={14} className="text-teal-400 shrink-0" />
              <span className="font-semibold">Galina Advisor AI Verified</span>
            </div>

            <div className="p-2.5 bg-slate-800/50 rounded-lg text-[10px] text-slate-400 border border-slate-800/80">
              <p className="font-bold uppercase tracking-wider text-[9px] text-teal-400">{t("systemDesigner")}</p>
              <p className="mt-1 text-slate-200 font-semibold">{t("systemDesignerName")}</p>
              <p className="text-slate-500 mt-0.5">{t("sourcingNode")}</p>
            </div>
            <p className="text-[10px] text-center text-slate-600 font-medium">{t("copyright")}</p>
          </div>
        </aside>

        {/* Main interactive Tab Content */}
        <main className="flex-1 p-6 overflow-y-auto no-print">
          
          {/* Mobile Tab Quick Nav Dropdown */}
          <div className="mb-4 md:hidden no-print">
            <label className="block text-xs font-bold text-slate-500 mb-1">{t("navPortal")}</label>
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-semibold"
            >
              {filteredTabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>

          {/* Tabs routers */}
          {activeTab === "dashboard" && (
            <Dashboard 
              products={products} 
              countries={countries} 
              buyers={buyers} 
              setActiveTab={setActiveTab}
              setSelectedCountry={() => {}}
            />
          )}

          {activeTab === "products" && (
            <Products products={products} onAddProduct={handleAddProduct} />
          )}

          {activeTab === "countries" && (
            <Countries countries={countries} />
          )}

          {activeTab === "finder" && (
            <MarketFinder 
              products={products} 
              countries={countries} 
              onAddProspect={handleAddProspect} 
            />
          )}

          {activeTab === "lead_db" && (
            <LeadIntelligenceDatabase onSelectLeadForCRM={handleAddLeadToCRM} />
          )}

          {activeTab === "crm" && (
            <CRMPipeline 
              buyers={buyers} 
              onUpdateBuyerStatus={handleUpdateBuyerStatus}
              onUpdateBuyerNotes={handleUpdateBuyerNotes}
              onDeleteBuyer={handleDeleteBuyer}
              onSelectBuyerForEmail={handleSelectBuyerForEmail}
            />
          )}

          {activeTab === "suppliers" && (
            <Suppliers suppliers={suppliers} onAddSupplier={handleAddSupplier} />
          )}

          {activeTab === "competitors" && (
            <CompetitorsExhibitions 
              competitors={INITIAL_COMPETITORS} 
              exhibitions={INITIAL_EXHIBITIONS} 
            />
          )}

          {activeTab === "advisor" && (
            <AIAssistant onAddProspect={handleAddProspect} />
          )}

          {activeTab === "pitch" && (
            <EmailTranslator 
              products={products} 
              selectedBuyer={selectedBuyerForEmail}
              onLogEmail={handleLogEmail}
            />
          )}

          {activeTab === "reports" && (
            <Reports 
              products={products} 
              countries={countries} 
              buyers={buyers} 
              suppliers={suppliers} 
            />
          )}

        </main>
      </div>

      {/* 3. Official Application Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 no-print shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-200">Export Market Intelligence & Lead Generator</span>
          <span aria-hidden="true" className="text-slate-600">|</span>
          <span className="text-slate-400">Official Company Domain:</span>
          <a 
            href={`https://${appSettings.official_company_domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:text-teal-300 font-mono font-semibold underline flex items-center gap-1"
          >
            <span>{appSettings.official_company_domain}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="text-[11px] text-slate-500">
          Independent Evidence-Based Lead Verification · Exporter Identity: {appSettings.official_company_domain}
        </div>
      </footer>

      {/* 4. Admin Settings Modal (Section 9 of Prompt) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-slate-100">Application Identity & Domain Settings</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official Company Domain:
                </label>
                <input
                  type="text"
                  value={settingsDomain}
                  onChange={(e) => setSettingsDomain(e.target.value)}
                  placeholder="galina-eg.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-teal-300 text-xs focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Canonical identity domain. Default: <strong className="text-slate-300">galina-eg.com</strong>
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official Company Name:
                </label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  placeholder="Galina Agro-Export Group"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Official Company Website URL:
                </label>
                <input
                  type="url"
                  value={settingsWebsite}
                  onChange={(e) => setSettingsWebsite(e.target.value)}
                  placeholder="https://galina-eg.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Security / Trust Rule Banner (Section 10 of Prompt) */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Security & Integrity Protocol</span>
                </div>
                <p className="leading-relaxed">
                  The official company domain (<strong className="text-slate-200">{settingsDomain}</strong>) represents the application and exporter owner. It is <strong className="text-slate-200">strictly prohibited</strong> from being used to fabricate lead verification, invent lead emails, or replace a prospective buyer&apos;s actual corporate domain.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Area - renders only when user prints (print layout) */}
      <div className="hidden print:block print-only">
        <Reports 
          products={products} 
          countries={countries} 
          buyers={buyers} 
          suppliers={suppliers} 
        />
      </div>

    </div>
  );
}
