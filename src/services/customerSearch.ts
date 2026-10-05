import { ProspectBuyer, LeadRecord } from "../types";

/**
 * Normalizes Arabic and English text for accurate search:
 * - Unifies Alef variants (أ, إ, آ, ء -> ا)
 * - Unifies Taa Marbuta (ة -> ه)
 * - Unifies Yaa / Alef Maksura (ى -> ي)
 * - Unifies Waw with Hamza (ؤ -> و)
 * - Strips Tashkeel (diacritics) & Tatweel
 * - Removes symbols and normalizes whitespace
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return "";
  let clean = text.toLowerCase().trim();

  // Normalize Arabic diacritics (Tashkeel)
  clean = clean.replace(/[\u064B-\u065F\u0670]/g, "");

  // Normalize Arabic Alef variants (أ, إ, آ, ء -> ا)
  clean = clean.replace(/[أإآء]/g, "ا");

  // Normalize Taa Marbuta (ة -> ه)
  clean = clean.replace(/ة/g, "ه");

  // Normalize Yaa / Alef Maksura (ى -> ي)
  clean = clean.replace(/ى/g, "ي");

  // Normalize Arabic ligature Waw with Hamza, etc.
  clean = clean.replace(/ؤ/g, "و").replace(/ئ/g, "ي");

  // Remove tatweel (kashida)
  clean = clean.replace(/\u0640/g, "");

  // Remove common punctuation except @ and .
  clean = clean.replace(/[,\/#!$%\^&\*;:{}=\-_`~()?"'«»\[\]]/g, " ");

  return clean.replace(/\s+/g, " ").trim();
}

// Stop words that should NOT block multi-term search (e.g. "في", "من", "in", "for")
const STOP_WORDS = new Set<string>([
  "في", "من", "الى", "الي", "علي", "على", "عن", "مع", "هو", "هي", "هم", "هذا", "هذه", "ذلك", 
  "التي", "الذي", "كل", "جميع", "او", "و", "ثم", "ان", "ما", "هل", "بين", "حول", "لدى",
  "in", "at", "to", "from", "for", "with", "the", "a", "an", "and", "or", "of", "by", "on", "into"
]);

// Concept Dictionary: Maps Arabic keywords to English trade terms and vice versa
const CONCEPT_MAPPINGS: Record<string, string[]> = {
  // Common Buyer / Client Entities (crucial for "عملاء", "زبائن", "مشتري")
  "عميل": ["buyer", "client", "customer", "prospect", "importer", "مشتري", "مستورد"],
  "عملاء": ["buyer", "buyers", "clients", "customers", "importers", "مشتري", "مشترين", "مستوردين"],
  "زبون": ["buyer", "customer", "client", "مشتري"],
  "زبائن": ["buyers", "customers", "clients", "مشترين"],
  "مشتري": ["buyer", "purchaser", "procurement", "sourcing", "عميل"],
  "مشترين": ["buyers", "purchasers", "procurement", "عملاء"],
  "مشترون": ["buyers", "purchasers", "procurement", "عملاء"],
  "buyer": ["عميل", "مشتري", "مستورد"],
  "buyers": ["عملاء", "مشترين", "مستوردين"],
  "client": ["عميل", "مشتري"],
  "clients": ["عملاء", "مشترين"],
  "customer": ["عميل", "مشتري"],
  "customers": ["عملاء", "مشترين"],
  "prospect": ["عميل محتمل", "مستورد"],
  "prospects": ["عملاء محتملين", "مستوردين"],

  // Companies & Firms
  "شركه": ["company", "firm", "corp", "group", "enterprise"],
  "شركة": ["company", "firm", "corp", "group", "enterprise"],
  "شركات": ["companies", "firms", "corporations", "groups"],
  "مؤسسه": ["institution", "establishment", "company"],
  "مؤسسة": ["institution", "establishment", "company"],
  "مؤسسات": ["establishments", "companies"],
  "مجموعه": ["group", "holdings"],
  "مجموعة": ["group", "holdings"],
  "company": ["شركة", "مؤسسة"],
  "companies": ["شركات", "مؤسسات"],

  // HS Codes
  "081110": ["strawberry", "strawberries", "فراولة", "فراوله"],
  "081190": ["mango", "berries", "pomegranate", "fruits", "مانجو", "رمان", "فواكه"],
  "071080": ["vegetables", "broccoli", "artichoke", "okra", "خضروات", "خضار", "بروكلي", "خرشوف", "بامية"],
  "071021": ["peas", "green peas", "بازلاء", "بسلة"],
  "071022": ["beans", "green beans", "فاصوليا"],
  "07108020": ["artichoke", "artichokes", "خرشوف", "ارضي شوكي"],
  "07108095": ["okra", "بامية", "باميه"],

  // Crops
  "فراوله": ["strawberry", "strawberries", "081110", "iqf"],
  "فراولة": ["strawberry", "strawberries", "081110", "iqf"],
  "strawberry": ["فراولة", "فراوله", "081110"],
  "strawberries": ["فراولة", "فراوله", "081110"],
  "مانجو": ["mango", "mangoes", "puree", "pulp"],
  "مانجا": ["mango", "mangoes", "puree"],
  "mango": ["مانجو", "مانجا"],
  "mangoes": ["مانجو", "مانجا"],
  "بروكلي": ["broccoli", "florets"],
  "broccoli": ["بروكلي"],
  "خرشوف": ["artichoke", "artichokes", "bottoms"],
  "ارضي شوكي": ["artichoke", "artichokes"],
  "artichoke": ["خرشوف", "ارضي شوكي"],
  "artichokes": ["خرشوف", "ارضي شوكي"],
  "باميه": ["okra"],
  "بامية": ["okra"],
  "okra": ["بامية", "باميه"],
  "رمان": ["pomegranate", "arils"],
  "pomegranate": ["رمان"],
  "بازلاء": ["peas", "green peas"],
  "بسله": ["peas", "green peas"],
  "بسلة": ["peas", "green peas"],
  "peas": ["بازلاء", "بسلة", "بسله"],
  "فاصوليا": ["beans", "green beans"],
  "فاصولياء": ["beans", "green beans"],
  "beans": ["فاصوليا", "فاصولياء"],
  "موالح": ["citrus", "orange", "lemon"],
  "برتقال": ["citrus", "orange"],
  "citrus": ["موالح", "برتقال"],
  "خضار": ["vegetable", "vegetables", "iqf", "produce"],
  "خضروات": ["vegetable", "vegetables", "iqf", "produce"],
  "vegetable": ["خضار", "خضروات"],
  "vegetables": ["خضار", "خضروات"],
  "produce": ["محاصيل", "خضار", "فواكه"],
  "فاكهه": ["fruit", "fruits", "iqf"],
  "فاكهة": ["fruit", "fruits", "iqf"],
  "فواكه": ["fruit", "fruits", "iqf"],
  "fruit": ["فاكهة", "فواكه"],
  "fruits": ["فاكهة", "فواكه"],
  "مجمد": ["iqf", "frozen", "cold"],
  "مجمده": ["iqf", "frozen", "cold"],
  "مجمدة": ["iqf", "frozen", "cold"],
  "مجمدات": ["iqf", "frozen", "cold"],
  "تجميد": ["iqf", "frozen", "cold"],
  "frozen": ["مجمد", "مجمدة", "مجمدات", "تجميد"],
  "iqf": ["مجمد", "مجمدة", "مجمدات", "تجميد"],

  // Countries
  "سعوديه": ["saudi", "arabia", "ksa", "riyadh", "jeddah"],
  "السعوديه": ["saudi", "arabia", "ksa", "riyadh", "jeddah"],
  "سعودية": ["saudi", "arabia", "ksa", "riyadh", "jeddah"],
  "السعودية": ["saudi", "arabia", "ksa", "riyadh", "jeddah"],
  "المملكه": ["saudi", "arabia", "ksa"],
  "المملكة": ["saudi", "arabia", "ksa"],
  "saudi": ["السعودية", "سعودية", "المملكة"],
  "ksa": ["السعودية", "سعودية"],
  "المانيا": ["germany", "deutschland", "german", "hamburg", "berlin"],
  "ألمانيا": ["germany", "deutschland", "german", "hamburg", "berlin"],
  "germany": ["ألمانيا", "المانيا"],
  "deutschland": ["ألمانيا", "المانيا"],
  "امارات": ["uae", "emirates", "dubai", "abu dhabi", "sharjah"],
  "الامارات": ["uae", "emirates", "dubai", "abu dhabi", "sharjah"],
  "الإمارات": ["uae", "emirates", "dubai", "abu dhabi", "sharjah"],
  "دبي": ["dubai", "uae", "الامارات"],
  "ابوظبي": ["abu dhabi", "uae", "الامارات"],
  "أبوظبي": ["abu dhabi", "uae", "الامارات"],
  "uae": ["الإمارات", "الامارات"],
  "emirates": ["الإمارات", "الامارات"],
  "بريطانيا": ["uk", "united kingdom", "britain", "england", "london"],
  "المملكة المتحدة": ["uk", "united kingdom", "britain", "london"],
  "انجلترا": ["england", "uk", "britain", "london"],
  "uk": ["بريطانيا", "المملكة المتحدة", "انجلترا"],
  "امريكا": ["usa", "united states", "america"],
  "أمريكا": ["usa", "united states", "america"],
  "الولايات المتحدة": ["usa", "united states", "america"],
  "usa": ["أمريكا", "امريكا", "الولايات المتحدة"],
  "america": ["أمريكا", "امريكا"],
  "فرنسا": ["france", "french", "paris"],
  "france": ["فرنسا"],
  "french": ["فرنسا", "فرنسي"],
  "ايطاليا": ["italy", "italian", "italia", "rome", "milan"],
  "إيطاليا": ["italy", "italian", "italia", "rome", "milan"],
  "italy": ["إيطاليا", "ايطاليا"],
  "italia": ["إيطاليا", "ايطاليا"],
  "اسبانيا": ["spain", "spanish", "espana", "madrid", "barcelona"],
  "إسبانيا": ["spain", "spanish", "espana", "madrid", "barcelona"],
  "spain": ["إسبانيا", "اسبانيا"],
  "espana": ["إسبانيا", "اسبانيا"],
  "كندا": ["canada", "canadian", "toronto", "montreal"],
  "canada": ["كندا"],
  "بولندا": ["poland", "polish", "polska", "warsaw"],
  "poland": ["بولندا"],
  "polska": ["بولندا"],
  "يابان": ["japan", "japanese", "tokyo"],
  "اليابان": ["japan", "japanese", "tokyo"],
  "japan": ["اليابان", "يابان"],
  "كوريا": ["korea", "south korea", "korean", "seoul"],
  "korea": ["كوريا"],
  "برازيل": ["brazil", "brazilian", "brasil", "sao paulo"],
  "البرازيل": ["brazil", "brazilian", "brasil"],
  "brazil": ["البرازيل", "برازيل"],
  "هولندا": ["netherlands", "dutch", "holland", "rotterdam", "amsterdam"],
  "الهولندا": ["netherlands", "dutch", "holland", "rotterdam"],
  "netherlands": ["هولندا", "الهولندا"],
  "holland": ["هولندا"],
  "dutch": ["هولندا", "هولندي"],
  "بلجيكا": ["belgium", "belgian", "antwerp", "brussels"],
  "البلجيكا": ["belgium", "belgian", "antwerp"],
  "belgium": ["بلجيكا"],
  "belgian": ["بلجيكا", "بلجيكي"],
  "مصر": ["egypt", "egyptian", "alexandria", "cairo"],
  "المصرية": ["egypt", "egyptian"],
  "egypt": ["مصر", "المصرية"],

  // Cities
  "الرياض": ["riyadh"],
  "رياض": ["riyadh"],
  "riyadh": ["الرياض", "رياض"],
  "جده": ["jeddah"],
  "جدة": ["jeddah"],
  "jeddah": ["جدة", "جده"],
  "الدمام": ["dammam"],
  "دمام": ["dammam"],
  "dammam": ["الدمام", "دمام"],
  "هامبورج": ["hamburg"],
  "هامبورغ": ["hamburg"],
  "hamburg": ["هامبورج", "هامبورغ"],
  "كولونيا": ["cologne", "koln"],
  "كولن": ["cologne", "koln"],
  "لندن": ["london"],
  "london": ["لندن"],
  "باريس": ["paris"],
  "paris": ["باريس"],
  "نيويورك": ["new york"],
  "new york": ["نيويورك"],

  // Business Types & Channels
  "سوبرماركت": ["supermarket", "retail", "chain", "hypermarket"],
  "هايبرماركت": ["hypermarket", "supermarket", "retail"],
  "تجزئه": ["retail", "supermarket"],
  "تجزئة": ["retail", "supermarket"],
  "retail": ["تجزئة", "سوبرماركت"],
  "مستورد": ["importer", "import", "distributor"],
  "مستوردين": ["importers", "importer", "distributor", "distributors"],
  "مستوردون": ["importers", "importer", "distributor"],
  "استيراد": ["importer", "import"],
  "importer": ["مستورد", "استيراد"],
  "importers": ["مستوردين", "مستوردون", "مستورد"],
  "موزع": ["distributor", "distribution"],
  "موزعين": ["distributors", "distributor"],
  "توزيع": ["distributor", "distribution"],
  "distributor": ["موزع", "توزيع"],
  "distributors": ["موزعين", "موزع"],
  "جمله": ["wholesaler", "wholesale"],
  "جملة": ["wholesaler", "wholesale"],
  "wholesaler": ["جملة", "تاجر جملة"],
  "مصنع": ["factory", "processing", "manufacturing", "processor"],
  "مصانع": ["factories", "manufacturing", "processing"],
  "تصنيع": ["factory", "processing", "manufacturing"],
  "factory": ["مصنع", "تصنيع"],
  "فنادق": ["foodservice", "horeca", "hotel"],
  "مطاعم": ["foodservice", "horeca", "restaurant"],
  "foodservice": ["خدمات أغذية", "فنادق ومطاعم", "horeca"],

  // Quality & Certifications
  "حلال": ["halal"],
  "halal": ["حلال"],
  "عضوي": ["organic", "bio"],
  "organic": ["عضوي", "أورجانيك"],
  "ايزو": ["iso", "22000"],
  "بركس": ["brix", "sugar"],
  "بي ار سي": ["brcgs", "brc"],
  "brcgs": ["brc", "شهادة جودة بي ار سي"],
  "اي اف اس": ["ifs", "food v8"],
  "ifs": ["شهادة اي اف اس"]
};

/**
 * Builds concept groups for a query:
 * Filters out stop words, maps synonyms across Arabic/English, handles prefixes & plurals.
 */
