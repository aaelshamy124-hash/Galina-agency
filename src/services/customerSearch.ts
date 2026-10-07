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

  // Countries & Nationalities (Zero-overlap bilingual precision)
  "ايطاليا": ["italy", "italian", "italia", "ايطالي", "ايطاليه", "ايطاليين", "rome", "milan"],
  "إيطاليا": ["italy", "italian", "italia", "ايطالي", "ايطاليه", "ايطاليين"],
  "ايطالي": ["italy", "italian", "italia", "ايطاليا"],
  "إيطالي": ["italy", "italian", "italia", "ايطاليا"],
  "ايطاليه": ["italy", "italian", "italia", "ايطاليا"],
  "إيطالية": ["italy", "italian", "italia", "ايطاليا"],
  "ايطاليين": ["italy", "italian", "italia", "ايطاليا"],
  "italy": ["ايطاليا", "إيطاليا", "ايطالي", "italian", "italia"],
  "italian": ["ايطاليا", "إيطاليا", "ايطالي", "italy"],
  "italia": ["ايطاليا", "إيطاليا", "ايطالي", "italy"],

  "المانيا": ["germany", "deutschland", "german", "الماني", "المانيه", "المانيين", "hamburg", "berlin"],
  "ألمانيا": ["germany", "deutschland", "german", "ألماني", "المانيه"],
  "الماني": ["germany", "german", "deutschland", "المانيا"],
  "ألماني": ["germany", "german", "deutschland", "المانيا"],
  "المانيه": ["germany", "german", "المانيا"],
  "ألمانية": ["germany", "german", "المانيا"],
  "germany": ["المانيا", "ألمانيا", "الماني", "german"],
  "deutschland": ["المانيا", "ألمانيا", "الماني"],
  "german": ["المانيا", "ألمانيا", "الماني", "germany"],

  "سعوديه": ["saudi", "arabia", "ksa", "سعودي", "السعودية", "riyadh", "jeddah"],
  "السعوديه": ["saudi", "arabia", "ksa", "سعودي", "riyadh", "jeddah"],
  "سعودية": ["saudi", "arabia", "ksa", "سعودي", "riyadh", "jeddah"],
  "السعودية": ["saudi", "arabia", "ksa", "سعودي", "riyadh", "jeddah"],
  "سعودي": ["saudi", "arabia", "ksa", "السعودية"],
  "السعودي": ["saudi", "arabia", "ksa", "السعودية"],
  "saudi": ["السعودية", "سعودية", "سعودي"],
  "ksa": ["السعودية", "سعودية", "سعودي"],

  "امارات": ["uae", "emirates", "dubai", "abu dhabi", "اماراتي", "sharjah"],
  "الامارات": ["uae", "emirates", "dubai", "abu dhabi", "اماراتي"],
  "الإمارات": ["uae", "emirates", "dubai", "abu dhabi", "إماراتي"],
  "اماراتي": ["uae", "emirates", "الامارات"],
  "إماراتي": ["uae", "emirates", "الامارات"],
  "دبي": ["dubai", "uae", "الامارات"],
  "ابوظبي": ["abu dhabi", "uae", "الامارات"],
  "أبوظبي": ["abu dhabi", "uae", "الامارات"],
  "uae": ["الإمارات", "الامارات", "اماراتي"],
  "emirates": ["الإمارات", "الامارات"],

  "بريطانيا": ["uk", "united kingdom", "britain", "بريطاني", "انجلترا", "london"],
  "بريطاني": ["uk", "united kingdom", "britain", "بريطانيا"],
  "بريطانيه": ["uk", "united kingdom", "britain", "بريطانيا"],
  "بريطانية": ["uk", "united kingdom", "britain", "بريطانيا"],
  "المملكة المتحدة": ["uk", "united kingdom", "britain", "بريطانيا"],
  "المملكه المتحده": ["uk", "united kingdom", "britain", "بريطانيا"],
  "انجلترا": ["england", "uk", "britain", "london"],
  "انجليزي": ["uk", "england", "british"],
  "uk": ["بريطانيا", "المملكة المتحدة", "المملكه المتحده", "انجلترا"],
  "britain": ["بريطانيا", "المملكة المتحدة"],
  "british": ["بريطاني", "بريطانيا"],

  "امريكا": ["usa", "united states", "america", "امريكي"],
  "أمريكا": ["usa", "united states", "america", "أمريكي"],
  "امريكي": ["usa", "united states", "america", "امريكا"],
  "أمريكي": ["usa", "united states", "america", "أمريكا"],
  "الولايات المتحدة": ["usa", "united states", "america", "امريكا"],
  "الولايات المتحده": ["usa", "united states", "america", "امريكا"],
  "usa": ["أمريكا", "امريكا", "امريكي", "الولايات المتحدة", "الولايات المتحده"],
  "america": ["أمريكا", "امريكا", "امريكي"],
  "american": ["امريكي", "أمريكي", "امريكا"],

  "فرنسا": ["france", "french", "فرنسي", "فرنسيه", "paris"],
  "فرنسي": ["france", "french", "فرنسا"],
  "فرنسيه": ["france", "french", "فرنسا"],
  "فرنسية": ["france", "french", "فرنسا"],
  "france": ["فرنسا", "فرنسي"],
  "french": ["فرنسا", "فرنسي"],

  "اسبانيا": ["spain", "spanish", "espana", "اسباني", "اسبانيه", "madrid", "barcelona"],
  "إسبانيا": ["spain", "spanish", "espana", "إسباني", "إسبانيه", "madrid", "barcelona"],
  "اسباني": ["spain", "spanish", "espana", "اسبانيا"],
  "إسباني": ["spain", "spanish", "espana", "إسبانيا"],
  "اسبانيه": ["spain", "spanish", "اسبانيا"],
  "إسبانية": ["spain", "spanish", "إسبانيا"],
  "spain": ["إسبانيا", "اسبانيا", "اسباني"],
  "spanish": ["إسبانيا", "اسبانيا", "اسباني"],

  "بولندا": ["poland", "polish", "polska", "بولندي", "warsaw"],
  "بولندي": ["poland", "polish", "بولندا"],
  "بولنديه": ["poland", "polish", "بولندا"],
  "بولندية": ["poland", "polish", "بولندا"],
  "poland": ["بولندا", "بولندي"],
  "polish": ["بولندا", "بولندي"],

  "هولندا": ["netherlands", "dutch", "holland", "هولندي", "rotterdam", "amsterdam"],
  "الهولندا": ["netherlands", "dutch", "holland", "هولندي", "rotterdam"],
  "هولندي": ["netherlands", "dutch", "holland", "هولندا"],
  "هولنديه": ["netherlands", "dutch", "هولندا"],
  "هولندية": ["netherlands", "dutch", "هولندا"],
  "netherlands": ["هولندا", "هولندي"],
  "dutch": ["هولندا", "هولندي"],
  "holland": ["هولندا", "هولندي"],

  "بلجيكا": ["belgium", "belgian", "بلجيكي", "antwerp", "brussels"],
  "البلجيكا": ["belgium", "belgian", "بلجيكي", "antwerp"],
  "بلجيكي": ["belgium", "belgian", "بلجيكا"],
  "بلجيكيه": ["belgium", "belgian", "بلجيكا"],
  "بلجيكية": ["belgium", "belgian", "بلجيكا"],
  "belgium": ["بلجيكا", "بلجيكي"],
  "belgian": ["بلجيكا", "بلجيكي"],

  "كندا": ["canada", "canadian", "كندي", "toronto", "montreal"],
  "كندي": ["canada", "canadian", "كندا"],
  "كنديه": ["canada", "canadian", "كندا"],
  "كندية": ["canada", "canadian", "كندا"],
  "canada": ["كندا", "كندي"],
  "canadian": ["كندا", "كندي"],

  "يابان": ["japan", "japanese", "ياباني", "tokyo"],
  "اليابان": ["japan", "japanese", "ياباني", "tokyo"],
  "ياباني": ["japan", "japanese", "اليابان", "يابان"],
  "يابانيه": ["japan", "japanese", "اليابان"],
  "يابانية": ["japan", "japanese", "اليابان"],
  "japan": ["اليابان", "يابان", "ياباني"],
  "japanese": ["اليابان", "يابان", "ياباني"],

  "كوريا": ["korea", "south korea", "korean", "كوري", "seoul"],
  "كوريا الجنوبية": ["korea", "south korea", "korean", "كوري", "seoul"],
  "كوريا الجنوبيه": ["korea", "south korea", "korean", "كوري", "seoul"],
  "كوري": ["korea", "south korea", "korean", "كوريا"],
  "كوريه": ["korea", "south korea", "korean", "كوريا"],
  "كورية": ["korea", "south korea", "korean", "كوريا"],
  "korea": ["كوريا", "كوري"],
  "south korea": ["كوريا", "كوريا الجنوبية", "كوري"],
  "korean": ["كوريا", "كوري"],

  "برازيل": ["brazil", "brazilian", "brasil", "برازيلي", "sao paulo"],
  "البرازيل": ["brazil", "brazilian", "brasil", "برازيلي"],
  "برازيلي": ["brazil", "brazilian", "brasil", "البرازيل", "برازيل"],
  "برازيليه": ["brazil", "brazilian", "brasil", "البرازيل"],
  "برازيلية": ["brazil", "brazilian", "brasil", "البرازيل"],
  "brazil": ["البرازيل", "برازيل", "برازيلي"],
  "brasil": ["البرازيل", "برازيل", "برازيلي"],
  "brazilian": ["البرازيل", "برازيل", "برازيلي"],

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
 * Normalizes any Arabic, English, or regional country variation into canonical country name
 */
