export interface Product {
  id: string;
  name: string;
  code: string;
  category: "Fruit" | "Vegetable" | "Mixed";
  seasonStart: string; // e.g., "January"
  seasonEnd: string;
  targetTemp: string; // e.g., "-18°C"
  description: string;
  hsCode: string;
}

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 2-letter
  flag: string;
  population: string;
  foodImportValue: string; // e.g., "$15B"
  vegImportValue: string;  // e.g., "$240M"
  currency: string;
  language: string;
  ports: string[];
  tariffRate: string;
  certificates: string[];
  marketVibe: "Excellent" | "Good" | "Competitive";
}

export interface ProspectBuyer {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  email: string;
  phone: string;
  linkedIn: string;
  purchasingManager: string;
  importerType: string; // "Importer" | "Distributor" | "Wholesaler" | "Retail Chain" | "Food Factory" | "Frozen Food Company" | "Hotel Supplier"
  companySize: "Small" | "Medium" | "Large";
  employees: number;
  yearsInBusiness: number;
  importsFromEgypt: boolean;
  importsFromTurkey: boolean;
  importsFromChina: boolean;
  importsFromIndia: boolean;
  competitiveOpportunity: string;
  aiScore: number;
  status: "New Lead" | "Contacted" | "Negotiation" | "Quotation" | "Sample Sent" | "Waiting" | "Won" | "Lost";
  notes?: string;
  lastContactDate?: string;
  emailsSentCount: number;
  emailLogs?: EmailLog[];
  annualRevenue?: string;
  productsImported?: string;
  contactStrategy?: string;
  // Fruit & Vegetable Sourcing & Export Intent Signals
  requiredCrops?: string[];
  certificationsRequired?: string[];
  annualImportVolume?: string;
  sourcingTriggers?: string[];
  sourcingChannel?: "IQF Frozen Foods" | "Fresh Produce" | "Food Processing / Manufacturing" | "Supermarket Retail Line" | "Foodservice Wholesaler";
  intentSignalScore?: number;
  recentTriggers?: string[];
  // Enhanced Commercial & Logistics Trade Attributes
  procurementRole?: string;
  incoterms?: string;
  paymentTerms?: string;
  destinationPort?: string;
  mrlCompliance?: string;
  sampleRequestPolicy?: string;
  containerSpecs?: string;
  // Official Verified Corporate Contacts
  realEmail?: string;
  procurementEmail?: string;
  realPhone?: string;
  headquartersAddress?: string;
  contactVerified?: boolean;
  emailVerificationStatus?: EmailVerificationStatus;
  emailVerificationSource?: string;
  emailVerificationDate?: string;
  source_evidence?: string;
  source_urls?: string[];
}

export type EmailVerificationStatus = 
  | "VERIFIED – OFFICIAL COMPANY SOURCE"
  | "VERIFIED – PUBLICLY CONFIRMED"
  | "DOMAIN/MX VERIFIED – EMAIL NOT CONFIRMED"
  | "NOT VERIFIED"
  | "NO VERIFIED EMAIL FOUND";

export type EmailVerificationStatusEnum = 
  | "VERIFIED"
  | "LIKELY_VALID"
  | "UNVERIFIED"
  | "INVALID"
  | "NOT_FOUND";

export type LeadQualityGrade = "EXCELLENT" | "VERY GOOD" | "GOOD" | "MEDIUM" | "LOW";

export type DuplicateStatus = "DUPLICATE_CONFIRMED" | "POSSIBLE_DUPLICATE" | "NEEDS_REVIEW" | "UNIQUE_CANDIDATE";

export type LeadVerificationStatus = "NEW" | "VERIFIED" | "PARTIALLY_VERIFIED" | "NEEDS_REVIEW" | "DUPLICATE" | "REJECTED" | "ARCHIVED";

export type DataFreshness = "CURRENT" | "RECENT" | "AGING" | "OUTDATED" | "UNKNOWN";

export type SourceType = 
  | "OFFICIAL_WEBSITE" 
  | "GOVERNMENT_REGISTRY" 
  | "OFFICIAL_LINKEDIN" 
  | "TRADE_ASSOCIATION" 
  | "TRADE_DIRECTORY" 
  | "BUSINESS_DATABASE" 
  | "SEARCH_RESULT" 
  | "OTHER";

export interface LeadContact {
  contact_person: string;
  job_title?: string;
  email?: string;
  email_normalized?: string;
  phone?: string;
  is_primary?: boolean;
  verification_status?: EmailVerificationStatusEnum;
}

export interface LeadRecord {
  lead_id: string; // e.g., LEAD-000001
  company_name: string;
  normalized_company_name: string;
  country: string;
  country_code: string;
  city: string;
  address: string;
  business_type: string;
  industry: string;
  product_category: string;
  product_categories?: string[];
  buyer_type: string;
  importer_status: string;

  official_website: string;
  normalized_domain: string;

  email: string;
  email_normalized: string;
  email_verification_status: EmailVerificationStatusEnum;
  email_verification_reason?: string;

  phone: string;
  normalized_phone: string;

  contact_person: string;
  contact_job_title: string;

  linkedin_company_url?: string;

  lead_quality_score: number; // 0 - 100
  lead_quality_grade: LeadQualityGrade;

  duplicate_risk_score: number; // 0 - 100
  duplicate_status: DuplicateStatus;

  verification_status: LeadVerificationStatus;
  verification_date: string; // YYYY-MM-DD

  source_evidence: string;
  source_urls: string[];

  reason_for_buyer_relevance: string;

  data_freshness: DataFreshness;
  last_checked_at: string;

  first_discovered_at: string;
  last_updated_at: string;

  search_query?: string;
  search_session_id?: string;

  notes?: string;
  contacts?: LeadContact[];
  data_conflict?: boolean;
  conflict_details?: string;
}

export interface DuplicateLogRecord {
  duplicate_log_id: string;
  new_company_name: string;
  existing_company_name: string;
  new_domain?: string;
  existing_domain?: string;
  duplicate_score: number;
  duplicate_reason: string;
  existing_lead_id?: string;
  detected_date: string;
  search_session_id?: string;
  status: DuplicateStatus;
}

export interface SearchSessionRecord {
  search_session_id: string;
  product: string;
  country: string;
  search_date: string;
  search_query: string;
  results_found: number;
  new_unique_leads: number;
  duplicates_detected: number;
  rejected_leads: number;
  verification_summary: string;
}

export interface VerifiedLeadRecord {
  id?: string;
  company: string;
  country: string;
  contactPerson: string;
  position: string;
  email: string;
  verificationStatus: EmailVerificationStatus;
  source: string;
  verificationDate: string;
  domain?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: "Farm" | "Packaging" | "Logistics";
  location: string;
  rating: number;
  certificates: string[];
  productsSourced: string[];
  contactPerson: string;
  phone: string;
}

export interface Exhibition {
  id: string;
  name: string;
  date: string;
  location: string;
  attendees: string;
  website: string;
  description: string;
}

export interface Competitor {
  id: string;
  name: string;
  country: string;
  products: string[];
  pricingIndex: "Competitive" | "Premium" | "Economy";
  certifications: string[];
  exhibitions: string[];
}

export interface EmailLog {
  id: string;
  prospectId: string;
  subject: string;
  body: string;
  sentAt: string;
  language: string;
  status: "Sent" | "Opened" | "Replied";
}

export interface MessageLog {
  id: string;
  prospectId: string;
  platform: "WhatsApp" | "Email";
  content: string;
  sentAt: string;
}
