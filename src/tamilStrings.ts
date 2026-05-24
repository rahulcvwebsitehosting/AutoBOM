export interface LanguageDictionary {
  appName: string;
  tagline: string;
  uploadTitle: string;
  uploadBtn: string;
  orSelectPreset: string;
  selectRegion: string;
  customFilter: string;
  customFilterPlaceholder: string;
  analyzeBtn: string;
  analyzingState: string;
  quickSlot: string;

  // Tabs / Navigation
  tabUpload: string;
  tabReview: string;
  tabBOQ: string;
  tabRates: string;
  tabExport: string;

  // Drawing View Labels
  drawingViewerTitle: string;
  scaleLabel: string;
  sheetLabel: string;
  gridLabel: string;
  zoomIn: string;
  zoomOut: string;
  toggleLayer: string;

  // BOQ Table Labels
  boqTitle: string;
  eleId: string;
  eleCategory: string;
  eleDescription: string;
  eleLocation: string;
  eleDimensions: string;
  eleQuantity: string;
  eleRate: string;
  eleWaste: string;
  eleCost: string;
  eleCodeRef: string;
  eleWarnings: string;
  actionAdd: string;
  actionDelete: string;
  actionDownload: string;

  // Category labels
  cat_concrete: string;
  cat_steel: string;
  cat_masonry: string;
  cat_wood: string;
  cat_finish: string;
  cat_excavation: string;
  cat_plumbing: string;
  cat_electrical: string;
  cat_other: string;

  // High-level summary labels
  summaryTitle: string;
  totalEstimateValue: string;
  contractorMarginLabel: string;
  finalBOMValue: string;
  itemCountLabel: string;
  highConfidenceLabel: string;
  needsReviewLabel: string;
  confidenceScore: string;
}