export function normalizeCountryName(input: string | null | undefined): string {
  if (!input) return "";
  const norm = normalizeSearchText(input);

  // Check UK first to avoid collision with "المملكه"
  if (norm.includes("المملكه المتحده") || norm.includes("بريطان") || norm.includes("انجلتر") || norm.includes("united kingdom") || norm.includes("britain") || /\buk\b/.test(norm)) return "UK";
  if (norm.includes("الولايات المتحده") || norm.includes("امريك") || norm.includes("united states") || /\busa\b/.test(norm) || /\bamerica\b/.test(norm)) return "USA";
  if (norm.includes("المملكه العربيه السعوديه") || norm.includes("سعود") || norm.includes("saudi") || /\bksa\b/.test(norm)) return "Saudi Arabia";
  if (norm.includes("امارات") || norm.includes("الامارات") || norm.includes("دبي") || norm.includes("ابوظبي") || norm.includes("الشارقه") || norm.includes("emirates") || norm.includes("dubai") || norm.includes("abu dhabi") || /\buae\b/.test(norm)) return "UAE";
  if (norm.includes("ايطال") || norm.includes("ital")) return "Italy";
  if (norm.includes("المان") || norm.includes("german") || norm.includes("deutsch")) return "Germany";
  if (norm.includes("فرنس") || norm.includes("franc")) return "France";
  if (norm.includes("اسبان") || norm.includes("spain") || norm.includes("espan")) return "Spain";
  if (norm.includes("بولند") || norm.includes("poland") || norm.includes("polsk")) return "Poland";
  if (norm.includes("هولند") || norm.includes("netherland") || norm.includes("holland") || norm.includes("dutch")) return "Netherlands";
  if (norm.includes("بلجيك") || norm.includes("belgi")) return "Belgium";
  if (norm.includes("كند") || norm.includes("canad")) return "Canada";
  if (norm.includes("يابان") || norm.includes("japan")) return "Japan";
  if (norm.includes("كوري") || norm.includes("korea")) return "South Korea";
  if (norm.includes("برازيل") || norm.includes("brazil") || norm.includes("brasil")) return "Brazil";

  return input.trim();
}

