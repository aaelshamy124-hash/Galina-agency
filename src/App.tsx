import React, { useState, useEffect } from "react";
import { 
  Globe, Layers, Users, Award, ShieldAlert, Bot, Mail, FileText, 
  Settings, LogOut, MessageCircle, RefreshCw, Sparkles, Shield, Anchor
} from "lucide-react";

import { Product, Country, ProspectBuyer, Supplier, EmailLog } from "./types";
import { 
  INITIAL_PRODUCTS, INITIAL_COUNTRIES, INITIAL_BUYERS, 
  INITIAL_SUPPLIERS, INITIAL_EXHIBITIONS, INITIAL_COMPETITORS 
} from "./data";

import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Countries from "./components/Countries";
import MarketFinder from "./components/MarketFinder";
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

        {/* Right header controls: Advisor Engine Badge & User Role simulation */}
        <div className="flex items-center gap-2.5">
          
          {/* Active Advisor Engine Badge */}
          <div className="flex items-center gap-1.5 bg-teal-950/80 border border-teal-700/60 px-2.5 py-1 rounded-lg text-xs shadow-inner">
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