export function buildQueryConceptGroups(query: string): string[][] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Check if query is an email or domain directly
  if (trimmed.includes("@") || trimmed.includes(".com") || trimmed.includes(".de") || trimmed.includes(".sa") || trimmed.includes(".net")) {
    return [[trimmed, normalizeSearchText(trimmed)]];
  }

  const normQuery = normalizeSearchText(query);
  const words = normQuery.split(" ").filter(w => w.length > 0 && !STOP_WORDS.has(w));
  if (words.length === 0) return [];

  const groups: string[][] = [];

  for (const word of words) {
    const groupSet = new Set<string>();
    groupSet.add(word);

    // Direct synonym lookup
    if (CONCEPT_MAPPINGS[word]) {
      for (const syn of CONCEPT_MAPPINGS[word]) {
        groupSet.add(normalizeSearchText(syn));
      }
    }

    // Strip Arabic "ال" prefix if present
    if (word.startsWith("ال") && word.length > 3) {
      const withoutAl = word.substring(2);
      groupSet.add(withoutAl);
      if (CONCEPT_MAPPINGS[withoutAl]) {
        for (const syn of CONCEPT_MAPPINGS[withoutAl]) {
          groupSet.add(normalizeSearchText(syn));
        }
      }
    }

    // Try adding Arabic "ال" prefix if missing
    if (!word.startsWith("ال")) {
      const withAl = "ال" + word;
      groupSet.add(withAl);
      if (CONCEPT_MAPPINGS[withAl]) {
        for (const syn of CONCEPT_MAPPINGS[withAl]) {
          groupSet.add(normalizeSearchText(syn));
        }
      }
    }

    // Handle Arabic plurals ending in "ين" or "ون" or "ات"
    if (word.endsWith("ين") && word.length > 4) {
      const singular = word.substring(0, word.length - 2);
      groupSet.add(singular);
      if (CONCEPT_MAPPINGS[singular]) {
        for (const syn of CONCEPT_MAPPINGS[singular]) groupSet.add(normalizeSearchText(syn));
      }
    } else if (word.endsWith("ون") && word.length > 4) {
      const singular = word.substring(0, word.length - 2);
      groupSet.add(singular);
      if (CONCEPT_MAPPINGS[singular]) {
        for (const syn of CONCEPT_MAPPINGS[singular]) groupSet.add(normalizeSearchText(syn));
      }
    } else if (word.endsWith("ات") && word.length > 4) {
      const singular = word.substring(0, word.length - 2) + "ة";
      groupSet.add(singular);
      if (CONCEPT_MAPPINGS[singular]) {
        for (const syn of CONCEPT_MAPPINGS[singular]) groupSet.add(normalizeSearchText(syn));
      }
    }

    // Handle English plural 's'
    if (word.endsWith("s") && word.length > 3) {
      const singular = word.substring(0, word.length - 1);
      groupSet.add(singular);
      if (CONCEPT_MAPPINGS[singular]) {
        for (const syn of CONCEPT_MAPPINGS[singular]) groupSet.add(normalizeSearchText(syn));
      }
    }

    const filtered = Array.from(groupSet).filter(t => t.length > 1);
    if (filtered.length > 0) {
      groups.push(filtered);
    }
  }

  return groups;
}