/**
 * Detects if a search query contains a specific country reference in Arabic or English
 */
export function detectCountryInQuery(query: string): string | null {
  if (!query) return null;
  const canonical = normalizeCountryName(query);
  const knownCountries = [
    "Italy", "Germany", "Saudi Arabia", "UAE", "France", "UK", 
    "Spain", "Poland", "Netherlands", "Belgium", "USA", "Canada", 
    "Japan", "South Korea", "Brazil"
  ];
  if (knownCountries.includes(canonical)) return canonical;
  return null;
}

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

const COUNTRY_SEARCH_KEYWORDS: Record<string, string> = {
  "Italy": "ايطاليا إيطاليا ايطالي إيطالي ايطالية إيطالية italia italian italy rome milan cesena rimini verona",
  "Germany": "المانيا ألمانيا الماني ألماني المانية ألمانية deutschland german germany hamburg berlin koln cologne dusseldorf",
  "Saudi Arabia": "السعودية سعودية سعودي السعودية المملكة العربية السعودية المملكه العربيه السعوديه ksa saudi riyadh jeddah dammam",
  "UAE": "الامارات الإمارات اماراتي إماراتي اماراتية دبي ابوظبي أبوظبي الشارقة uae emirates dubai abu dhabi sharjah",
  "UK": "المملكة المتحدة المملكه المتحده بريطانيا بريطاني بريطانية انجلترا انجليزي لندن uk united kingdom britain england london",
  "USA": "الولايات المتحدة الولايات المتحده امريكا أمريكا امريكي أمريكي امريكية united states america usa us",
  "France": "فرنسا فرنسي فرنسية france french paris rungis marseille",
  "Spain": "اسبانيا إسبانيا اسباني إسباني اسبانية spain spanish espana madrid barcelona valencia",
  "Poland": "بولندا بولندي بولندية poland polish polska warsaw gdansk",
  "Netherlands": "هولندا هولندي هولندية netherlands dutch holland rotterdam amsterdam",
  "Belgium": "بلجيكا بلجيكي بلجيكية belgium belgian brussels antwerp",
  "Canada": "كندا كندي كندية canada canadian toronto montreal vancouver",
  "Japan": "اليابان يابان ياباني يابانية japan japanese tokyo kobe osaka",
  "South Korea": "كوريا كوري كورية كوريا الجنوبية كوريا الجنوبيه korea south korea seoul incheon busan",
  "Brazil": "البرازيل برازيل برازيلي برازيلية brasil brazil brazilian sao paulo"
};

