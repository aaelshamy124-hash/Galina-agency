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
}

export type EmailVerificationStatus = 
  | "VERIFIED – OFFICIAL COMPANY SOURCE"
  | "VERIFIED – PUBLICLY CONFIRMED"
  | "DOMAIN/MX VERIFIED – EMAIL NOT CONFIRMED"
  | "NOT VERIFIED"
  | "NO VERIFIED EMAIL FOUND";

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