/**
 * Builds the searchable text corpus for a buyer
 */
function buildBuyerSearchCorpus(buyer: ProspectBuyer): string {
  return [
    buyer.name,
    buyer.country,
    buyer.city,
    buyer.purchasingManager,
    buyer.procurementRole,
    buyer.email,
    buyer.procurementEmail,
    buyer.realEmail,
    buyer.phone,
    buyer.realPhone,
    buyer.website,
    buyer.importerType,
    buyer.sourcingChannel,
    buyer.incoterms,
    buyer.paymentTerms,
    buyer.destinationPort,
    buyer.annualImportVolume,
    buyer.mrlCompliance,
    buyer.competitiveOpportunity,
    buyer.notes,
    buyer.productsImported,
    ...(buyer.requiredCrops || []),
    ...(buyer.certificationsRequired || []),
    ...(buyer.recentTriggers || []),
    // Inherent B2B entity tags so generic queries like "عميل" or "buyers" always match all valid buyers
    "عميل عملاء زبون مشتري مشترين مستورد مستوردين شركة شركات buyer buyers client clients customer customers importer importers lead leads produce food"
  ].map(f => normalizeSearchText(f)).join(" ");
}

/**
 * High-accuracy multi-field buyer search:
 * - Multi-language (Arabic & English)
 * - Concept-group matching
 * - Graceful fallback to relaxed matching if exact combination has no hits
 * - Strict entity deduplication (by domain & company name)
 * - Precise relevance ranking
 */