export const TAMIL_DICTIONARY: Record<'en' | 'ta', LanguageDictionary> = {
  en: {
    appName: "AutoBOM",
    tagline: "AI-Powered Bill of Materials from Construction Drawings",
    uploadTitle: "INVENTORY WORKBENCH",
    uploadBtn: "DROP DRAWING / BLUEPRINT HERE",
    orSelectPreset: "--- OR SELECT PRE-LOADED BLUEPRINT DESIGN ---",
    selectRegion: "Select Geographic Tariff Region (Tamil Nadu):",
    customFilter: "Custom AI Extraction Focus Overlays (Optional):",
    customFilterPlaceholder: "e.g., Only extract concrete and steel, ignore finishes",
    analyzeBtn: "CRAFT BILL OF QUANTITIES",
    analyzingState: "EXTRACTING MATERIALS BLOCK...",
    quickSlot: "Quick Slot",

    tabUpload: "Blueprint Desk",
    tabReview: "Structural Viewer",
    tabBOQ: "Crafted BOQ Chest",
    tabRates: "Tariff Rates",
    tabExport: "Ship / Export",

    drawingViewerTitle: "CRAFTING VIEWPORT",
    scaleLabel: "Drawing Scale",
    sheetLabel: "Sheet Ref",
    gridLabel: "Field Grid",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    toggleLayer: "Specs HUD",

    boqTitle: "EXTRACTED MATERIALS CHEST",
    eleId: "ID",
    eleCategory: "Trade Category",
    eleDescription: "Material Description Requirements & IS Code Specs",
    eleLocation: "Grid Location",
    eleDimensions: "Dimensions (L x W x H / Dia)",
    eleQuantity: "Quantity",
    eleRate: "Base Rate (₹)",
    eleWaste: "Wastage",
    eleCost: "Total Cost (₹)",
    eleCodeRef: "IS Code Compliance",
    eleWarnings: "QS Warnings / Safety Audits",
    actionAdd: "Add Item",
    actionDelete: "Delete",
    actionDownload: "Export Excel / CSV",

    cat_concrete: "Concrete (Rcc/Pcc)",
    cat_steel: "Steel (Rebar)",
    cat_masonry: "Brick Masonry",
    cat_wood: "Country Wood",
    cat_finish: "Finishes / Tiles / Plaster",
    cat_excavation: "Soil Excavations",
    cat_plumbing: "Drainage / Plumbing",
    cat_electrical: "Electrical Starter",
    cat_other: "Fencing / Other",

    summaryTitle: "BOM AGGREGATION CHEST SUMMARY",
    totalEstimateValue: "Sub-Total Construction cost (Net Dry Material):",
    contractorMarginLabel: "Contractor Profit Margin Coverage (5%):",
    finalBOMValue: "Grand Estimated Field Total:",
    itemCountLabel: "Identified Parts count",
    highConfidenceLabel: "High Confidence items (No risk)",
    needsReviewLabel: "Review Recommended blocks (High Risk)",
    confidenceScore: "Overall Model Confidence"
  },
  ta: {
    appName: "ஆட்டோBOM (AutoBOM)",
    tagline: "கட்டிட வரைபடங்களில் இருந்து தானியங்கி பொருள் மதிப்பீட்டு கணக்கீடு",
    uploadTitle: "மதிப்பீட்டு பட்டறை (வொர்க்பெஞ்ச்)",
    uploadBtn: "கட்டிட வரைபட கோப்புகளை (PDF/Image) இங்கே பதிவேற்றவும்",
    orSelectPreset: "--- அல்லது மாதிரி விவசாய கட்டிட வரைபடத்தை தேர்ந்தெடுக்கவும் ---",
    selectRegion: "தமிழ்நாடு மாவடங்கள் வாரியான கட்டண விகிதங்கள் (Tariff Region):",
    customFilter: "குறிப்பிட்ட பொருட்களை மட்டும் கணக்கிட (விருப்பம்):",
    customFilterPlaceholder: "உதாரணமாக: கான்கிரீட் மற்றும் கம்பிகளை மட்டும் எடுக்கவும், பூச்சு வேலைகளைத் தவிர்க்கவும்",
    analyzeBtn: "பொருள் பட்டியலைத் தயாரி (Generate BOQ)",
    analyzingState: "வரைபடப் பகுப்பாய்வு நடந்து கொண்டிருக்கிறது...",
    quickSlot: "தேர்வு பெட்டி",

    tabUpload: "வரைபட மேஜை",
    tabReview: "முப்பரிமாணப் பார்வை",
    tabBOQ: "மதிப்பீட்டு பெட்டகம்",
    tabRates: "கட்டண விவரங்கள்",
    tabExport: "பதிவிறக்கம் செய்க",

    drawingViewerTitle: "கட்டிட வரைபடப் பார்வை",
    scaleLabel: "வரைபட அளவு (Scale)",
    sheetLabel: "தாள் எண் (Sheet)",
    gridLabel: "கள அளவு",
    zoomIn: "பெரிதாக்கு (+)",
    zoomOut: "சிறிதாக்கு (-)",
    toggleLayer: "தகவல் அடுக்கு",

    boqTitle: "கண்டறியப்பட்ட கட்டுமானப் பொருட்கள் பட்டியல்",
    eleId: "குறியீடு",
    eleCategory: "வகைப்பாடு",
    eleDescription: "பொருளின் விவரம் மற்றும் இந்திய தராதரக் குறியீடு (IS Specs)",
    eleLocation: "அமைவிடம்",
    eleDimensions: "அளவு விவரங்கள் (L x W x H / Dia)",
    eleQuantity: "அளவு",
    eleRate: "அடிப்படை விலை (₹)",
    eleWaste: "கழிவு காரணி",
    eleCost: "மொத்த தொகை (₹)",
    eleCodeRef: "இந்திய தரக் கட்டுப்பாடு (IS Code)",
    eleWarnings: "முன்னெச்சரிக்கைகள் / பொறியாளர் குறிப்பு",
    actionAdd: "புதிய பொருள் சேர்க்க",
    actionDelete: "நீக்கு",
    actionDownload: "மதிப்பீட்டு கோப்பு பதிவிறக்கம் (Excel/CSV)",

    cat_concrete: "கான்கிரீட் (RCC/PCC)",
    cat_steel: "கம்பி இரும்பு (Steel)",
    cat_masonry: "செங்கல் பூச்சு",
    cat_wood: "கட்டுமான மரவேலை",
    cat_finish: "டைல்ஸ் மற்றும் பூச்சு",
    cat_excavation: "மண் அகழ்வாராய்ச்சி",
    cat_plumbing: "குழாய் அமைப்புகள்",
    cat_electrical: "மின்சார இணைப்பு பெட்டி",
    cat_other: "வேலி மற்றும் இதரவை",

    summaryTitle: "மதிப்பீட்டுத் தொகை சுருக்கம்",
    totalEstimateValue: "கட்டுமானப் பொருட்களின் நிகரத் தொகை:",
    contractorMarginLabel: "ஒப்பந்தக்காரர் லாப வரம்பு (5%):",
    finalBOMValue: "மதிப்பிடப்பட்ட மொத்த கட்டுமான செலவு:",
    itemCountLabel: "மொத்த உறுப்புகள் (Items)",
    highConfidenceLabel: "நம்பகமான உறுப்புகள் (அபாயமற்றது)",
    needsReviewLabel: "சரிபார்க்கப்பட வேண்டிய உறுப்புகள் (அபாயம்)",
    confidenceScore: "சுயாதீன துல்லியத்தன்மை (Confidence)"
  }
};
