import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, Search, Filter, Download, RefreshCw, 
  ExternalLink, Mail, Phone, Globe, Building2, MapPin, 
  CheckCircle, AlertTriangle, Eye, GitMerge, FileSpreadsheet,
  Layers, Clock, ShieldAlert, Award, ChevronRight, X, ArrowUpDown
} from "lucide-react";
import { LeadRecord, DuplicateLogRecord, SearchSessionRecord, LeadQualityGrade } from "../types";
import { leadDatabase, calculateDataFreshness } from "../services/leadDatabase";
import { searchLeadsAdvanced } from "../services/customerSearch";

interface LeadIntelligenceDatabaseProps {
  onSelectLeadForCRM?: (lead: LeadRecord) => void;
}

export default function LeadIntelligenceDatabase({ onSelectLeadForCRM }: LeadIntelligenceDatabaseProps) {
  const [activeSubTab, setActiveSubTab] = useState<"leads" | "duplicates" | "sessions">("leads");
  
  // Data state from persistent database
  const [leads, setLeads] = useState<LeadRecord[]>(() => leadDatabase.getAllLeads());
  const [duplicateLogs, setDuplicateLogs] = useState<DuplicateLogRecord[]>(() => leadDatabase.getDuplicateLogs());
  const [searchSessions, setSearchSessions] = useState<SearchSessionRecord[]>(() => leadDatabase.getSearchSessions());
  
  // Refresh data from storage
  const reloadData = () => {
    setLeads(leadDatabase.getAllLeads());
    setDuplicateLogs(leadDatabase.getDuplicateLogs());
    setSearchSessions(leadDatabase.getSearchSessions());
  };

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedQualityGrade, setSelectedQualityGrade] = useState("All");
  const [selectedEmailStatus, setSelectedEmailStatus] = useState("All");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("All");
  const [selectedBusinessType, setSelectedBusinessType] = useState("All");
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal Detail State
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [mergeTargetLeadId, setMergeTargetLeadId] = useState<string>("");
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Compute Overall KPI Metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const verifiedLeads = leads.filter(l => l.verification_status === "VERIFIED" || l.lead_quality_score >= 80).length;
    const potentialLeads = totalLeads - verifiedLeads;
    const duplicatesDetected = duplicateLogs.length;
    const rejectedLeads = searchSessions.reduce((sum, s) => sum + (s.rejected_leads || 0), 0);
    const uniqueCountries = new Set(leads.map(l => l.country)).size;
    const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.lead_quality_score || 0), 0) / totalLeads) : 0;
    const avgDupRisk = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.duplicate_risk_score || 0), 0) / totalLeads) : 0;
    const emailsVerified = leads.filter(l => l.email_verification_status === "VERIFIED").length;
    const emailsUnverified = leads.filter(l => l.email_verification_status !== "VERIFIED" && l.email).length;

    return {
      totalLeads,
      verifiedLeads,
      potentialLeads,
      duplicatesDetected,
      rejectedLeads,
      uniqueCountries,
      avgScore,
      avgDupRisk,
      emailsVerified,
      emailsUnverified
    };
  }, [leads, duplicateLogs, searchSessions]);

  // Unique Filter Options
  const countriesList = useMemo(() => Array.from(new Set(leads.map(l => l.country).filter(Boolean))).sort(), [leads]);
  const businessTypesList = useMemo(() => Array.from(new Set(leads.map(l => l.business_type).filter(Boolean))).sort(), [leads]);

  // Filtered Leads with High-Accuracy Bilingual Search and Anti-Duplication
  const filteredLeads = useMemo(() => {
    const searchResults = searchLeadsAdvanced(leads, searchTerm, {
      filterCountry: selectedCountry,
      filterQualityGrade: selectedQualityGrade,
      filterEmailStatus: selectedEmailStatus,
      filterVerificationStatus: selectedVerificationStatus,
      filterBusinessType: selectedBusinessType
    });

    return searchResults.sort((a, b) => {
      let valA: any = a.lead_quality_score;
      let valB: any = b.lead_quality_score;
      if (sortBy === "name") {
        valA = a.company_name.toLowerCase();
        valB = b.company_name.toLowerCase();
      } else if (sortBy === "date") {
        valA = new Date(a.verification_date || a.last_checked_at).getTime();
        valB = new Date(b.verification_date || b.last_checked_at).getTime();
      }

      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }, [leads, searchTerm, selectedCountry, selectedQualityGrade, selectedEmailStatus, selectedVerificationStatus, selectedBusinessType, sortBy, sortOrder]);

  // Actions
  const handleReverify = (leadId: string) => {
    const updated = leadDatabase.reverifyLead(leadId);
    if (updated) {
      reloadData();
      setSelectedLead(updated);
      showNotification(`Re-verified ${updated.company_name} successfully. Timestamp refreshed.`);
    }
  };

  const handleMerge = () => {
    if (!selectedLead || !mergeTargetLeadId) return;
    if (selectedLead.lead_id === mergeTargetLeadId) {
      alert("Cannot merge a lead into itself. Select a different lead.");
      return;
    }
    const merged = leadDatabase.mergeLeads(selectedLead.lead_id, mergeTargetLeadId);
    if (merged) {
      reloadData();
      setSelectedLead(merged);
      setIsMergeModalOpen(false);
      setMergeTargetLeadId("");
      showNotification(`Successfully merged leads into ${merged.lead_id} (${merged.company_name}).`);
    } else {
      alert("Failed to find secondary lead. Verify the ID.");
    }
  };

  // CSV Export for Leads
  const exportLeadsCSV = () => {
    const today = new Date().toISOString().split("T")[0];
    const settings = leadDatabase.getSettings();

    const reportHeaders = [
      `"Export Market Intelligence & Lead Generator"`,
      `"Official Domain: ${settings.official_company_domain}"`,
      `"Report Generated: ${today}"`,
      `""`
    ];

    const headers = [
      "Lead ID", "Company", "Country", "City", "Business Type", "Industry",
      "Product Categories", "Website", "Lead Source Domain", "Lead Source URL", "Email", "Email Status", "Phone",
      "Contact Person", "Job Title", "LinkedIn", "Lead Score", "Quality Grade",
      "Duplicate Risk", "Verification Status", "Verification Date",
      "Independent Source Evidence", "Source URLs", "Application Owner Domain", "First Discovered", "Last Checked"
    ];

    const rows = filteredLeads.map(l => [
      `"${l.lead_id}"`,
      `"${(l.company_name || '').replace(/"/g, '""')}"`,
      `"${l.country || ''}"`,
      `"${l.city || ''}"`,
      `"${l.business_type || ''}"`,
      `"${l.industry || ''}"`,
      `"${(l.product_categories || [l.product_category]).join(', ').replace(/"/g, '""')}"`,
      `"${l.official_website || ''}"`,
      `"${l.normalized_domain || ''}"`,
      `"${l.lead_source_url || (l.source_urls && l.source_urls[0]) || l.official_website || ''}"`,
      `"${l.email || ''}"`,
      `"${l.email_verification_status || ''}"`,
      `"${l.phone || ''}"`,
      `"${(l.contact_person || '').replace(/"/g, '""')}"`,
      `"${(l.contact_job_title || '').replace(/"/g, '""')}"`,
      `"${l.linkedin_company_url || ''}"`,
      l.lead_quality_score,
      `"${l.lead_quality_grade}"`,
      l.duplicate_risk_score,
      `"${l.verification_status}"`,
      `"${l.verification_date}"`,
      `"${(l.source_evidence || '').replace(/"/g, '""')}"`,
      `"${(l.source_urls || []).join('; ').replace(/"/g, '""')}"`,
      `"${l.application_domain || settings.official_company_domain}"`,
      `"${l.first_discovered_at}"`,
      `"${l.last_checked_at}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [...reportHeaders, headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Galina_Verified_Leads_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filteredLeads.length} verified leads with official header.`);
  };

  // CSV Export for Duplicate Detection Log
  const exportDuplicatesCSV = () => {
    const today = new Date().toISOString().split("T")[0];
    const settings = leadDatabase.getSettings();

    const reportHeaders = [
      `"Export Market Intelligence & Lead Generator - Duplicate Audit Log"`,
      `"Official Domain: ${settings.official_company_domain}"`,
      `"Report Generated: ${today}"`,
      `""`
    ];

    const headers = [
      "Log ID", "New Candidate Name", "Existing Lead Name", "New Domain",
      "Existing Domain", "Duplicate Score", "Duplicate Reason", "Existing Lead ID",
      "Detected Date", "Search Session ID", "Status", "Application Domain"
    ];

    const rows = duplicateLogs.map(d => [
      `"${d.duplicate_log_id}"`,
      `"${(d.new_company_name || '').replace(/"/g, '""')}"`,
      `"${(d.existing_company_name || '').replace(/"/g, '""')}"`,
      `"${d.new_domain || ''}"`,
      `"${d.existing_domain || ''}"`,
      d.duplicate_score,
      `"${(d.duplicate_reason || '').replace(/"/g, '""')}"`,
      `"${d.existing_lead_id || ''}"`,
      `"${d.detected_date}"`,
      `"${d.search_session_id || ''}"`,
      `"${d.status}"`,
      `"${settings.official_company_domain}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [...reportHeaders, headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Galina_Duplicate_Audit_Log_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${duplicateLogs.length} duplicate detection records.`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-teal-500/50 text-teal-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Lead Intelligence Database
            </h1>
            <span className="text-xs text-teal-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              v2.4 Enterprise Verified
            </span>
          </div>
          
          {/* Official Company Source Badge (Section 1 of Prompt) */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 mb-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>✓ VERIFIED – OFFICIAL COMPANY SOURCE</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Official Domain:</span>
            <a 
              href={`https://${leadDatabase.getSettings().official_company_domain}`}
              target="_blank" 
              rel="noreferrer"
              className="text-teal-400 hover:text-white underline font-semibold font-mono flex items-center gap-1"
            >
              <span>{leadDatabase.getSettings().official_company_domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-slate-400">
            Persistent entity registry, multi-signal duplicate prevention, and international buyer audit trail. Each lead is corroborated via independent corporate sources.
          </p>
        </div>

        {/* Tab Controls (Zero-pill segmented style) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveSubTab("leads")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "leads" 
                  ? "bg-teal-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Qualified Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveSubTab("duplicates")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "duplicates" 
                  ? "bg-teal-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Duplicate Audit Log ({duplicateLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab("sessions")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === "sessions" 
                  ? "bg-teal-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Search Sessions ({searchSessions.length})
            </button>
          </div>

          <button
            onClick={activeSubTab === "duplicates" ? exportDuplicatesCSV : exportLeadsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS BAR (Unboxed, clean typographic hierarchy) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Total Leads</div>
          <div className="text-xl font-bold text-slate-100 font-mono">{metrics.totalLeads}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-emerald-400 mb-1">Verified Leads</div>
          <div className="text-xl font-bold text-emerald-300 font-mono">{metrics.verifiedLeads}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-amber-400 mb-1">Potential Leads</div>
          <div className="text-xl font-bold text-amber-300 font-mono">{metrics.potentialLeads}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-rose-400 mb-1">Duplicates Detected</div>
          <div className="text-xl font-bold text-rose-300 font-mono">{metrics.duplicatesDetected}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Rejected Leads</div>
          <div className="text-xl font-bold text-slate-300 font-mono">{metrics.rejectedLeads}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-cyan-400 mb-1">Countries</div>
          <div className="text-xl font-bold text-cyan-300 font-mono">{metrics.uniqueCountries}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-teal-400 mb-1">Avg Lead Score</div>
          <div className="text-xl font-bold text-teal-300 font-mono">{metrics.avgScore}/100</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-indigo-400 mb-1">Avg Dup Risk</div>
          <div className="text-xl font-bold text-indigo-300 font-mono">{metrics.avgDupRisk}%</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-emerald-400 mb-1">Emails Verified</div>
          <div className="text-xl font-bold text-emerald-300 font-mono">{metrics.emailsVerified}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Emails Unverified</div>
          <div className="text-xl font-bold text-slate-300 font-mono">{metrics.emailsUnverified}</div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: QUALIFIED LEADS TABLE & FILTERS */}
      {/* ==================================================================== */}
      {activeSubTab === "leads" && (
        <div className="space-y-4">
          {/* Search Bar & Multi-filter Controls */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Text Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by company, country, domain, email, contact person, or LEAD-ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-500"
                >
                  <option value="score">Lead Score</option>
                  <option value="name">Company Name</option>
                  <option value="date">Verification Date</option>
                </select>

                <button
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                  title="Toggle sort direction"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Countries ({countriesList.length})</option>
                  {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Quality Grade</label>
                <select
                  value={selectedQualityGrade}
                  onChange={(e) => setSelectedQualityGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Grades</option>
                  <option value="EXCELLENT">EXCELLENT (90-100)</option>
                  <option value="VERY GOOD">VERY GOOD (80-89)</option>
                  <option value="GOOD">GOOD (70-79)</option>
                  <option value="MEDIUM">MEDIUM (60-69)</option>
                  <option value="LOW">LOW (&lt;60)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Email Status</label>
                <select
                  value={selectedEmailStatus}
                  onChange={(e) => setSelectedEmailStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Email Statuses</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="LIKELY_VALID">LIKELY_VALID</option>
                  <option value="UNVERIFIED">UNVERIFIED</option>
                  <option value="NOT_FOUND">NOT_FOUND</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Verification</label>
                <select
                  value={selectedVerificationStatus}
                  onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PARTIALLY_VERIFIED">PARTIALLY_VERIFIED</option>
                  <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Business Type</label>
                <select
                  value={selectedBusinessType}
                  onChange={(e) => setSelectedBusinessType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="All">All Types</option>
                  {businessTypesList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table of Leads */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Lead ID</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Country & City</th>
                    <th className="py-3.5 px-4">Website</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Email Status</th>
                    <th className="py-3.5 px-4">Key Contact</th>
                    <th className="py-3.5 px-4 text-center">Score</th>
                    <th className="py-3.5 px-4 text-center">Dup Risk</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Last Verified</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        No leads match your search criteria. Try adjusting filters or performing a new search in Market Finder.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const emailColor = 
                        lead.email_verification_status === "VERIFIED" ? "text-emerald-400" :
                        lead.email_verification_status === "LIKELY_VALID" ? "text-cyan-400" :
                        lead.email_verification_status === "UNVERIFIED" ? "text-amber-400" :
                        "text-slate-500";

                      const scoreColor = 
                        lead.lead_quality_score >= 80 ? "text-emerald-300 font-bold" :
                        lead.lead_quality_score >= 60 ? "text-amber-300 font-bold" :
                        "text-rose-300 font-bold";

                      const dupRiskColor = 
                        lead.duplicate_risk_score >= 70 ? "text-rose-400 font-semibold" :
                        lead.duplicate_risk_score >= 40 ? "text-amber-400" :
                        "text-slate-400";

                      return (
                        <tr 
                          key={lead.lead_id} 
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td className="py-3 px-4 font-mono text-teal-400 font-medium whitespace-nowrap">
                            {lead.lead_id}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                              {lead.company_name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {lead.business_type}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                            <div>{lead.country}</div>
                            <div className="text-[11px] text-slate-500">{lead.city || "—"}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                            {lead.normalized_domain ? (
                              <a 
                                href={`https://${lead.normalized_domain}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-teal-400 hover:underline flex items-center gap-1"
                              >
                                <span>{lead.normalized_domain}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : "—"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                            {lead.email ? (
                              <span title={lead.email}>{lead.email}</span>
                            ) : (
                              <span className="text-slate-500 italic">Not found</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[11px] font-medium ${emailColor}`}>
                              {lead.email_verification_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="text-slate-200">{lead.contact_person || "Procurement Desk"}</div>
                            <div className="text-[10px] text-slate-500">{lead.contact_job_title || "Purchasing"}</div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                            <span className={scoreColor}>{lead.lead_quality_score}</span>
                            <span className="text-[10px] text-slate-500 block">{lead.lead_quality_grade}</span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-[11px]">
                            <span className={dupRiskColor}>{lead.duplicate_risk_score}%</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                            <span className={lead.verification_status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}>
                              {lead.verification_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                            {lead.verification_date || "—"}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-teal-400" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Count */}
            <div className="px-4 py-3 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div>
                Showing <span className="font-semibold text-slate-200">{filteredLeads.length}</span> of{" "}
                <span className="font-semibold text-slate-200">{leads.length}</span> recorded unique leads
              </div>
              <div className="text-[11px] text-slate-500">
                Persistent local schema synchronized · Zero duplicates permitted
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: DUPLICATE DETECTION AUDIT LOG */}
      {/* ==================================================================== */}
      {activeSubTab === "duplicates" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 mb-0.5">Duplicate Detection Audit Trail</h2>
              <p className="text-xs text-slate-400">
                Full historical log of cross-search candidate matches excluded or merged to guarantee lead uniqueness.
              </p>
            </div>
            <button
              onClick={exportDuplicatesCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export Audit Log</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Detected Candidate</th>
                    <th className="py-3 px-4">Existing Entity in DB</th>
                    <th className="py-3 px-4">Matched Domains</th>
                    <th className="py-3 px-4 text-center">Risk Score</th>
                    <th className="py-3 px-4">Detection Reason</th>
                    <th className="py-3 px-4">Detected Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {duplicateLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No duplicates recorded yet. All newly performed searches will log detected company collisions here.
                      </td>
                    </tr>
                  ) : (
                    duplicateLogs.map((log) => (
                      <tr key={log.duplicate_log_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {log.duplicate_log_id}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-100">
                          {log.new_company_name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-teal-400">{log.existing_company_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            ID: {log.existing_lead_id}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          <div>New: {log.new_domain || "—"}</div>
                          <div className="text-slate-500">DB: {log.existing_domain || "—"}</div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold text-rose-400">
                          {log.duplicate_score}/100
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate" title={log.duplicate_reason}>
                          {log.duplicate_reason}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                          {log.detected_date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-rose-400 font-medium text-[11px]">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: SEARCH SESSIONS AUDIT */}
      {/* ==================================================================== */}
      {activeSubTab === "sessions" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <h2 className="text-base font-bold text-slate-100 mb-0.5">Search Session Audit Trail</h2>
            <p className="text-xs text-slate-400">
              Historical record of every prospecting query executed, tracking duplicate collision rates and rejected lead counts.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Session ID</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Results Found</th>
                    <th className="py-3 px-4 text-center">New Leads</th>
                    <th className="py-3 px-4 text-center">Duplicates Merged</th>
                    <th className="py-3 px-4 text-center">Rejected</th>
                    <th className="py-3 px-4">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {searchSessions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No previous search sessions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    searchSessions.map((session) => (
                      <tr key={session.search_session_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-teal-400 text-[11px] whitespace-nowrap">
                          {session.search_session_id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                          {session.product}
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          {session.country}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {session.search_date}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-200">
                          {session.results_found}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-emerald-400 font-semibold">
                          +{session.new_unique_leads}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-amber-400 font-semibold">
                          {session.duplicates_detected}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-rose-400">
                          {session.rejected_leads}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {session.verification_summary}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* LEAD DETAILS MODAL / DRAWER (50+ Database Fields) */}
      {/* ==================================================================== */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-100">{selectedLead.company_name}</h2>
                  <span className="font-mono text-xs text-teal-400 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedLead.lead_id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{selectedLead.business_type}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedLead.city}, {selectedLead.country}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">{selectedLead.verification_status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReverify(selectedLead.lead_id)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Re-check website, email syntax, domain, and data freshness"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Re-Verify Lead</span>
                </button>

                <button
                  onClick={() => setIsMergeModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Merge another lead record into this one"
                >
                  <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Safe Merge</span>
                </button>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Lead Quality Score</span>
                <span className="text-base font-bold text-teal-400 font-mono">
                  {selectedLead.lead_quality_score}/100 ({selectedLead.lead_quality_grade})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Duplicate Risk</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {selectedLead.duplicate_risk_score}% ({selectedLead.duplicate_status})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Email Verification</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {selectedLead.email_verification_status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Data Freshness</span>
                <span className="text-base font-bold text-cyan-400 font-mono">
                  {selectedLead.data_freshness} (Verified: {selectedLead.verification_date})
                </span>
              </div>
            </div>

            {/* Section 1: Company Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>1. Company Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Company Legal Name:</span>
                  <span className="font-semibold text-slate-200">{selectedLead.company_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Normalized Entity:</span>
                  <span className="font-mono text-slate-400">{selectedLead.normalized_company_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Country & ISO Code:</span>
                  <span className="text-slate-200">{selectedLead.country} ({selectedLead.country_code})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">City & Address:</span>
                  <span className="text-slate-200">{selectedLead.address || selectedLead.city}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Official Website:</span>
                  {selectedLead.official_website ? (
                    <a href={selectedLead.official_website} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline flex items-center gap-1">
                      <span>{selectedLead.normalized_domain || selectedLead.official_website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-500">—</span>}
                </div>
                <div>
                  <span className="text-slate-500 block">LinkedIn Profile:</span>
                  {selectedLead.linkedin_company_url ? (
                    <a href={selectedLead.linkedin_company_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                      <span>Corporate LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-slate-500">—</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Buyer & Commercial Profile */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>2. Buyer & Commercial Profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Buyer Type:</span>
                  <span className="font-semibold text-slate-200">{selectedLead.buyer_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Importer Status:</span>
                  <span className="text-emerald-400 font-semibold">{selectedLead.importer_status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Relevant Products / Crops:</span>
                  <span className="text-slate-200">
                    {(selectedLead.product_categories || [selectedLead.product_category]).join(", ")}
                  </span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-slate-500 block mb-1">Reason for Buyer Relevance:</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {selectedLead.reason_for_buyer_relevance}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Verified Contacts & Multiple Mailboxes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>3. Contact & Mailbox Verification</span>
              </h3>
              <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Primary Contact:</span>
                    <span className="font-semibold text-slate-200">{selectedLead.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Job Title / Role:</span>
                    <span className="text-slate-300">{selectedLead.contact_job_title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Phone Number:</span>
                    <span className="font-mono text-slate-300">{selectedLead.phone || "—"}</span>
                  </div>
                </div>

                {/* Multiple Contacts List */}
                {selectedLead.contacts && selectedLead.contacts.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                      Registered Corporate Contacts / Mailboxes:
                    </span>
                    <div className="space-y-1.5">
                      {selectedLead.contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                          <div>
                            <span className="font-medium text-slate-200">{contact.contact_person}</span>
                            {contact.job_title && <span className="text-slate-400 ml-1.5">({contact.job_title})</span>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-teal-400">{contact.email}</span>
                            <span className={`text-[10px] ${contact.verification_status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}`}>
                              {contact.verification_status || "UNVERIFIED"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Lead Verification & Independent Source Evidence */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>4. Independent Lead Verification & Source Evidence</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Verified: {selectedLead.verification_date}
                </span>
              </h3>
              
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Verification Status:</span>
                    <span className="font-semibold text-emerald-400">{selectedLead.verification_status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Lead Source Domain:</span>
                    <span className="font-mono text-cyan-300 font-semibold">{selectedLead.normalized_domain || "Direct Registry"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Lead Source URL:</span>
                    {selectedLead.official_website ? (
                      <a href={selectedLead.official_website} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                        <span className="truncate max-w-[200px]">{selectedLead.official_website}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : <span className="text-slate-500">—</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Independent Source Evidence:</span>
                  <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    {selectedLead.source_evidence}
                  </p>
                </div>

                {selectedLead.source_urls && selectedLead.source_urls.length > 0 && (
                  <div>
                    <span className="text-slate-500 block mb-1">Corroborated Source URLs:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.source_urls.map((url, uidx) => (
                        <a 
                          key={uidx}
                          href={url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-teal-400 hover:underline rounded text-[11px] flex items-center gap-1"
                        >
                          <span className="max-w-xs truncate">{url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>First Discovered: <span className="text-slate-200">{selectedLead.first_discovered_at?.split("T")[0]}</span></div>
                  <div>Last Checked: <span className="text-slate-200">{selectedLead.last_checked_at?.split("T")[0]}</span></div>
                  <div>Session ID: <span className="text-slate-200 font-mono">{selectedLead.search_session_id || "Direct"}</span></div>
                  <div>Data Conflict: <span className={selectedLead.data_conflict ? "text-rose-400 font-bold" : "text-emerald-400"}>{selectedLead.data_conflict ? "Yes (Flagged)" : "No"}</span></div>
                </div>
              </div>
            </div>

            {/* Section 5: Application Owner / Exporter Identity (Section 2 & 10 of Prompt) */}
            <div className="space-y-2 bg-gradient-to-r from-teal-950/40 via-slate-950/60 to-slate-900/40 p-4 rounded-xl border border-teal-900/40 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Application Owner & Exporter Identity</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[10px]">
                  <span>✓ VERIFIED – OFFICIAL COMPANY SOURCE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Company Domain:</span>
                  <a 
                    href={`https://${leadDatabase.getSettings().official_company_domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-teal-300 hover:text-white underline flex items-center gap-1"
                  >
                    <span>{leadDatabase.getSettings().official_company_domain}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Exporter Name:</span>
                  <span className="font-medium text-slate-200">{leadDatabase.getSettings().official_company_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Website:</span>
                  <a 
                    href={leadDatabase.getSettings().official_company_website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>{leadDatabase.getSettings().official_company_website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                Note: The application owner domain (<strong className="text-slate-300">{leadDatabase.getSettings().official_company_domain}</strong>) identifies the exporter/system operator and is never confused with or used as the verification source for prospective buyer leads.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-500">
                Persistent Lead Key: <span className="font-mono text-slate-400">{selectedLead.normalized_domain} + {selectedLead.country_code}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Close Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SAFE MERGE MODAL */}
      {/* ==================================================================== */}
      {isMergeModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-indigo-400" />
              <span>Safe Merge Leads</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merge secondary company record into primary record <strong className="text-teal-400">{selectedLead.company_name} ({selectedLead.lead_id})</strong>. 
              All product categories, source evidence, and verified mailboxes will be preserved under this lead.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Select Secondary Lead to Merge & Remove:
              </label>
              <select
                value={mergeTargetLeadId}
                onChange={(e) => setMergeTargetLeadId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Choose Lead Record to Merge --</option>
                {leads.filter(l => l.lead_id !== selectedLead.lead_id).map(l => (
                  <option key={l.lead_id} value={l.lead_id}>
                    {l.lead_id} - {l.company_name} ({l.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={!mergeTargetLeadId}
                onClick={handleMerge}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