export function searchBuyersAdvanced(
  buyers: ProspectBuyer[],
  query: string,
  options?: {
    filterCountry?: string;
    filterCrop?: string;
    filterType?: string;
    filterCert?: string;
    filterChannel?: string;
    filterIncoterm?: string;
  }
): ProspectBuyer[] {
  if (!buyers || buyers.length === 0) return [];

  const conceptGroups = buildQueryConceptGroups(query);
  const hasQuery = conceptGroups.length > 0;
  const rawQueryLower = query.trim().toLowerCase();

  // 1. Strict deduplication of incoming pool (by clean domain and normalized name)
  const seenEntities = new Set<string>();
  const deduplicatedPool: ProspectBuyer[] = [];

  for (const b of buyers) {
    const normName = normalizeSearchText(b.name).replace(/\s+/g, "");
    const cleanDomain = b.website ? b.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0].toLowerCase() : "";
    const key = cleanDomain ? `dom:${cleanDomain}` : `name:${normName}`;

    if (!seenEntities.has(key)) {
      seenEntities.add(key);
      deduplicatedPool.push(b);
    }
  }

  // 2. Base filter against dropdown filters (Country, Crop, Cert, etc.)
  const candidatePool = deduplicatedPool.filter(buyer => {
    if (options?.filterCountry && options.filterCountry !== "All") {
      if (buyer.country.toLowerCase() !== options.filterCountry.toLowerCase()) {
        return false;
      }
    }

    if (options?.filterType && options.filterType !== "All") {
      if (buyer.importerType !== options.filterType) {
        return false;
      }
    }

    if (options?.filterChannel && options.filterChannel !== "All") {
      if (buyer.sourcingChannel !== options.filterChannel) {
        return false;
      }
    }

    if (options?.filterCrop && options.filterCrop !== "All") {
      const cropQuery = options.filterCrop.toLowerCase();
      const hasCrop = (buyer.requiredCrops || []).some(c => c.toLowerCase().includes(cropQuery)) ||
                      (buyer.productsImported || "").toLowerCase().includes(cropQuery);
      if (!hasCrop) return false;
    }

    if (options?.filterCert && options.filterCert !== "All") {
      const certQuery = options.filterCert.toLowerCase();
      const hasCert = (buyer.certificationsRequired || []).some(c => c.toLowerCase().includes(certQuery));
      if (!hasCert) return false;
    }

    if (options?.filterIncoterm && options.filterIncoterm !== "All") {
      const incotermQuery = options.filterIncoterm.toLowerCase();
      if (!buyer.incoterms?.toLowerCase().includes(incotermQuery)) {
        return false;
      }
    }

    return true;
  });

  if (!hasQuery) {
    return candidatePool;
  }

  // Direct email or domain search if raw query has special chars
  if (rawQueryLower.includes("@") || rawQueryLower.includes(".")) {
    const directMatches = candidatePool.filter(buyer => 
      (buyer.email && buyer.email.toLowerCase().includes(rawQueryLower)) ||
      (buyer.procurementEmail && buyer.procurementEmail.toLowerCase().includes(rawQueryLower)) ||
      (buyer.realEmail && buyer.realEmail.toLowerCase().includes(rawQueryLower)) ||
      (buyer.website && buyer.website.toLowerCase().includes(rawQueryLower))
    );
    if (directMatches.length > 0) return directMatches;
  }

  // Primary Pass: Every concept group must be satisfied
  const scoredCandidates: { buyer: ProspectBuyer; score: number; matchCount: number }[] = [];

  for (const buyer of candidatePool) {
    const textCorpus = buildBuyerSearchCorpus(buyer);
    let matchCount = 0;

    for (const group of conceptGroups) {
      const groupMatched = group.some(synonym => textCorpus.includes(synonym));
      if (groupMatched) matchCount++;
    }

    if (matchCount > 0) {
      let score = (buyer.intentSignalScore || 85) + (matchCount * 20);
      const aName = normalizeSearchText(buyer.name);
      const aCountry = normalizeSearchText(buyer.country);
      const firstToken = conceptGroups[0]?.[0] || "";

      if (firstToken && aName.includes(firstToken)) score += 50;
      if (firstToken && aCountry.includes(firstToken)) score += 30;

      scoredCandidates.push({ buyer, score, matchCount });
    }
  }

  // Check if we have candidates where ALL concept groups matched
  const fullMatches = scoredCandidates.filter(c => c.matchCount === conceptGroups.length);

  if (fullMatches.length > 0) {
    fullMatches.sort((a, b) => b.score - a.score);
    return fullMatches.map(c => c.buyer);
  }

  // Fallback: If no candidate matched 100% of concept groups, return partial matches ranked by match count
  scoredCandidates.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.score - a.score;
  });

  return scoredCandidates.map(c => c.buyer);
}