/**
 * Builds the searchable text corpus for a buyer
 */
function buildBuyerSearchCorpus(buyer: ProspectBuyer): string {
  const cKey = normalizeCountryName(buyer.country);
  const countryKeywords = COUNTRY_SEARCH_KEYWORDS[cKey] || "";

  return [
    buyer.name,
    buyer.country,
    cKey,
    countryKeywords,
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

  const detectedCountry = detectCountryInQuery(query);
  const effectiveCountryFilter = (options?.filterCountry && options.filterCountry !== "All")
    ? options.filterCountry
    : detectedCountry;

  // 2. Base filter against dropdown filters (Country, Crop, Cert, etc.)
  const candidatePool = deduplicatedPool.filter(buyer => {
    if (effectiveCountryFilter) {
      const targetCountry = normalizeCountryName(effectiveCountryFilter).toLowerCase();
      const buyerCountry = normalizeCountryName(buyer.country).toLowerCase();
      if (buyerCountry !== targetCountry) {
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

  const detectedCountry = detectCountryInQuery(query);
  const effectiveCountryFilter = (options?.filterCountry && options.filterCountry !== "All")
    ? options.filterCountry
    : detectedCountry;

  // Filter against dropdown criteria
  const candidatePool = deduplicated.filter(lead => {
    if (effectiveCountryFilter) {
      const targetCountry = normalizeCountryName(effectiveCountryFilter).toLowerCase();
      const leadCountry = normalizeCountryName(lead.country).toLowerCase();
      if (leadCountry !== targetCountry) {
        return false;
      }
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
    const cKey = normalizeCountryName(lead.country);
    const countryKeywords = COUNTRY_SEARCH_KEYWORDS[cKey] || "";

    const textCorpus = [
      lead.company_name,
      lead.country,
      cKey,
      countryKeywords,
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
