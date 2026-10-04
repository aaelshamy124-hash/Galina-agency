import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Header & Brand
    brandTitle: "GALINA EXPORT ADVISOR AI",
    brandSubtitle: "Verified Global Intel",
    brandTagline: "Rapid B2B Produce Intelligence & Authentic Client Verification",
    simulationRole: "Role Simulation:",
    roleExportDirector: "Export Director",
    roleSalesAgent: "Sales Agent",
    roleCEO: "CEO / General Management",
    systemDesigner: "System Designer",
    systemDesignerName: "ENG AHMED ADEL ELSHAMY",
    sourcingNode: "Alexandria Sourcing Node",
    copyright: "© 2026 Galina Group. All rights reserved.",
    portalNav: "Enterprise Portal",
    navPortal: "Navigation Portal",

    // Tabs
    tabDashboard: "Control Center",
    tabProducts: "IQF Catalog",
    tabCountries: "Global Markets",
    tabFinder: "AI Market Finder",
    tabLeadDatabase: "Lead Intelligence Database",
    tabCRM: "CRM Pipeline",
    tabSuppliers: "Sourcing Co-Ops",
    tabCompetitors: "Competitors & Fairs",
    tabAdvisor: "Galina Export Advisor AI",
    tabPitch: "B2B Pitcher & Translate",
    tabReports: "Technical Reports",

    // Dashboard
    dashboardTitle: "Export Control Center",
    dashboardSubtitle: "Real-time B2B intelligence, pipeline flow, and target markets for Galina IQF.",
    cloudServiceActive: "Galina Cloud Service: Active (Alexandria Node)",
    seasonalityAlertTitle: "Surge in European IQF Strawberry Demand Detected",
    seasonalityAlertDesc: "Poor harvest seasons across Poland & Southern Spain have caused an estimated 28% drop in IQF strawberry supply. European distributors in Germany, France, and the UK are actively looking for direct Egyptian contracts.",
    takeAction: "Explore German Importers",
    totalActiveLeads: "Active Qualified Leads",
    totalActiveLeadsSub: "Produce & Frozen buyers in CRM",
    successfulContracts: "Won Contracts",
    successfulContractsSub: "Signed export container deals",
    activeMarkets: "Target Export Markets",
    activeMarketsSub: "Global destinations analyzed",
    annualExportTonnage: "Annual Export Capacity",
    annualExportTonnageSub: "High-grade IQF fruits & veggies",
    pipelineDistribution: "B2B CRM Pipeline Breakdown",
    marketAttractiveness: "Target Market Readiness Rating",
    globalTradingHubs: "Galina Strategic Shipping Nodes & Sea Corridors",
    recentActivity: "Recent Commercial Activities & Sourcing Signals",

    // Market Finder
    finderTitle: "Export Market Intelligence & Lead Generator",
    finderSubtitle: "Explore destination markets, analyze trade barriers & logistics, and generate 50 qualified B2B produce importers with global certifications (BRCGS / IFS / GLOBALG.A.P.).",
    finderBadge: "Certified Fruit & Veg Export",
    step1Crop: "1. Select Agricultural Crop (IQF)",
    step2Country: "2. Target Destination Country",
    generateFastBtn: "Generate 50 Verified Buyers (Instant Directory)",
    generateAiBtn: "Deep AI Market Analysis (Gemini 3.8)",
    generatingWait: "Analyzing international trade data...",
    searchPlaceholder: "Search by company, city, crop, certificate...",
    allTypes: "All Importer Types",
    allSizes: "All Company Scales",
    allTriggers: "All Sourcing Intent Signals",
    allCrops: "All Required Crops",
    allCerts: "All Quality Certifications",
    allChannels: "All Sourcing Channels",
    allIncoterms: "All Incoterms",
    sortIntent: "⚡ Sort: Highest Agro Intent",
    sortScore: "⭐ Sort: Highest AI Match Score",
    sortSize: "🏢 Sort: Company Size & Workforce",

    // Batch Bar & Export
    selectedLeadsNotice: "companies selected for bulk actions.",
    selectNoneNotice: "Select checkboxes to execute bulk CRM import or export verified leads.",
    importSelected: "Import Selected",
    importAll50: "Import all 50 to CRM",
    exportCSV: "Export Excel (CSV)",
    exportPDF: "Export PDF Report",

    // Table Headers
    colCompany: "Importer & Commercial Entity",
    colCity: "City & Destination",
    colContact: "Procurement Lead & Verified Contact",
    colCrops: "Required Crops",
    colVolume: "Container Volume & Logistics",
    colScore: "Match Index",
    colActions: "Actions",
    noMatchingLeads: "No companies found matching current search or filter criteria.",
    verifiedBadge: "Verified",
    agroIntentBadge: "Agro Intent",
    fullDossier: "Full Dossier",
    moreDetails: "More",
    collapseDetails: "Collapse",
    importToCRM: "Import",
    alreadyImported: "CRM ✔ Imported",

    // Expanded Accordion
    sourcingSignalsTitle: "⚡ Agro Sourcing Intent Signals & Required Certifications:",
    intentDegree: "Sourcing Intent Degree:",
    officialContactsTitle: "Official Verified Corporate Contacts",
    verifiedOfficialBadge: "✔ Verified",
    purchasingManager: "Procurement Manager:",
    procurementEmail: "Procurement Email:",
    corporateEmail: "General Corporate Email:",
    phoneWhatsApp: "Phone & WhatsApp:",
    headquarters: "Headquarters Address:",
    officialWebsite: "Official Website:",
    commercialShippingTitle: "Commercial & Logistics Terms",
    incotermLabel: "Incoterms:",
    paymentTermsLabel: "Payment Terms:",
    destinationPortLabel: "Port of Discharge:",
    containerVolumeLabel: "Container Volume:",
    contractOppTitle: "Contract Opportunity & Pitch Tactic",
    viewFullDossierBtn: "View Full B2B Export Dossier",

    // Modal Dossier
    dossierTitle: "B2B Export Intelligence Dossier",
    dossierSection1: "1. Direct Procurement & Contact Information",
    dossierSection1Badge: "100% Verified Corporate Contact Profile",
    dossierSection2: "2. Agricultural Crop Specifications & International Certifications",
    dossierSection3: "3. Logistics & Reefer Shipping Terms (Incoterms)",
    dossierSection4: "4. Strategic Competitive Advantage & Recommended Outreach",
    intentSignalScore: "Agro Sourcing Intent",
    galinaMatchScore: "Galina AI Fit Score",
    employeeCount: "Total Workforce",
    importFromEgyptStatus: "Imports from Egypt",
    currentlyImports: "✔ Active Egyptian Importer",
    newTargetBuyer: "New Target Account",
    mrlCompliance: "Pesticide Residue Limits (MRL):",
    samplePolicy: "Technical Sample Request Policy:",
    importToCRMFooter: "Import Lead to Galina CRM",
    copyDossierFooter: "Copy Complete Dossier",
    closeModal: "Close",
    finderLoadingTitle: "Running Agricultural Export Intelligence Engine...",
    finderLoadingDesc: "Matching quality certifications (BRCGS AA, IFS Food, GLOBALG.A.P), EU MRL limits, reefer ports, and generating 50 verified target buyers.",
    finderError: "Export Engine Processing Error",
    marketFitIndex: "Export Market Fit Index",
    calculatedFitIndex: "Calculated B2B Export Fit Index",
    exportOpp: "Export Opportunity",
    oppExceptional: "⭐ Exceptional High-Margin Export Opportunity",
    oppPromising: "Promising & Stable Export Opportunity",
    scorecardTitle: "Export Logistics & Market Feasibility Scorecard",
    scorecardSubtitle: "Granular Export Logistics & Market Friction Scorecard",
    entryEase: "Entry Ease",
    competitionStrength: "Competitive Edge",
    demandIndex: "Demand Volume",
    marginPotential: "Profit Margin",
    shippingFeasibility: "Shipping & Ports",
    marketAnalysisTitle: "Target Market Assessment Report:",
    qualifiedBuyersDirectory: "Qualified Buyers & Importers Directory",
    ofTotalVerified: "of",
    verifiedCompaniesSuffix: "verified companies",
    searchBuyersPlaceholder: "Search by company, city, crop, procurement manager, certifications...",
    viewFullDossier: "Full Dossier",
    closeDossier: "Close Window",
    copyDossierSummary: "Copy Complete Dossier",
    dossierCopied: "Dossier Copied!",
    copied: "Copied!",
    copy: "Copy",
    startOutreachCRM: "Import to CRM & Start Outreach",
    showingRows: "Showing",
    toWord: "to",
    ofWord: "of",
    qualifiedBuyersWord: "qualified buyers.",
    whatsappDirect: "Direct WhatsApp",
    procurementDesk: "Procurement Desk",
    primaryContact: "Primary",
    annualReefers: "Reefers/Year",
    reeferSpecsLabel: "Reefer Container Specifications:",
    strategicRationale: "Strategic Opportunity Rationale for Galina:",
    recommendedStrategy: "Recommended Outreach & Initial Offer Tactic:",
    cropSpecsTitle: "2. Agricultural Crop Specifications & Certifications",
    exactCropsRequired: "Exact Required Crops:",
    mandatoryCertifications: "Mandatory Quality Certifications:",
    logisticsTermsTitle: "3. Commercial Reefer Logistics & Incoterms",
    containerVolumeTitle: "Annual Container Volume",
    incotermsTitle: "Incoterms",
    paymentTermsTitle: "Payment Terms",
    destinationPortTitle: "Port of Discharge",
    opportunityTitle: "4. Strategic Fit & Recommended Outreach",

    // CRM Pipeline
    crmTitle: "Galina B2B CRM Pipeline",
    crmSubtitle: "Manage active negotiations, sample dispatches, and container shipping contracts.",
    filterAllStatus: "All Pipeline Stages",
    statusNewLead: "New Lead",
    statusContacted: "Contacted",
    statusNegotiation: "Negotiation",
    statusQuotation: "Quotation",
    statusSampleSent: "Sample Sent",
    statusWon: "Contract Won",
    statusLost: "Lost Deal",
    verifiedContactBadge: "✔ Official Verified Contact",
    draftColdEmailBtn: "Draft Cold Proposal",
    saveNotes: "Save Notes",
    editNotes: "Edit Notes",

    // Products Catalog
    productsTitle: "IQF Agricultural Crop Catalog",
    productsSubtitle: "Premium frozen fruits and vegetables harvested and processed in Egypt.",
    addNewCropBtn: "Add New Crop",
    specsHarvestSeason: "Harvest Season",
    specsShelfLife: "Shelf Life",
    specsFreezingTech: "Freezing Technology",
    specsCertifications: "Certifications",
    specsPackaging: "Packaging Options",
    specsTargetMarkets: "Top Destination Markets",

    // Global Markets (Countries)
    countriesTitle: "Global Destination Markets",
    countriesSubtitle: "Regulatory compliance, tariff advantages, and container transit times from Alexandria Port.",
    portOfDischarge: "Major Ports",
    customTariff: "Tariff Rate",
    transitTime: "Transit Time (Alexandria)",
    requiredCerts: "Required Certifications",
    marketPotential: "Market Potential",

    // Suppliers (Co-Ops)
    suppliersTitle: "Agricultural Sourcing Co-Ops & Packaging",
    suppliersSubtitle: "Certified partner farms in Egypt, cold-storage logistics, and industrial packaging providers.",
    addNewSupplierBtn: "Register New Partner",
    supplierTypeFarm: "Certified Farm",
    supplierTypeLogistics: "Cold Chain Logistics",
    supplierTypePackaging: "Industrial Packaging",

    // Competitors & Exhibitions
    competitorsTitle: "Competitors Tracking & International Trade Fairs",
    competitorsSubtitle: "Global competitor benchmarking (Poland, Spain, Turkey) and upcoming food trade expos (Gulfood, Anuga, SIAL).",
    upcomingExhibitions: "Upcoming International Trade Exhibitions",
    topCompetitors: "Key International Produce Competitors",

    // AI Advisor
    advisorTitle: "Smart Agro-Export AI Advisor",
    advisorSubtitle: "Real-time consultative intelligence on global tariffs, buyer negotiation strategies, and MRL compliance.",
    sendQuestionPlaceholder: "Ask about container pricing, destination port clearance, or negotiation tactics...",
    clearChat: "Clear History",

    // Email Pitcher & Translator
    pitcherTitle: "B2B Email Generator & Multi-Language Translator",
    pitcherSubtitle: "Draft customized cold export pitches in English, German, French, Spanish, or Italian tailored to the selected importer.",
    generateDraftBtn: "Generate AI Pitch",
    translateBtn: "Translate to Buyer Language",
    copyEmailBtn: "Copy Proposal",
    logSentEmailBtn: "Log as Sent to CRM",
    targetLanguage: "Target Language:",

    // Reports
    reportsTitle: "Comprehensive Technical & Commercial Reports",
    reportsSubtitle: "Executive intelligence reports for board meetings, bank presentations, and international audits.",
    printReportBtn: "Print Formal Report"
  },

  ar: {
    // Header & Brand
    brandTitle: "جالينا جلوبال",
    brandSubtitle: "الذكاء التصديري",
    brandTagline: "منصة تجارة وتصدير الخضار والفواكه المصرية المجمدة والطازجة",
    simulationRole: "محاكاة الدور الوظيفي:",
    roleExportDirector: "مدير التصدير الدولي",
    roleSalesAgent: "وكيل ومسؤول مبيعات",
    roleCEO: "الرئيس التنفيذي / الإدارة العليا",
    systemDesigner: "مهندس ومصمم المنصة",
    systemDesignerName: "م. أحمد عادل الشامي",
    sourcingNode: "عقدة التوريد بالإسكندرية",
    copyright: "© 2026 مجموعة جالينا الزراعية. جميع الحقوق محفوظة.",
    portalNav: "بوابة المؤسسة",
    navPortal: "قائمة التنقل السريع",

    // Tabs
    tabDashboard: "لوحة التحكم الرئيسية",
    tabProducts: "كتالوج المحاصيل (IQF)",
    tabCountries: "الأسواق والوجهات العالمية",
    tabFinder: "مستكشف الأسواق والعملاء",
    tabLeadDatabase: "قاعدة بيانات العملاء والتحقق",
    tabCRM: "إدارة علاقات العملاء (CRM)",
    tabSuppliers: "المزارع والتوريد المحلي",
    tabCompetitors: "المنافسون والمعارض الدولية",
    tabAdvisor: "المستشار الذكي (AI)",
    tabPitch: "صياغة وترجمة عروض B2B",
    tabReports: "التقارير الفنية والتصديرية",

    // Dashboard
    dashboardTitle: "مركز التحكم والعمليات التصديرية",
    dashboardSubtitle: "استخبارات تجارية مباشرة، تدفق العملاء المستهدفين، ومؤشرات الطلب على محاصيل جالينا.",
    cloudServiceActive: "خدمة جالينا السحابية: متصلة ونشطة (عقدة الإسكندرية)",
    seasonalityAlertTitle: "تنبيه ذكي: ارتفاع حاد في الطلب الأوروبي على الفراولة المجمدة",
    seasonalityAlertDesc: "تراجع حاد في مواسم الحصاد في بولندا وجنوب إسبانيا بنسبة 28%. كبرى سلاسل التوزيع في ألمانيا وفرنسا وبريطانيا تبحث عن تعاقدات سنوية مباشرة مع الموردين المصريين.",
    takeAction: "استعراض مستوردي ألمانيا",
    totalActiveLeads: "إجمالي العملاء المؤهلين",
    totalActiveLeadsSub: "مستورد أغذية في قاعدة البيانات",
    successfulContracts: "عقود تم إبرامها بنجاح",
    successfulContractsSub: "شحنات وحاويات مبردة متعاقد عليها",
    activeMarkets: "الأسواق المستهدفة",
    activeMarketsSub: "وجهة دولية تحت التحليل",
    annualExportTonnage: "الطاقة التصديرية السنوية",
    annualExportTonnageSub: "محاصيل مجمدة فائقة الجودة",
    pipelineDistribution: "توزيع العملاء في مسار الصفقات (CRM)",
    marketAttractiveness: "تصنيف جاهزية وجاذبية الأسواق الدولية",
    globalTradingHubs: "موانئ الشحن والمسارات البحرية الاستراتيجية لشركة جالينا",
    recentActivity: "أحدث الأنشطة التجارية وإشارات نية الاستيراد",

    // Market Finder
    finderTitle: "منصة استكشاف الأسواق وتوليد العملاء المعتمدين",
    finderSubtitle: "استكشاف الأسواق الدولية المستهدفة، تحليل شروط الدخول واللوجستيات، وتوليد 50 مشترياً ومستورداً معتمداً بشهادات الجودة الدولية (BRCGS / IFS / GLOBALG.A.P).",
    finderBadge: "خضار وفواكه معتمدة للتصدير",
    step1Crop: "1. اختر المحصول الزراعي (IQF Crop)",
    step2Country: "2. دولة التصدير والوجهة المستهدفة",
    generateFastBtn: "توليد 50 مشترياً معتمداً (قاعدة بيانات فورية)",
    generateAiBtn: "تحليل ذكاء اصطناعي عميق (Gemini 3.8)",
    generatingWait: "جاري تحليل بيانات التجارة الدولية...",
    searchPlaceholder: "البحث بالاسم والمدينة والمحصول والشهادات...",
    allTypes: "جميع أنواع المستوردين",
    allSizes: "جميع أحجام الشركات",
    allTriggers: "جميع إشارات الطلب الزراعي",
    allCrops: "جميع المحاصيل المطلوبة",
    allCerts: "جميع شهادات الجودة",
    allChannels: "جميع قنوات التوريد",
    allIncoterms: "جميع شروط الشحن (Incoterms)",
    sortIntent: "⚡ ترتيب: أعلى نية شراء زراعي",
    sortScore: "⭐ ترتيب: أعلى مؤشر تطابق AI",
    sortSize: "🏢 ترتيب: حجم الشركة والموظفين",

    // Batch Bar & Export
    selectedLeadsNotice: "شركة تم تحديدها لتنفيذ الإجراءات الجماعية.",
    selectNoneNotice: "حدد المربعات الجانبية لتنفيذ استيراد جماعي إلى الـ CRM أو تصدير النتائج.",
    importSelected: "استيراد المحدد",
    importAll50: "استيراد الـ 50 شركة للـ CRM",
    exportCSV: "تصدير Excel (CSV)",
    exportPDF: "تصدير PDF",

    // Table Headers
    colCompany: "اسم المستورد والكيان التجاري",
    colCity: "المدينة والوجهة",
    colContact: "مسؤول المشتريات والتواصل المعتمد",
    colCrops: "المحاصيل المطلوبة",
    colVolume: "حجم الحاويات والشحن",
    colScore: "مؤشر الجودة",
    colActions: "الإجراءات",
    noMatchingLeads: "لا توجد شركات مطابقة لمعايير البحث أو التصفية الحالية.",
    verifiedBadge: "معتمد",
    agroIntentBadge: "طلب زراعي",
    fullDossier: "الملف الكامل",
    moreDetails: "المزيد",
    collapseDetails: "طي",
    importToCRM: "استيراد",
    alreadyImported: "CRM ✔ تم الاستيراد",

    // Expanded Accordion
    sourcingSignalsTitle: "⚡ مؤشرات الطلب الزراعي والشهادات المطلوبة:",
    intentDegree: "درجة نية الاستيراد:",
    officialContactsTitle: "بيانات التواصل الرسمية المعتمدة",
    verifiedOfficialBadge: "✔ موثق",
    purchasingManager: "مسؤول المشتريات:",
    procurementEmail: "إيميل المشتريات والتوريد:",
    corporateEmail: "إيميل الشركة العام:",
    phoneWhatsApp: "الهاتف والواتساب:",
    headquarters: "المقر الرئيسي الرسمي:",
    officialWebsite: "الموقع الرسمي:",
    commercialShippingTitle: "الشروط التجارية واللوجستية",
    incotermLabel: "شرط الشحن (Incoterms):",
    paymentTermsLabel: "شروط الدفع:",
    destinationPortLabel: "ميناء الوصول المعتمد:",
    containerVolumeLabel: "حجم الحاويات السنوي:",
    contractOppTitle: "فرصة التعاقد وتكتيك العرض المقترح",
    viewFullDossierBtn: "عرض الملف التصديري الفني الكامل",

    // Modal Dossier
    dossierTitle: "الملف الاستخباراتي التصديري الشامل (B2B Dossier)",
    dossierSection1: "1. بيانات الاتصال ومسؤول المشتريات المباشر",
    dossierSection1Badge: "بيانات اتصال معتمدة ورسمية للشركة 100%",
    dossierSection2: "2. متطلبات المحاصيل الزراعية والاعتمادات الدولية",
    dossierSection3: "3. الشروط التجارية والشحن المبرد (Logistics & Incoterms)",
    dossierSection4: "4. تحليل الفرصة التنافسية وتكتيك التواصل المقترح",
    intentSignalScore: "درجة نية الطلب الزراعي",
    galinaMatchScore: "مؤشر ملاءمة جالينا (AI)",
    employeeCount: "حجم الموظفين",
    importFromEgyptStatus: "الاستيراد من مصر",
    currentlyImports: "✔ يستورد حالياً من مصر",
    newTargetBuyer: "مستورد مستهدف جديد",
    mrlCompliance: "معايير متبقيات المبيدات (MRL):",
    samplePolicy: "سياسة طلب العينات الفنية:",
    importToCRMFooter: "استيراد العميل لمنظومة الـ CRM",
    copyDossierFooter: "نسخ الملف التعريفي الكامل",
    closeModal: "إغلاق",
    finderLoadingTitle: "جاري تشغيل محرك الذكاء التصديري الزراعي",
    finderLoadingDesc: "مطابقة شهادات الجودة (BRCGS AA, IFS Food, GLOBALG.A.P)، حدود متبقيات المبيدات MRL، موانئ الشحن المبردة، وتوليد 50 مشترياً ومستورداً مستهدفاً بدقة.",
    finderError: "خطأ في نظام المعالجة",
    marketFitIndex: "مؤشر ملاءمة السوق التصديري",
    calculatedFitIndex: "مؤشر ملاءمة التصدير المحسوب",
    exportOpp: "فرصة تصدير",
    oppExceptional: "⭐ فرصة تصدير استثنائية عالية الربحية",
    oppPromising: "فرصة تصدير واعدة ومستقرة",
    scorecardTitle: "محددات الجدوى التصديرية واللوجستية",
    scorecardSubtitle: "محددات الجدوى التصديرية واللوجستية التنافسية",
    entryEase: "سهولة الدخول",
    competitionStrength: "الميزة التنافسية",
    demandIndex: "حجم الطلب",
    marginPotential: "هامش الربح",
    shippingFeasibility: "الشحن والموانئ",
    marketAnalysisTitle: "التقرير التحليلي للسوق المستهدف:",
    qualifiedBuyersDirectory: "قاعدة بيانات العملاء والمستوردين المؤهلين",
    ofTotalVerified: "من أصل",
    verifiedCompaniesSuffix: "شركة معتمدة",
    searchBuyersPlaceholder: "بحث باسم الشركة، المدينة، المحصول، مدير المشتريات، شهادة الجودة...",
    viewFullDossier: "الملف الكامل",
    closeDossier: "إغلاق النافذة",
    copyDossierSummary: "نسخ الملف كاملاً",
    dossierCopied: "تم نسخ الملخص!",
    copied: "تم!",
    copy: "نسخ",
    startOutreachCRM: "استيراد للـ CRM وبدء التواصل",
    showingRows: "عرض",
    toWord: "إلى",
    ofWord: "من أصل",
    qualifiedBuyersWord: "مشترياً مؤهلاً.",
    whatsappDirect: "واتساب مباشر",
    procurementDesk: "إيميل المشتريات والتوريد",
    primaryContact: "أساسي",
    annualReefers: "حاوية مبردة/سنوياً",
    reeferSpecsLabel: "مواصفات الحاوية المبردة:",
    strategicRationale: "لماذا هذا العميل فرصة استثنائية حالياً:",
    recommendedStrategy: "استراتيجية التواصل والتفاوض الأولى المقترحة:",
    cropSpecsTitle: "2. متطلبات المحاصيل الزراعية والاعتمادات الدولية",
    exactCropsRequired: "المحاصيل المطلوبة بدقة:",
    mandatoryCertifications: "الشهادات الإلزامية المطلوبة:",
    logisticsTermsTitle: "3. الشروط التجارية والشحن المبرد (Logistics & Incoterms)",
    containerVolumeTitle: "حجم الحاويات السنوي",
    incotermsTitle: "شروط الشحن (Incoterms)",
    paymentTermsTitle: "شروط الدفع والتعاقد",
    destinationPortTitle: "ميناء الوصول المعتمد",
    opportunityTitle: "4. فرصة التعاقد وتكتيك العرض المقترح لشركة جالينا",

    // CRM Pipeline
    crmTitle: "إدارة علاقات وتواصل العملاء (CRM Pipeline)",
    crmSubtitle: "متابعة مسار المفاوضات، إرسال العينات، وعقود تصدير الحاويات المبردة.",
    filterAllStatus: "جميع مراحل المفاوضات",
    statusNewLead: "عميل محتمل جديد",
    statusContacted: "تم التواصل الأولي",
    statusNegotiation: "مرحلة التفاوض",
    statusQuotation: "تم إرسال عرض أسعار",
    statusSampleSent: "تم إرسال عينة فنية",
    statusWon: "عقد تم إبرامه بنجاح",
    statusLost: "فرصة مفقودة",
    verifiedContactBadge: "✔ اتصال رسمي موثق",
    draftColdEmailBtn: "صياغة عرض تصديري",
    saveNotes: "حفظ الملاحظات",
    editNotes: "تعديل الملاحظة",

    // Products Catalog
    productsTitle: "كتالوج المحاصيل الزراعية (IQF)",
    productsSubtitle: "محاصيل مصرية طازجة ومجمدة بأعلى معايير الفرز بالليزر والتجميد الفردي السريع.",
    addNewCropBtn: "إضافة محصول جديد",
    specsHarvestSeason: "موسم الحصاد",
    specsShelfLife: "مدة الصلاحية",
    specsFreezingTech: "تقنية التجميد",
    specsCertifications: "الشهادات الإلزامية",
    specsPackaging: "خيارات التعبئة",
    specsTargetMarkets: "أهم الأسواق المستوردة",

    // Global Markets (Countries)
    countriesTitle: "الأسواق والوجهات التصديرية العالمية",
    countriesSubtitle: "متطلبات الدخول، المزايا الجمركية، وفترات العبور البحرية من ميناء الإسكندرية.",
    portOfDischarge: "الموانئ الرئيسية",
    customTariff: "التعرفة الجمركية",
    transitTime: "زمن الإبحار (من الإسكندرية)",
    requiredCerts: "الشهادات المطلوبة",
    marketPotential: "إمكانات السوق",

    // Suppliers (Co-Ops)
    suppliersTitle: "المزارع الشريكة وشبكات الإمداد والتعبئة",
    suppliersSubtitle: "المزارع المتعاقدة في الدلتا والصعيد، وشركات التبريد والتغليف الصناعي المعتمدة.",
    addNewSupplierBtn: "تسجيل مورد أو مزرعة",
    supplierTypeFarm: "مزرعة زراعية معتمدة",
    supplierTypeLogistics: "سلاسل إمداد وتبريد",
    supplierTypePackaging: "مصنع تعبئة وتغليف",

    // Competitors & Exhibitions
    competitorsTitle: "رصد المنافسين الدوليين والمعارض التصديرية",
    competitorsSubtitle: "مقارنة الميزة السعرية والجودة مع الموردين في إسبانيا وبولندا وتركيا، وأهم ملتقيات الغذاء الدولية.",
    upcomingExhibitions: "المعارض والملتقيات الغذائية الدولية القادمة",
    topCompetitors: "أبرز الشركات المنافسة في الأسواق المستهدفة",

    // AI Advisor
    advisorTitle: "المستشار الذكي للتصدير الزراعي (AI Advisor)",
    advisorSubtitle: "استشارات فورية حول الاتفاقيات التجارية، تسعير الحاويات، وفحوصات متبقيات المبيدات MRL.",
    sendQuestionPlaceholder: "اسأل عن أسعار الشحن، نسب السكر Brix، أو شروط الدخول للأسواق الأوروبية والخليجية...",
    clearChat: "مسح المحادثة",

    // Email Pitcher & Translator
    pitcherTitle: "صياغة وترجمة المراسلات التصديرية (B2B Cold Pitch)",
    pitcherSubtitle: "توليد مراسلات تجارية احترافية بالألمانية والفرنسية والإنجليزية وموجهة لمدير المشتريات.",
    generateDraftBtn: "توليد مسودة العرض الذكي",
    translateBtn: "ترجمة للغة المستورد المستهدف",
    copyEmailBtn: "نسخ العرض بالكامل",
    logSentEmailBtn: "تسجيل الإرسال في الـ CRM",
    targetLanguage: "اللغة المستهدفة للترجمة:",

    // Reports
    reportsTitle: "التقارير التصديرية والاستخباراتية المعتمدة",
    reportsSubtitle: "تقارير شاملة لاجتماعات مجلس الإدارة، البنوك، والمطابقة الفنية لشهادات الجودة الدولية.",
    printReportBtn: "طباعة التقرير الرسمي"
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  dir: "ltr",
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("en");
  const dir = "ltr";

  const setLang = (_newLang: Language) => {
    setLangState("en");
    localStorage.setItem("galina_language", "en");
  };

  const toggleLang = () => {
    setLangState("en");
  };

  useEffect(() => {
    localStorage.setItem("galina_language", "en");
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, []);

  const t = (key: string): string => {
    const currentDict = translations[lang] as Record<string, string>;
    const fallbackDict = translations.en as Record<string, string>;
    return currentDict[key] || fallbackDict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