/**
 * Specialized search for LeadRecords in LeadIntelligenceDatabase
 */
export function searchLeadsAdvanced(
  leads: LeadRecord[],
  query: string,
  options?: {
    filterCountry?: string;
    filterQualityGrade?: string;
    filterEmailStatus?: string;
    filterVerificationStatus?: string;
    filterBusinessType?: string;
  }
): LeadRecord[] {
  if (!leads || leads.length === 0) return [];

  const conceptGroups = buildQueryConceptGroups(query);
  const hasQuery = conceptGroups.length > 0;
  const rawQueryLower = query.trim().toLowerCase();

  // Deduplication check
  const seenEntities = new Set<string>();
  const deduplicated: LeadRecord[] = [];

  for (const lead of leads) {
    const key = lead.normalized_domain || lead.normalized_company_name || lead.lead_id;
    if (!seenEntities.has(key)) {
      seenEntities.add(key);
      deduplicated.push(lead);
    }
  }

  // Filter against dropdown criteria
  const candidatePool = deduplicated.filter(lead => {
    if (options?.filterCountry && options.filterCountry !== "All" && lead.country !== options.filterCountry) {
      return false;
    }
    if (options?.filterQualityGrade && options.filterQualityGrade !== "All" && lead.lead_quality_grade !== options.filterQualityGrade) {
      return false;
    }
    if (options?.filterEmailStatus && options.filterEmailStatus !== "All" && lead.email_verification_status !== options.filterEmailStatus) {
      return false;
    }
    if (options?.filterVerificationStatus && options.filterVerificationStatus !== "All" && lead.verification_status !== options.filterVerificationStatus) {
      return false;
    }
    if (options?.filterBusinessType && options.filterBusinessType !== "All" && lead.business_type !== options.filterBusinessType) {
      return false;
    }
    return true;
  });

  if (!hasQuery) return candidatePool;

  // Direct email/domain check
  if (rawQueryLower.includes("@") || rawQueryLower.includes(".")) {
    const directMatches = candidatePool.filter(l =>
      (l.email && l.email.toLowerCase().includes(rawQueryLower)) ||
      (l.official_website && l.official_website.toLowerCase().includes(rawQueryLower)) ||
      (l.normalized_domain && l.normalized_domain.toLowerCase().includes(rawQueryLower))
    );
    if (directMatches.length > 0) return directMatches;
  }

  const scored: { lead: LeadRecord; score: number; matchCount: number }[] = [];

  for (const lead of candidatePool) {
    const textCorpus = [
      lead.company_name,
      lead.country,
      lead.city,
      lead.business_type,
      lead.buyer_type,
      lead.contact_person,
      lead.contact_job_title,
      lead.email,
      lead.phone,
      lead.official_website,
      lead.address,
      lead.lead_id,
      lead.reason_for_buyer_relevance,
      lead.source_evidence,
      lead.notes,
      ...(lead.product_categories || []),
      "عميل عملاء زبون مشتري مشترين مستورد مستوردين شركة شركات buyer buyers client clients customer customers importer importers lead leads"
    ].map(f => normalizeSearchText(f)).join(" ");

    let matchCount = 0;
    for (const group of conceptGroups) {
      if (group.some(synonym => textCorpus.includes(synonym))) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      let score = (lead.lead_quality_score || 80) + (matchCount * 25);
      const firstToken = conceptGroups[0]?.[0] || "";
      if (firstToken && normalizeSearchText(lead.company_name).includes(firstToken)) score += 50;
      if (firstToken && normalizeSearchText(lead.country).includes(firstToken)) score += 30;
      scored.push({ lead, score, matchCount });
    }
  }

  const fullMatches = scored.filter(s => s.matchCount === conceptGroups.length);
  if (fullMatches.length > 0) {
    fullMatches.sort((a, b) => b.score - a.score);
    return fullMatches.map(s => s.lead);
  }

  scored.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.score - a.score;
  });

  return scored.map(s => s.lead);
}
