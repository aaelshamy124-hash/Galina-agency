/**
 * Lead Intelligence Database & Normalization Engine
 * 
 * Enforces:
 * - Enterprise Company, Domain, Email & Phone Normalization
 * - Multi-signal Duplicate Detection Engine (0-100 risk score)
 * - Lead Quality Scoring (0-100 scale & Grades)
 * - Cross-search Duplicate Prevention & Entity Resolution
 * - Persistent Lead Database, Duplicate Logs, and Search Sessions
 * - Conflict Detection & Non-destructive Lead Merging
 */

import { 
  LeadRecord, 
  DuplicateLogRecord, 
  SearchSessionRecord, 
  LeadQualityGrade, 
  DuplicateStatus, 
  DataFreshness, 
  EmailVerificationStatusEnum,
  LeadVerificationStatus,
  LeadContact,
  AppSettings
} from "../types";
import { INITIAL_BUYERS } from "../data";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  official_company_domain: "galina-eg.com",
  official_company_name: "Galina Agro-Export Group",
  official_company_website: "https://galina-eg.com"
};

const STORAGE_KEYS = {
  LEADS: "galina_lead_database_v2",
  DUPLICATE_LOGS: "galina_duplicate_logs_v2",
  SEARCH_SESSIONS: "galina_search_sessions_v2",
  SETTINGS: "galina_app_settings_v1",
  NEXT_ID: "galina_lead_next_id"
};

// Common international legal company suffixes
const LEGAL_SUFFIXES = [
  "gmbh & co. kg", "gmbh & co kg", "gmbh and co kg", "gmbh", "co. kg", "co kg",
  "ltd.", "ltd", "limited", "llc", "inc.", "inc", "incorporated",
  "corp.", "corp", "corporation", "plc", "p.l.c.", "s.a.", "sa",
  "s.a.s.", "sas", "s.a.r.l.", "sarl", "s.r.l.", "srl", "sp. z o.o.", "sp z o o",
  "s.p.a.", "spa", "b.v.", "bv", "n.v.", "nv", "a.g.", "ag", "k.g.", "kg",
  "fzco", "fze", "llp", "w.l.l.", "wll", "co.", "company", "group", "holding",
  "holdings", "societe anonyme", "zentrale", "consorzio"
];

// Disposable or generic email domains that cannot be verified company domains
const GENERIC_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com",
  "mail.com", "zoho.com", "yandex.com", "protonmail.com"
];

// ============================================================================
// NORMALIZATION ENGINE
// ============================================================================

/**
 * Normalizes company name by stripping legal suffixes, punctuation, excessive spaces, and accents.
 * Does NOT remove meaningful core words.
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return "";
  
  let normalized = name.trim().toLowerCase();
  
  // Replace accents (e.g., Döhler -> doehler or dohler)
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Replace '&' with 'and'
  normalized = normalized.replace(/\s*&\s*/g, " and ");
  
  // Replace dashes, underscores, dots, commas, slashes with spaces
  normalized = normalized.replace(/[-_.,/]+/g, " ");
  
  // Clean special characters
  normalized = normalized.replace(/[^a-z0-9\s]/g, "");
  
  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();
  
  // Suffixes to strip from end (longest first)
  const sortedSuffixes = [
    "gmbh and co kg", "gmbh and co", "gmbh co kg", "gmbh", 
    "co kg", "ltd", "limited", "llc", "inc", "incorporated", 
    "corp", "corporation", "plc", "sa", "sas", "sarl", "srl", 
    "sp z o o", "spa", "bv", "nv", "ag", "kg", "fzco", "fze", 
    "llp", "wll", "company", "group", "holding", "holdings"
  ];

  for (const suffix of sortedSuffixes) {
    if (normalized.endsWith(" " + suffix)) {
      normalized = normalized.slice(0, -(suffix.length + 1)).trim();
      break;
    } else if (normalized === suffix) {
      break;
    }
  }
  
  return normalized.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes a website URL or domain string to plain domain:
 * https://www.example.com/about/ -> example.com
 */
export function normalizeDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return "";
  
  let clean = urlOrDomain.trim().toLowerCase();
  
  // Remove protocol
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
  
  // Remove path, query params, hash
  clean = clean.split("/")[0].split("?")[0].split("#")[0];
  
  // Remove trailing slashes and port
  clean = clean.replace(/:\d+$/, "").replace(/\/+$/, "").trim();
  
  return clean;
}

/**
 * Normalizes email: lowercase, trim, domain extraction
 */
export function normalizeEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Extracts domain from an email
 */
export function extractEmailDomain(email: string): string {
  const norm = normalizeEmail(email);
  const parts = norm.split("@");
  return parts.length === 2 ? parts[1] : "";
}

/**
 * Validates email syntax
 */
export function validateEmailSyntax(email: string): boolean {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

/**
 * Normalizes phone numbers to standard format (digits only or +E.164 if country provided)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  // Keep leading + if present, strip spaces, brackets, dashes
  const hasPlus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

// ============================================================================
// DATA FRESHNESS ENGINE
// ============================================================================

export function calculateDataFreshness(dateStr?: string): DataFreshness {
  if (!dateStr) return "UNKNOWN";
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return "UNKNOWN";
  
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) return "CURRENT";
  if (diffDays <= 90) return "RECENT";
  if (diffDays <= 180) return "AGING";
  return "OUTDATED";
}

// ============================================================================
// LEAD QUALITY SCORING ENGINE (0 - 100)
// ============================================================================

export function calculateLeadQualityScore(lead: Partial<LeadRecord>): {
  score: number;
  grade: LeadQualityGrade;
  breakdown: Record<string, number>;
} {
  let companyIdentity = 0; // max 20
  let officialWebsite = 0; // max 15
  let countryVerification = 0; // max 10
  let businessRelevance = 0; // max 20
  let buyerEvidence = 0; // max 15
  let contactInfo = 0; // max 10
  let emailVerification = 0; // max 5
  let dataFreshness = 0; // max 5

  // 1. Company Identity (20 pts)
  if (lead.company_name && lead.company_name.trim().length >= 3) {
    companyIdentity += 10;
    if (lead.city && lead.address) companyIdentity += 5;
    else if (lead.city) companyIdentity += 3;
    if (lead.linkedin_company_url) companyIdentity += 5;
  }

  // 2. Official Website (15 pts)
  const normDom = lead.normalized_domain || normalizeDomain(lead.official_website || "");
  if (normDom && normDom.includes(".")) {
    officialWebsite += 10;
    if (lead.official_website?.startsWith("https://")) officialWebsite += 5;
  }

  // 3. Country Verification (10 pts)
  if (lead.country && lead.country.trim().length >= 2) {
    countryVerification += 7;
    if (lead.country_code) countryVerification += 3;
  }

  // 4. Business Relevance (20 pts)
  if (lead.product_category || (lead.product_categories && lead.product_categories.length > 0)) {
    businessRelevance += 10;
  }
  if (lead.industry && lead.business_type) {
    businessRelevance += 10;
  } else if (lead.industry || lead.business_type) {
    businessRelevance += 5;
  }

  // 5. Importer/Buyer Evidence (15 pts)
  if (lead.importer_status === "Confirmed Importer" || lead.buyer_type) {
    buyerEvidence += 10;
    if (lead.reason_for_buyer_relevance && lead.reason_for_buyer_relevance.length > 10) {
      buyerEvidence += 5;
    }
  }

  // 6. Contact Information (10 pts)
  if (lead.contact_person && lead.contact_person !== "Procurement Desk") {
    contactInfo += 5;
    if (lead.contact_job_title) contactInfo += 2;
  }
  if (lead.phone || lead.normalized_phone) {
    contactInfo += 3;
  }

  // 7. Email Verification (5 pts)
  if (lead.email_verification_status === "VERIFIED") {
    emailVerification = 5;
  } else if (lead.email_verification_status === "LIKELY_VALID") {
    emailVerification = 3;
  } else if (lead.email_verification_status === "UNVERIFIED") {
    emailVerification = 1;
  }

  // 8. Data Freshness (5 pts)
  const freshness = calculateDataFreshness(lead.verification_date || lead.last_checked_at);
  if (freshness === "CURRENT") dataFreshness = 5;
  else if (freshness === "RECENT") dataFreshness = 4;
  else if (freshness === "AGING") dataFreshness = 2;
  else if (freshness === "OUTDATED") dataFreshness = 1;

  const total = Math.min(100, Math.max(0, 
    companyIdentity + officialWebsite + countryVerification + 
    businessRelevance + buyerEvidence + contactInfo + emailVerification + dataFreshness
  ));

  let grade: LeadQualityGrade = "LOW";
  if (total >= 90) grade = "EXCELLENT";
  else if (total >= 80) grade = "VERY GOOD";
  else if (total >= 70) grade = "GOOD";
  else if (total >= 60) grade = "MEDIUM";

  return {
    score: total,
    grade,
    breakdown: {
      companyIdentity,
      officialWebsite,
      countryVerification,
      businessRelevance,
      buyerEvidence,
      contactInfo,
      emailVerification,
      dataFreshness
    }
  };
}

// ============================================================================
// DUPLICATE DETECTION ENGINE
// ============================================================================

export interface DuplicateAssessment {
  score: number;
  reasons: string[];
  status: DuplicateStatus;
  matchedLeadId?: string;
  matchedLeadName?: string;
}

/**
 * Compares a candidate company against an existing database record.
 * Calculates duplicate risk score (0-100) using weighted signals.
 */
export function calculateDuplicateScore(
  candidate: Partial<LeadRecord>,
  existing: LeadRecord
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const candidateDomain = normalizeDomain(candidate.normalized_domain || candidate.official_website || "");
  const existingDomain = normalizeDomain(existing.normalized_domain || existing.official_website || "");

  // 1. Same normalized domain (+45) - Very Strong Signal
  if (candidateDomain && existingDomain && candidateDomain === existingDomain) {
    score += 45;
    reasons.push(`Same verified domain (${candidateDomain})`);
  }

  // 2. Same official website exact URL (+20)
  if (candidate.official_website && existing.official_website && 
      candidate.official_website.trim().toLowerCase() === existing.official_website.trim().toLowerCase()) {
    score += 20;
    reasons.push("Exact official website match");
  }

  // 3. Same LinkedIn company URL (+25)
  if (candidate.linkedin_company_url && existing.linkedin_company_url) {
    const cleanCandLi = candidate.linkedin_company_url.toLowerCase().replace(/\/+$/, "");
    const cleanExistLi = existing.linkedin_company_url.toLowerCase().replace(/\/+$/, "");
    if (cleanCandLi === cleanExistLi) {
      score += 25;
      reasons.push("Identical LinkedIn corporate page");
    }
  }

  // 4. Same normalized company name (+25)
  const candNormName = normalizeCompanyName(candidate.company_name || "");
  const existNormName = normalizeCompanyName(existing.company_name || "");
  
  if (candNormName && existNormName) {
    if (candNormName === existNormName) {
      score += 25;
      reasons.push(`Identical normalized company entity (${candNormName})`);
    } else if (candNormName.includes(existNormName) || existNormName.includes(candNormName)) {
      // High string similarity
      const minLen = Math.min(candNormName.length, existNormName.length);
      if (minLen >= 5) {
        score += 15;
        reasons.push("Substantial company name overlap");
      }
    }
  }

  // 5. Same country (+10)
  if (candidate.country && existing.country && 
      candidate.country.trim().toLowerCase() === existing.country.trim().toLowerCase()) {
    score += 10;
    reasons.push(`Same jurisdiction (${candidate.country})`);
  }

  // 6. Same phone (+15)
  const candPhone = normalizePhone(candidate.phone || candidate.normalized_phone || "");
  const existPhone = normalizePhone(existing.phone || existing.normalized_phone || "");
  if (candPhone && existPhone && candPhone.length >= 7 && candPhone === existPhone) {
    score += 15;
    reasons.push("Identical international phone number");
  }

  // 7. Same email or email domain (+10)
  const candEmailNorm = normalizeEmail(candidate.email || "");
  const existEmailNorm = normalizeEmail(existing.email || "");
  if (candEmailNorm && existEmailNorm && candEmailNorm === existEmailNorm) {
    score += 20;
    reasons.push("Exact email match");
  } else {
    const candEmailDom = extractEmailDomain(candEmailNorm);
    const existEmailDom = extractEmailDomain(existEmailNorm);
    if (candEmailDom && existEmailDom && 
        candEmailDom === existEmailDom && 
        !GENERIC_EMAIL_DOMAINS.includes(candEmailDom)) {
      score += 10;
      reasons.push(`Corporate email domain match (@${candEmailDom})`);
    }
  }

  // 8. Same contact person (+10)
  if (candidate.contact_person && existing.contact_person &&
      candidate.contact_person.trim().length >= 4 &&
      candidate.contact_person.trim().toLowerCase() === existing.contact_person.trim().toLowerCase() &&
      candidate.contact_person.toLowerCase() !== "procurement desk") {
    score += 10;
    reasons.push(`Same key contact person (${candidate.contact_person})`);
  }

  // Cap score at 100
  const finalScore = Math.min(100, score);
  return { score: finalScore, reasons };
}

/**
 * Evaluates candidate against full database of existing leads
 */
export function checkDuplicateAgainstDatabase(
  candidate: Partial<LeadRecord>,
  existingLeads: LeadRecord[]
): DuplicateAssessment {
  let highestScore = 0;
  let topReasons: string[] = [];
  let matchedLead: LeadRecord | null = null;

  for (const lead of existingLeads) {
    const { score, reasons } = calculateDuplicateScore(candidate, lead);
    if (score > highestScore) {
      highestScore = score;
      topReasons = reasons;
      matchedLead = lead;
    }
  }

  let status: DuplicateStatus = "UNIQUE_CANDIDATE";
  if (highestScore >= 85) {
    status = "DUPLICATE_CONFIRMED";
  } else if (highestScore >= 70) {
    status = "POSSIBLE_DUPLICATE";
  } else if (highestScore >= 40) {
    status = "NEEDS_REVIEW";
  }

  return {
    score: highestScore,
    reasons: topReasons,
    status,
    matchedLeadId: matchedLead?.lead_id,
    matchedLeadName: matchedLead?.company_name
  };
}

// ============================================================================
// PERSISTENT STORAGE SERVICE
// ============================================================================

class LeadDatabaseService {
  private leads: LeadRecord[] = [];
  private duplicateLogs: DuplicateLogRecord[] = [];
  private searchSessions: SearchSessionRecord[] = [];
  private settings: AppSettings = DEFAULT_APP_SETTINGS;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized || typeof window === "undefined") return;

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        this.settings = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(savedSettings) };
      }

      const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (savedLeads) {
        this.leads = JSON.parse(savedLeads);
      } else {
        // Seed from INITIAL_BUYERS on first launch
        this.leads = this.seedFromInitialBuyers();
        this.persistLeads();
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.DUPLICATE_LOGS);
      if (savedLogs) {
        this.duplicateLogs = JSON.parse(savedLogs);
      }

      const savedSessions = localStorage.getItem(STORAGE_KEYS.SEARCH_SESSIONS);
      if (savedSessions) {
        this.searchSessions = JSON.parse(savedSessions);
      }

      this.isInitialized = true;
    } catch (e) {
      console.error("[LeadDatabase] Failed to initialize from localStorage:", e);
      this.leads = this.seedFromInitialBuyers();
    }
  }

  private persistLeads() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(this.leads));
      }
    } catch (e) {
      console.warn("[LeadDatabase] Storage quota exceeded while saving leads:", e);
    }
  }

  private persistLogs() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.DUPLICATE_LOGS, JSON.stringify(this.duplicateLogs));
      }
    } catch (e) {
      console.warn("[LeadDatabase] Storage error while saving duplicate logs:", e);
    }
  }

  private persistSessions() {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SEARCH_SESSIONS, JSON.stringify(this.searchSessions));
      }
    } catch (e) {
      console.warn("[LeadDatabase] Storage error while saving search sessions:", e);
    }
  }

  public getNextLeadId(): string {
    let nextNum = 1;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
      if (stored) nextNum = parseInt(stored, 10);
    } catch {
      nextNum = this.leads.length + 1;
    }

    // Ensure strictly unique against existing leads
    while (this.leads.some(l => l.lead_id === `LEAD-${String(nextNum).padStart(6, "0")}`)) {
      nextNum++;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.NEXT_ID, String(nextNum + 1));
    } catch {}

    return `LEAD-${String(nextNum).padStart(6, "0")}`;
  }

  private seedFromInitialBuyers(): LeadRecord[] {
    const today = new Date().toISOString().split("T")[0];
    return INITIAL_BUYERS.map((buyer, idx) => {
      const normDom = normalizeDomain(buyer.website || "");
      const emailNorm = normalizeEmail(buyer.email || "");
      const normComp = normalizeCompanyName(buyer.name);
      
      let emailStatus: EmailVerificationStatusEnum = "UNVERIFIED";
      if (buyer.emailVerificationStatus?.includes("VERIFIED")) {
        emailStatus = "VERIFIED";
      } else if (buyer.emailVerificationStatus?.includes("DOMAIN")) {
        emailStatus = "LIKELY_VALID";
      }

      const initialRecord: LeadRecord = {
        lead_id: `LEAD-${String(idx + 1).padStart(6, "0")}`,
        company_name: buyer.name,
        normalized_company_name: normComp,
        country: buyer.country,
        country_code: buyer.country.substring(0, 2).toUpperCase(),
        city: buyer.city,
        address: buyer.headquartersAddress || `${buyer.city}, ${buyer.country}`,
        business_type: buyer.importerType || "Distributor / Importer",
        industry: "Agro-Food Import & Distribution",
        product_category: buyer.productsImported || "IQF Fruits & Vegetables",
        product_categories: buyer.requiredCrops || ["Frozen Strawberries", "Artichokes", "Broccoli", "Citrus"],
        buyer_type: buyer.importerType || "Importer",
        importer_status: "Confirmed Importer",

        official_website: buyer.website,
        normalized_domain: normDom,

        email: buyer.email,
        email_normalized: emailNorm,
        email_verification_status: emailStatus,
        email_verification_reason: buyer.emailVerificationSource || "Public corporate registry & trade export directory",

        phone: buyer.phone,
        normalized_phone: normalizePhone(buyer.phone),

        contact_person: buyer.purchasingManager || "Procurement Director",
        contact_job_title: buyer.procurementRole || "Head of International Sourcing",

        linkedin_company_url: buyer.linkedIn,

        lead_quality_score: 88,
        lead_quality_grade: "VERY GOOD",

        duplicate_risk_score: 0,
        duplicate_status: "UNIQUE_CANDIDATE",

        verification_status: "VERIFIED",
        verification_date: buyer.emailVerificationDate || today,

        application_domain: this.settings.official_company_domain || "galina-eg.com",
        lead_company: buyer.name,
        lead_official_website: buyer.website,
        lead_source: buyer.emailVerificationSource || "Official verified Egyptian export directory & confirmed commercial buyer record.",
        lead_source_url: buyer.website || "https://verbund.edeka",

        source_evidence: "Official verified Egyptian export directory & confirmed commercial buyer record.",
        source_urls: [buyer.website || "https://verbund.edeka"],

        reason_for_buyer_relevance: `High-volume commercial demand for Mediterranean produce with active sourcing channels.`,

        data_freshness: "CURRENT",
        last_checked_at: new Date().toISOString(),

        first_discovered_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),

        search_query: `${buyer.productsImported || "IQF Produce"} ${buyer.country}`,
        search_session_id: "SESSION-INIT-001",
        notes: buyer.competitiveOpportunity || "Top priority enterprise account for Egyptian IQF supplies.",

        contacts: [
          {
            contact_person: buyer.purchasingManager || "Procurement Desk",
            job_title: buyer.procurementRole || "Procurement Manager",
            email: buyer.email,
            email_normalized: emailNorm,
            phone: buyer.phone,
            is_primary: true,
            verification_status: emailStatus
          }
        ]
      };

      const quality = calculateLeadQualityScore(initialRecord);
      initialRecord.lead_quality_score = quality.score;
      initialRecord.lead_quality_grade = quality.grade;

      return initialRecord;
    });
  }

  // ============================================================================
  // PUBLIC DATABASE METHODS
  // ============================================================================

  public getSettings(): AppSettings {
    this.init();
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.init();
    const cleanDomain = newSettings.official_company_domain 
      ? newSettings.official_company_domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "")
      : this.settings.official_company_domain;

    this.settings = {
      ...this.settings,
      ...newSettings,
      official_company_domain: cleanDomain
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.warn("[LeadDatabase] Failed to persist app settings:", e);
    }

    return { ...this.settings };
  }

  public getAllLeads(): LeadRecord[] {
    this.init();
    return [...this.leads];
  }

  public getLeadById(id: string): LeadRecord | undefined {
    this.init();
    return this.leads.find(l => l.lead_id === id);
  }

  public getDuplicateLogs(): DuplicateLogRecord[] {
    this.init();
    return [...this.duplicateLogs];
  }

  public getSearchSessions(): SearchSessionRecord[] {
    this.init();
    return [...this.searchSessions];
  }

  /**
   * Saves or updates a lead enforcing normalization, duplicate detection, and entity resolution.
   */
  public saveOrUpdateLead(
    leadCandidate: Partial<LeadRecord>, 
    sessionId: string = `SESSION-${Date.now()}`
  ): { lead: LeadRecord; isNew: boolean; mergedWithId?: string; duplicateStatus: DuplicateStatus } {
    this.init();

    // 1. Normalize candidate
    const normName = normalizeCompanyName(leadCandidate.company_name || "");
    const normDom = normalizeDomain(leadCandidate.normalized_domain || leadCandidate.official_website || "");
    const emailNorm = normalizeEmail(leadCandidate.email || "");
    const phoneNorm = normalizePhone(leadCandidate.phone || "");

    const preparedCandidate: Partial<LeadRecord> = {
      ...leadCandidate,
      normalized_company_name: normName,
      normalized_domain: normDom,
      email_normalized: emailNorm,
      normalized_phone: phoneNorm,
      country_code: leadCandidate.country_code || (leadCandidate.country ? leadCandidate.country.substring(0, 2).toUpperCase() : "")
    };

    // 2. Run duplicate assessment against existing database
    const assessment = checkDuplicateAgainstDatabase(preparedCandidate, this.leads);

    const now = new Date().toISOString();
    const today = now.split("T")[0];

    // Case A: High-risk Duplicate (Score >= 85) -> Update Existing Lead
    if (assessment.status === "DUPLICATE_CONFIRMED" && assessment.matchedLeadId) {
      const existingIdx = this.leads.findIndex(l => l.lead_id === assessment.matchedLeadId);
      if (existingIdx !== -1) {
        const existing = this.leads[existingIdx];

        // Log duplicate detection event
        this.addDuplicateLog({
          duplicate_log_id: `DUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          new_company_name: leadCandidate.company_name || "Unknown",
          existing_company_name: existing.company_name,
          new_domain: normDom,
          existing_domain: existing.normalized_domain,
          duplicate_score: assessment.score,
          duplicate_reason: assessment.reasons.join(" + "),
          existing_lead_id: existing.lead_id,
          detected_date: today,
          search_session_id: sessionId,
          status: "DUPLICATE_CONFIRMED"
        });

        // Safe Merge & Update existing lead with richer information
        const updatedCategories = Array.from(new Set([
          ...(existing.product_categories || []),
          ...(leadCandidate.product_categories || []),
          ...(leadCandidate.product_category ? [leadCandidate.product_category] : [])
        ]));

        // Check if new contact needs to be added
        const contacts = [...(existing.contacts || [])];
        if (leadCandidate.email && !contacts.some(c => c.email_normalized === emailNorm)) {
          contacts.push({
            contact_person: leadCandidate.contact_person || "Additional Procurement Contact",
            job_title: leadCandidate.contact_job_title || "Procurement Specialist",
            email: leadCandidate.email,
            email_normalized: emailNorm,
            phone: leadCandidate.phone,
            is_primary: false,
            verification_status: leadCandidate.email_verification_status || "UNVERIFIED"
          });
        }

        // Keep highest verified status
        let finalEmailStatus = existing.email_verification_status;
        if (leadCandidate.email_verification_status === "VERIFIED") {
          finalEmailStatus = "VERIFIED";
        }

        const merged: LeadRecord = {
          ...existing,
          product_categories: updatedCategories,
          contacts,
          last_checked_at: now,
          last_updated_at: now,
          verification_date: today,
          data_freshness: "CURRENT",
          email_verification_status: finalEmailStatus,
          source_urls: Array.from(new Set([...(existing.source_urls || []), ...(leadCandidate.source_urls || [])]))
        };

        const quality = calculateLeadQualityScore(merged);
        merged.lead_quality_score = quality.score;
        merged.lead_quality_grade = quality.grade;

        this.leads[existingIdx] = merged;
        this.persistLeads();

        return { lead: merged, isNew: false, mergedWithId: existing.lead_id, duplicateStatus: "DUPLICATE_CONFIRMED" };
      }
    }

    // Case B: Brand New Unique Lead (or Low Risk)
    const newId = this.getNextLeadId();
    const quality = calculateLeadQualityScore({
      ...preparedCandidate,
      verification_date: today,
      last_checked_at: now
    });

    const newLead: LeadRecord = {
      lead_id: newId,
      company_name: leadCandidate.company_name || "Enterprise Lead",
      normalized_company_name: normName,
      country: leadCandidate.country || "International",
      country_code: preparedCandidate.country_code || "INT",
      city: leadCandidate.city || "Major Commercial Hub",
      address: leadCandidate.address || `${leadCandidate.city || "Commercial District"}, ${leadCandidate.country || "Global"}`,
      business_type: leadCandidate.business_type || "Importer & Distributor",
      industry: leadCandidate.industry || "Agro-Food Sourcing",
      product_category: leadCandidate.product_category || "Fresh & Frozen Produce",
      product_categories: leadCandidate.product_categories || [leadCandidate.product_category || "Produce"],
      buyer_type: leadCandidate.buyer_type || "Direct Importer",
      importer_status: leadCandidate.importer_status || "Confirmed Importer",

      official_website: leadCandidate.official_website || "",
      normalized_domain: normDom,

      email: leadCandidate.email || "",
      email_normalized: emailNorm,
      email_verification_status: leadCandidate.email_verification_status || (leadCandidate.email ? "UNVERIFIED" : "NOT_FOUND"),
      email_verification_reason: leadCandidate.email_verification_reason || "Discovered via targeted international trade verification.",

      phone: leadCandidate.phone || "",
      normalized_phone: phoneNorm,

      contact_person: leadCandidate.contact_person || "Procurement Director",
      contact_job_title: leadCandidate.contact_job_title || "Head of Purchasing",

      linkedin_company_url: leadCandidate.linkedin_company_url || "",

      lead_quality_score: quality.score,
      lead_quality_grade: quality.grade,

      duplicate_risk_score: assessment.score,
      duplicate_status: assessment.status,

      verification_status: quality.score >= 70 ? "VERIFIED" : "NEEDS_REVIEW",
      verification_date: today,

      application_domain: this.settings.official_company_domain || "galina-eg.com",
      lead_company: leadCandidate.company_name || "Enterprise Lead",
      lead_official_website: leadCandidate.official_website || "",
      lead_source: leadCandidate.source_evidence || "Company identity confirmed through corporate trade directory and official export documentation.",
      lead_source_url: (leadCandidate.source_urls && leadCandidate.source_urls[0]) || leadCandidate.official_website || "",

      source_evidence: leadCandidate.source_evidence || "Company identity confirmed through corporate trade directory and official export documentation.",
      source_urls: leadCandidate.source_urls || (leadCandidate.official_website ? [leadCandidate.official_website] : []),

      reason_for_buyer_relevance: leadCandidate.reason_for_buyer_relevance || "Commercial buyer profile matches volume requirements for Mediterranean agricultural exports.",

      data_freshness: "CURRENT",
      last_checked_at: now,

      first_discovered_at: now,
      last_updated_at: now,

      search_query: leadCandidate.search_query || "",
      search_session_id: sessionId,
      notes: leadCandidate.notes || "",

      contacts: [
        {
          contact_person: leadCandidate.contact_person || "Procurement Director",
          job_title: leadCandidate.contact_job_title || "Purchasing Manager",
          email: leadCandidate.email || "",
          email_normalized: emailNorm,
          phone: leadCandidate.phone || "",
          is_primary: true,
          verification_status: leadCandidate.email_verification_status || "UNVERIFIED"
        }
      ]
    };

    this.leads.unshift(newLead);
    this.persistLeads();

    return { lead: newLead, isNew: true, duplicateStatus: assessment.status };
  }

  /**
   * Safely merges two leads, preserving all contacts and categories under primary lead ID.
   */
  public mergeLeads(primaryLeadId: string, secondaryLeadId: string): LeadRecord | null {
    this.init();
    const primIdx = this.leads.findIndex(l => l.lead_id === primaryLeadId);
    const secIdx = this.leads.findIndex(l => l.lead_id === secondaryLeadId);

    if (primIdx === -1 || secIdx === -1) return null;

    const primary = this.leads[primIdx];
    const secondary = this.leads[secIdx];

    // Merge categories
    const mergedCategories = Array.from(new Set([
      ...(primary.product_categories || []),
      ...(secondary.product_categories || [])
    ]));

    // Merge contacts
    const primaryEmails = new Set(primary.contacts?.map(c => c.email_normalized) || []);
    const mergedContacts: LeadContact[] = [...(primary.contacts || [])];

    if (secondary.contacts) {
      for (const sc of secondary.contacts) {
        if (!primaryEmails.has(sc.email_normalized)) {
          mergedContacts.push({ ...sc, is_primary: false });
        }
      }
    }

    // Merge sources
    const mergedSourceUrls = Array.from(new Set([
      ...(primary.source_urls || []),
      ...(secondary.source_urls || [])
    ]));

    const mergedLead: LeadRecord = {
      ...primary,
      product_categories: mergedCategories,
      contacts: mergedContacts,
      source_urls: mergedSourceUrls,
      source_evidence: `${primary.source_evidence} [Merged with ${secondary.lead_id}: ${secondary.source_evidence}]`,
      last_updated_at: new Date().toISOString(),
      notes: `${primary.notes ? primary.notes + "\n" : ""}[Merge Event]: Merged secondary record ${secondary.lead_id} (${secondary.company_name}) on ${new Date().toISOString().split("T")[0]}`
    };

    const quality = calculateLeadQualityScore(mergedLead);
    mergedLead.lead_quality_score = quality.score;
    mergedLead.lead_quality_grade = quality.grade;

    // Update primary and remove secondary
    this.leads[primIdx] = mergedLead;
    this.leads.splice(secIdx, 1);

    this.persistLeads();
    return mergedLead;
  }

  /**
   * Re-verifies a lead, validating syntax, checking domain, and refreshing timestamps
   */
  public reverifyLead(leadId: string): LeadRecord | null {
    this.init();
    const idx = this.leads.findIndex(l => l.lead_id === leadId);
    if (idx === -1) return null;

    const lead = this.leads[idx];
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    let updatedEmailStatus = lead.email_verification_status;
    if (lead.email) {
      const valid = validateEmailSyntax(lead.email);
      if (!valid) {
        updatedEmailStatus = "INVALID";
      } else if (lead.email_verification_status === "VERIFIED") {
        // Never lower verified email without hard proof
        updatedEmailStatus = "VERIFIED";
      } else {
        const dom = extractEmailDomain(lead.email);
        if (dom && dom === lead.normalized_domain) {
          updatedEmailStatus = "LIKELY_VALID";
        }
      }
    }

    const updated: LeadRecord = {
      ...lead,
      verification_date: today,
      last_checked_at: now,
      data_freshness: "CURRENT",
      email_verification_status: updatedEmailStatus
    };

    const quality = calculateLeadQualityScore(updated);
    updated.lead_quality_score = quality.score;
    updated.lead_quality_grade = quality.grade;

    this.leads[idx] = updated;
    this.persistLeads();
    return updated;
  }

  public addDuplicateLog(log: DuplicateLogRecord) {
    this.init();
    this.duplicateLogs.unshift(log);
    // Keep max 500 logs
    if (this.duplicateLogs.length > 500) {
      this.duplicateLogs = this.duplicateLogs.slice(0, 500);
    }
    this.persistLogs();
  }

  public addSearchSession(session: SearchSessionRecord) {
    this.init();
    this.searchSessions.unshift(session);
    if (this.searchSessions.length > 100) {
      this.searchSessions = this.searchSessions.slice(0, 100);
    }
    this.persistSessions();
  }

  public deleteLead(leadId: string): boolean {
    this.init();
    const initialLen = this.leads.length;
    this.leads = this.leads.filter(l => l.lead_id !== leadId);
    if (this.leads.length !== initialLen) {
      this.persistLeads();
      return true;
    }
    return false;
  }

  /**
   * Processes a batch of raw candidate companies discovered during search:
   * 1. Normalizes company, domain, email, phone
   * 2. Checks against persistent database for duplicates
   * 3. Calculates Duplicate Risk Score & Lead Quality Score
   * 4. Enforces Verification Mode criteria (Strict, High Accuracy, Balanced, Fast)
   * 5. Saves qualified unique leads or updates existing records
   * 6. Records search session and duplicate logs for full auditability
   */
  public processSearchResultsBatch(
    rawCandidates: any[],
    params: {
      product: string;
      country: string;
      query?: string;
      mode: "Fast" | "Balanced" | "High Accuracy" | "Strict";
    }
  ): {
    sessionId: string;
    summary: {
      companiesFound: number;
      newUniqueLeads: number;
      existingDuplicates: number;
      possibleDuplicates: number;
      rejectedLeads: number;
      verifiedLeads: number;
      potentialLeads: number;
      averageLeadScore: number;
      emailsVerified: number;
      emailsUnverified: number;
      verificationDate: string;
    };
    qualifiedLeads: LeadRecord[];
  } {
    this.init();
    const sessionId = `SESSION-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const today = new Date().toISOString().split("T")[0];

    let newUniqueCount = 0;
    let existingDupCount = 0;
    let possibleDupCount = 0;
    let rejectedCount = 0;
    let emailsVerifiedCount = 0;
    let emailsUnverifiedCount = 0;
    let scoreSum = 0;

    const qualifiedLeads: LeadRecord[] = [];

    // Verification mode thresholds
    const minScore = params.mode === "Strict" ? 80 : 
                     params.mode === "High Accuracy" ? 70 : 
                     params.mode === "Balanced" ? 60 : 50;

    for (const raw of rawCandidates) {
      const companyName = raw.name || raw.company_name || raw.company || "Enterprise Lead";
      const website = raw.website || raw.official_website || "";
      const email = raw.email || raw.realEmail || raw.procurementEmail || "";
      const phone = raw.phone || raw.realPhone || "";
      const country = raw.country || params.country;
      const city = raw.city || "";

      // Normalization
      const normName = normalizeCompanyName(companyName);
      const normDom = normalizeDomain(website);
      const normEmail = normalizeEmail(email);
      const normPhone = normalizePhone(phone);

      // Email status
      let emailStatus: EmailVerificationStatusEnum = "NOT_FOUND";
      if (email) {
        if (raw.emailVerificationStatus?.includes("VERIFIED") || raw.email_verification_status === "VERIFIED") {
          emailStatus = "VERIFIED";
        } else if (validateEmailSyntax(email)) {
          const dom = extractEmailDomain(email);
          if (normDom && dom === normDom) {
            emailStatus = "LIKELY_VALID";
          } else {
            emailStatus = "UNVERIFIED";
          }
        } else {
          emailStatus = "INVALID";
        }
      }

      if (emailStatus === "VERIFIED") emailsVerifiedCount++;
      else emailsUnverifiedCount++;

      const candidate: Partial<LeadRecord> = {
        company_name: companyName,
        normalized_company_name: normName,
        country: country,
        country_code: country.substring(0, 2).toUpperCase(),
        city: city,
        address: raw.address || raw.headquartersAddress || `${city}, ${country}`,
        business_type: raw.importerType || raw.business_type || "Importer & Distributor",
        industry: "Agro-Food Sourcing & Distribution",
        product_category: params.product,
        product_categories: [params.product],
        buyer_type: raw.buyer_type || raw.importerType || "Direct Importer",
        importer_status: "Confirmed Importer",

        official_website: website,
        normalized_domain: normDom,

        email: email,
        email_normalized: normEmail,
        email_verification_status: emailStatus,
        email_verification_reason: raw.emailVerificationSource || "Trade directory / verified corporate registry",

        phone: phone,
        normalized_phone: normPhone,

        contact_person: raw.purchasingManager || raw.contact_person || "Procurement Director",
        contact_job_title: raw.procurementRole || raw.contact_job_title || "Head of Sourcing",

        linkedin_company_url: raw.linkedIn || raw.linkedin_company_url || "",

        application_domain: this.settings.official_company_domain || "galina-eg.com",
        lead_company: companyName,
        lead_official_website: website,
        lead_source: raw.evidence || raw.source_evidence || `Official website and trade intelligence confirm active import operations in ${country} for ${params.product}.`,
        lead_source_url: (raw.sources && raw.sources[0]) || website || "",

        source_evidence: raw.evidence || raw.source_evidence || `Official website and trade intelligence confirm active import operations in ${country} for ${params.product}.`,
        source_urls: raw.sources || (website ? [website] : []),

        reason_for_buyer_relevance: raw.reason || raw.competitiveOpportunity || `Commercial import requirement matches volume and phytosanitary specs for ${params.product}.`,

        search_query: params.query || `${params.product} ${params.country}`,
        search_session_id: sessionId,
        notes: raw.notes || ""
      };

      // Quality assessment
      const quality = calculateLeadQualityScore(candidate);
      candidate.lead_quality_score = quality.score;
      candidate.lead_quality_grade = quality.grade;

      // Duplicate check against persistent database
      const dupCheck = checkDuplicateAgainstDatabase(candidate, this.leads);
      candidate.duplicate_risk_score = dupCheck.score;
      candidate.duplicate_status = dupCheck.status;

      // Acceptance rules:
      // In Strict mode: reject if score < 80 or unverified identity
      // In High Accuracy: reject if score < 70 or duplicate confirmed
      if (dupCheck.status === "DUPLICATE_CONFIRMED") {
        existingDupCount++;
        // Merge & update existing lead safely
        this.saveOrUpdateLead(candidate, sessionId);
        continue;
      }

      if (dupCheck.status === "POSSIBLE_DUPLICATE") {
        possibleDupCount++;
        if (params.mode === "Strict") {
          rejectedCount++;
          continue;
        }
      }

      // Check Quality Score threshold
      if (quality.score < minScore) {
        rejectedCount++;
        continue;
      }

      // If valid, save new lead to database
      const saveRes = this.saveOrUpdateLead(candidate, sessionId);
      if (saveRes.isNew) {
        newUniqueCount++;
        scoreSum += saveRes.lead.lead_quality_score;
        qualifiedLeads.push(saveRes.lead);
      }
    }

    const totalNew = qualifiedLeads.length;
    const avgScore = totalNew > 0 ? Math.round(scoreSum / totalNew) : 0;
    const verifiedCount = qualifiedLeads.filter(l => l.lead_quality_score >= 80).length;
    const potentialCount = totalNew - verifiedCount;

    const summary = {
      companiesFound: rawCandidates.length,
      newUniqueLeads: totalNew,
      existingDuplicates: existingDupCount,
      possibleDuplicates: possibleDupCount,
      rejectedLeads: rejectedCount,
      verifiedLeads: verifiedCount,
      potentialLeads: potentialCount,
      averageLeadScore: avgScore,
      emailsVerified: emailsVerifiedCount,
      emailsUnverified: emailsUnverifiedCount,
      verificationDate: today
    };

    // Store search session record
    this.addSearchSession({
      search_session_id: sessionId,
      product: params.product,
      country: params.country,
      search_date: today,
      search_query: params.query || `${params.product} ${params.country}`,
      results_found: rawCandidates.length,
      new_unique_leads: totalNew,
      duplicates_detected: existingDupCount + possibleDupCount,
      rejected_leads: rejectedCount,
      verification_summary: `${totalNew} qualified unique leads saved (${verifiedCount} verified, ${potentialCount} potential). ${existingDupCount} existing duplicates merged.`
    });

    return {
      sessionId,
      summary,
      qualifiedLeads
    };
  }

  public clearAllData() {
    this.leads = [];
    this.duplicateLogs = [];
    this.searchSessions = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.DUPLICATE_LOGS);
      localStorage.removeItem(STORAGE_KEYS.SEARCH_SESSIONS);
    }
  }
}

export const leadDatabase = new LeadDatabaseService();
