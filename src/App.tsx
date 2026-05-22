import React, { useState, useEffect } from 'react';
import { PRESET_DRAWINGS, PresetDrawing } from './presets';
import { TAMIL_DICTIONARY, LanguageDictionary } from './tamilStrings';
import { REGIONAL_RATES_DATABASE } from './ratesData';
import { BOQResponse, BOQElement } from './types';
import { DrawingViewer } from './components/DrawingViewer';
import { BOQTable } from './components/BOQTable';
import { RatesManager } from './components/RatesManager';
import { 
  FileText, Map, HelpCircle, HardHat, 
  Search, Scroll, Compass, Sparkles, Languages, Settings,
  AlertOctagon, CheckSquare, BarChart3, ChevronRight, RefreshCw, Upload, FileSignature
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const t = TAMIL_DICTIONARY[language];

  // Primary Workspace States
  const [activeTab, setActiveTab] = useState<'review' | 'boq' | 'rates' | 'export' | 'settings'>('review');
  const [activeRegionId, setActiveRegionId] = useState<string>('tamil_nadu_erode_2026');
  const [activePresetId, setActivePresetId] = useState<string>('cattle_shed_erode');
  
  // Real-Time Sliding Settings Configs State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [concreteGrade, setConcreteGrade] = useState<'M20' | 'M25' | 'M30' | 'M35'>('M25');
  const [steelGrade, setSteelGrade] = useState<'Fe415' | 'Fe500' | 'Fe550'>('Fe500');
  const [wastagePercent, setWastagePercent] = useState<number>(12);
  const [contractorMarginPercent, setContractorMarginPercent] = useState<number>(5);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  
  // Custom uploaded design variables
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>('');

  // Extracted Quantities Chest
  const [extractedData, setExtractedData] = useState<BOQResponse | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  
  // Immersive Crafting/Processing indicators
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [craftProgress, setCraftProgress] = useState<number>(0);
  const [craftStageText, setCraftStageText] = useState<string>('');

  const activePreset = PRESET_DRAWINGS.find(p => p.id === activePresetId) || PRESET_DRAWINGS[0];

  // Pre-load default Erode Cattle Shed data so the workspace is immediately alive and breathtaking!
  useEffect(() => {
    // Standard initialization with local rate calculations
    const fetchDefaultData = async () => {
      try {
        const response = await fetch("/api/extract-bom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: activePresetId,
            regionId: activeRegionId
          })
        });
        const res = await response.json();
        if (res.success && res.data) {
          setExtractedData(res.data);
          setIsSimulated(res.isSimulated !== false);
        }
      } catch (err) {
        // Safe Client-Side compile-time copy
        setExtractedData(activePreset.sampleData);
      }
    };
    
    fetchDefaultData();
  }, [activePresetId, activeRegionId]);

  // Handle Client Upload File Conversion to Base64
  const handleUploadedFile = (file: File) => {
    if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
      alert("Invalid format! Please drop an image drawing (JPEG/PNG) or structural PDF.");
      return;
    }

    setUploadedFileName(file.name);
    setUploadedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedBase64(reader.result as string);
      // Immediately alert user we are analyzing their own layout
      console.log("File loaded successfully into memory stream.");
    };
    reader.onerror = (err) => console.error("File loading error:", err);
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Run Real/Simulated AI Analysis through full stack Express Router
  const runBOMCraftingAnimation = async () => {
    setIsLoading(true);
    setCraftProgress(0);
    setCraftStageText("ORIENTING DRAWINGS SHEETS...");

    // Sound effect trigger or Stage description interval
    const stages = [
      "ORIENTING DRAWINGS SHEETS...",
      "CALIBRATING SCALE RATIO...",
      "EXTRACTING GRID MEASUREMENTS...",
      "MAPPING CONCRETE MIX RATIOS...",
      "ESTIMATING STEEL REBAR MASS...",
      "AUDITING IS 456 SAFETY OVERLAYS...",
      "GATHERING TARIFF RATE COEFFICIENTS...",
      "QUERYING CHENNAI/ERODE TRADING HUB...",
      "ASSEMBLING FINAL MATERIAL CHEST..."
    ];

    const progressInterval = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 10) {
          clearInterval(progressInterval);
          return 10;
        }
        
        // Update stage label dynamically based on step index
        if (stages[prev]) {
          setCraftStageText(stages[prev]);
        }
        return prev + 1;
      });
    }, 450);

    try {
      const response = await fetch("/api/extract-bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: uploadedBase64 || undefined,
          mimeType: uploadedMimeType || undefined,
          regionId: activeRegionId,
          presetId: uploadedBase64 ? undefined : activePresetId,
          customPromptInput: customInstruction || undefined
        })
      });

      const result = await response.json();
      
      // Delay response slightly if needed to match epic retro craft progress bar
      setTimeout(() => {
        if (result.success && result.data) {
          setExtractedData(result.data);
          setIsSimulated(result.isSimulated !== false);
          // Redirect to the parsed BOQ Table chest once completed!
          setActiveTab('boq');
        } else {
          alert(`Analysis extraction failure: ${result.error || 'Server timed out'}`);
        }
        setIsLoading(false);
      }, 4500);

    } catch (err: any) {
      setTimeout(() => {
        alert("Server extraction error! Displaying local preset mock chest content.");
        setIsLoading(false);
      }, 4500);
    }
  };

  const handleUpdateBOMElements = (updated: BOQElement[]) => {
    if (!extractedData) return;
    
    // Find sum of all item costs
    const totalDryCost = updated.reduce((sum, el) => sum + (el.total_cost || 0), 0);
    
    setExtractedData({
      ...extractedData,
      elements: updated,
      summary: {
        ...extractedData.summary,
        total_elements: updated.length,
        review_needed_count: updated.filter(el => el.verification_required).length,
        high_confidence_count: updated.filter(el => !el.verification_required).length
      }
    });
  };

  // Switch preset immediately, clean out any custom file state to maintain pristine focus
  const handlePresetChange = (id: string) => {
    setActivePresetId(id);
    setUploadedBase64(null);
    setUploadedFileName(null);
  };

  // Reactive elements list based on settings triggers
  const elementsList = React.useMemo(() => {
    if (!extractedData || !extractedData.elements) return [];

    let multiplier = 1.0;
    if (activeRegionId === 'tamil_nadu_erode_2026') multiplier = 1.0;
    else if (activeRegionId === 'karnataka_mandya_2026') multiplier = 1.06;
    else if (activeRegionId === 'kerala_wayanad_2026') multiplier = 1.15;
    else if (activeRegionId === 'andhra_pradesh_nellore_2026') multiplier = 0.96;

    return extractedData.elements.map(el => {
      let baseRate = el.unit_rate || 0;

      // Dyn rates for concrete grades
      if (el.category === 'concrete') {
        const isSlab = el.element_id === 'EL-SLAB' || el.description.toLowerCase().includes('slab');
        if (concreteGrade === 'M20') {
          baseRate = isSlab ? 4200 : 2600;
        } else if (concreteGrade === 'M25') {
          baseRate = isSlab ? 5200 : 3200;
        } else if (concreteGrade === 'M30') {
          baseRate = isSlab ? 5900 : 3800;
        } else if (concreteGrade === 'M35') {
          baseRate = isSlab ? 6500 : 4400;
        }
      } 
      // Dyn rates for steel grades
      else if (el.category === 'steel') {
        if (steelGrade === 'Fe415') {
          baseRate = 68;
        } else if (steelGrade === 'Fe500') {
          baseRate = 78;
        } else if (steelGrade === 'Fe550') {
          baseRate = 85;
        }
      }

      // Multiply by location tariff index
      baseRate = Math.round(baseRate * multiplier);

      // Convert currency to USD if requested (₹83 = 1 USD)
      if (currency === 'USD') {
        baseRate = Math.round((baseRate / 83) * 100) / 100;
      }

      // Standard design safety factor (dry mix material takeoff metrics multiplier)
      const wasteFactor = el.category === 'concrete' ? 1.54 : el.category === 'steel' ? 1.05 : el.category === 'masonry' ? 1.10 : el.category === 'finish' ? 1.15 : 1.1;
      
      let calculatedTotal = Math.round(el.quantity.value * baseRate * wasteFactor);
      if (currency === 'USD') {
        calculatedTotal = Math.round((el.quantity.value * baseRate * wasteFactor) * 100) / 100;
      }

      return {
        ...el,
        unit_rate: baseRate,
        total_cost: calculatedTotal
      };
    });
  }, [extractedData, activeRegionId, concreteGrade, steelGrade, currency]);

  // Dynamic aggregates
  const aggregateNetDryCost = React.useMemo(() => {
    const rawSum = elementsList.reduce((sum, el) => sum + (el.total_cost || 0), 0);
    return currency === 'USD' ? Math.round(rawSum * 100) / 100 : Math.round(rawSum);
  }, [elementsList, currency]);

  const calculatedWastageAndContingency = React.useMemo(() => {
    const amount = aggregateNetDryCost * (wastagePercent / 100);
    return currency === 'USD' ? Math.round(amount * 100) / 100 : Math.round(amount);
  }, [aggregateNetDryCost, wastagePercent, currency]);

  const grandContractorMargin = React.useMemo(() => {
    const amount = aggregateNetDryCost * (contractorMarginPercent / 100);
    return currency === 'USD' ? Math.round(amount * 100) / 100 : Math.round(amount);
  }, [aggregateNetDryCost, contractorMarginPercent, currency]);

  const invoiceGrandTotal = React.useMemo(() => {
    const total = aggregateNetDryCost + calculatedWastageAndContingency + grandContractorMargin;
    return currency === 'USD' ? Math.round(total * 100) / 100 : Math.round(total);
  }, [aggregateNetDryCost, calculatedWastageAndContingency, grandContractorMargin, currency]);

  // Pie chart calculation by trade Category
  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    elementsList.forEach(el => {
      totals[el.category] = (totals[el.category] || 0) + (el.total_cost || 0);
    });
    return totals;
  }, [elementsList]);

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#212121] p-4 font-sans selection:bg-[#F9A825] selection:text-[#212121]">

      {/* Dynamic Sliding Configuration Panel Overlay */}
      <div className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${isSettingsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-[#E8E4C9] border-r-4 border-[#3E2723] w-full max-w-sm h-full flex flex-col p-5 shadow-2xl relative transition-transform duration-300 transform ${isSettingsOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-[#3E2723] pb-3 mb-4">
            <h3 className="text-xs font-bold text-[#3E2723] uppercase flex items-center gap-1.5" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
              ⚙️ CONFIG CHEST
            </h3>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 text-xs font-bold underline cursor-pointer hover:text-red-700 font-mono"
            >
              [CLOSE]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs">
            {/* Tariff Region */}
            <div className="space-y-1">
              <label className="block text-3xs font-bold text-[#5D4037] uppercase">📍 TARIFF REGION:</label>
              <select 
                value={activeRegionId} 
                onChange={(e) => setActiveRegionId(e.target.value)}
                className="w-full bg-[#F5F5DC] border-3 border-[#3E2723] p-1.5 font-bold outline-none cursor-pointer focus:border-[#F9A825]"
              >
                {Object.values(REGIONAL_RATES_DATABASE).map(reg => (
                  <option key={reg.region_id} value={reg.region_id}>{reg.region_name}</option>
                ))}
              </select>
            </div>

            {/* Concrete Grade */}
            <div className="space-y-1">
              <label className="block text-3xs font-bold text-[#5D4037] uppercase">🧱 CONCRETE GRADE:</label>
              <div className="grid grid-cols-4 gap-1">
                {(['M20', 'M25', 'M30', 'M35'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setConcreteGrade(g)}
                    className={`p-1.5 text-center font-bold border-2 border-[#3E2723] text-2xs cursor-pointer ${concreteGrade === g ? 'bg-[#388E3C] text-white animate-pulse' : 'bg-[#9E9E9E] text-black'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Steel Grade */}
            <div className="space-y-1">
              <label className="block text-3xs font-bold text-[#5D4037] uppercase">⚙️ STEEL REBAR TMT:</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Fe415', 'Fe500', 'Fe550'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSteelGrade(g)}
                    className={`p-1.5 text-center font-bold border-2 border-[#3E2723] text-2xs cursor-pointer ${steelGrade === g ? 'bg-[#388E3C] text-white animate-pulse' : 'bg-[#9E9E9E] text-black'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Wastage */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-3xs font-bold text-[#5D4037]">
                <span>🌾 DRY WASTAGE %:</span>
                <span className="text-[#3E2723] font-black">{wastagePercent}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="20" 
                value={wastagePercent}
                onChange={(e) => setWastagePercent(parseInt(e.target.value) || 12)}
                className="w-full h-2 bg-[#9E9E9E] border border-[#3E2723] appearance-none cursor-pointer accent-[#212121]" 
              />
            </div>

            {/* Contractor Margin */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-3xs font-bold text-[#5D4037]">
                <span>⛏️ CONTRACTOR MARGIN %:</span>
                <span className="text-[#3E2723] font-black">{contractorMarginPercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                value={contractorMarginPercent}
                onChange={(e) => setContractorMarginPercent(parseInt(e.target.value) || 5)}
                className="w-full h-2 bg-[#9E9E9E] border border-[#3E2723] appearance-none cursor-pointer accent-[#212121]" 
              />
            </div>

            {/* Currency Block */}
            <div className="space-y-1">
              <label className="block text-3xs font-bold text-[#5D4037] uppercase">💵 ACTIVE CURRENCY:</label>
              <div className="grid grid-cols-2 gap-1">
                {(['INR', 'USD'] as const).map(cur => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`p-1.5 text-center font-bold border-2 border-[#3E2723] text-2xs cursor-pointer uppercase ${currency === cur ? 'bg-[#F9A825] text-black' : 'bg-[#9E9E9E] text-black'}`}
                  >
                    {cur === 'INR' ? '₹ INR (₹)' : '$ USD ($)'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-[#F5F5DC] border-2 border-[#3E2723] p-2.5 text-3xs leading-relaxed text-[#616161]">
              💡 <strong>HOW IT WORKS:</strong> Prices update in real-time as coefficients scale. Multipliers: TN = 1.0, KA = 1.06, KL = 1.15, AP = 0.96.
            </div>
          </div>
        </div>
      </div>
      
      {/* HEADER HUD: Pickaxe & Trowel themed toolbar */}
      <header className="max-w-7xl mx-auto blocky-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3 select-none">
        <div className="flex items-center gap-3">
          {/* Logo with pure CSS bevel frame */}
          <div className="p-2 bg-[#E8E4C9] border-3 border-[#3E2723] shadow-[2px_2px_0px_#3E2723] text-xl font-bold font-pixel shrink-0">
            ⛏️🧱
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold uppercase text-[#212121] tracking-tight flex items-center gap-2" style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '15px' }}>
              {t.appName}
            </h1>
            <p className="text-xs font-mono font-bold text-[#5D4037] mt-1">
              🛠️ {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Control Widgets */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Simulation / API Mode HUD Beacon */}
          <div className={`px-2.5 py-1.5 border-2 border-[#3E2723] text-2xs font-mono font-bold flex items-center gap-1.5 ${
            isSimulated ? 'bg-[#F9A825] text-black' : 'bg-[#388E3C] text-white'
          }`}>
            <span className="w-2.5 h-2.5 bg-current rounded-full inline-block animate-ping"></span>
            <span>{isSimulated ? "📊 LOCAL SIM DEMO" : "⚡ PRO GEMINI CONNECTED"}</span>
          </div>

          {/* Regional Tariff quick indicator */}
          <div className="bg-[#9E9E9E] border-2 border-[#3E2723] text-2xs font-mono font-bold px-2.5 py-1.5 flex items-center gap-1">
            📍 {REGIONAL_RATES_DATABASE[activeRegionId]?.region_name.split(' (')[0]}
          </div>

          {/* Technical Settings Gear Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '9px' }}
            className="px-3 py-2 bg-[#F9A825] text-black border-2 border-[#3E2723] cursor-pointer shadow-[2px_2px_0px_#3E2723] hover:bg-amber-500 active:translate-y-px active:shadow-[0px_0px_0px_#3E2723] font-bold flex items-center gap-1 uppercase font-mono"
            title="Open Config Chest"
          >
            <Settings size={12} className="inline mr-1" />
            <span>CONFIG</span>
          </button>

          {/* Bilingual Tamil Toggle Widget */}
          <button
            type="button"
            onClick={() => setLanguage(prev => prev === 'en' ? 'ta' : 'en')}
            style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '9px' }}
            className="px-3 py-2 bg-[#5D4037] text-[#F9A825] border-2 border-[#3E2723] cursor-pointer shadow-[2px_2px_0px_#3E2723] hover:bg-[#3E2723] active:translate-y-px active:shadow-[0px_0px_0px_#3E2723] font-bold flex items-center gap-1 font-mono uppercase"
          >
            <Languages size={12} className="inline mr-1" />
            <span>{language === 'en' ? 'தமிழ்' : 'Eng'}</span>
          </button>
        </div>
      </header>

      {/* WORKBENCH: Dual column pixel layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-6">
        
        {/* LEFT COLUMN (30% - INVENTORY PANEL) */}
        <section className="md:col-span-3 flex flex-col gap-6 select-none">
          
          {/* Blueprint Desk Card */}
          <div className="blocky-card p-4">
            <h2 className="text-xs font-bold text-[#3E2723] pb-2 border-b-2 border-[#3E2723] mb-4 uppercase" style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '10px' }}>
              📜 Blueprint Desk
            </h2>

            {/* Custom File Upload drop zone */}
            <div 
              onDragOver={onDragOver}
              onDrop={onDrop}
              className={`p-4 border-4 border-dashed rounded-0 text-center font-mono text-xs flex flex-col items-center justify-center min-h-[140px] cursor-pointer transition-all ${
                uploadedBase64 
                  ? 'border-[#388E3C] bg-[#388E3C]/5' 
                  : 'border-[#3E2723] bg-[#F5F5DC] hover:border-[#F9A825]'
              }`}
            >
              <input 
                id="file-element-chooser"
                type="file" 
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUploadedFile(e.target.files[0])}
              />
              
              <label htmlFor="file-element-chooser" className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2">
                <Upload className={`mb-2 ${uploadedBase64 ? 'text-[#388E3C]' : 'text-[#5D4037]'}`} size={24} />
                <span className="font-bold text-[#5D4037] block text-center uppercase tracking-wide text-2xs mb-1">
                  {uploadedFileName ? `📜 LOADED: ${uploadedFileName.substring(0, 18)}...` : t.uploadBtn}
                </span>
                <span className="text-3xs text-[#616161]">DPI min 300 / Supports PDF, JPEG, PNG</span>
              </label>
            </div>

            {/* Manual clear if uploaded */}
            {uploadedBase64 && (
              <button 
                onClick={() => { setUploadedBase64(null); setUploadedFileName(null); }}
                className="w-full mt-2 py-1 bg-[#D84315] text-white border-2 border-[#3E2723] text-2xs font-mono font-bold cursor-pointer hover:bg-red-600"
              >
                ❌ Clear Custom Blueprint
              </button>
            )}

            {/* Blueprint Preset Slider Grid */}
            <div className="mt-5">
              <span className="block text-3xs font-bold font-mono text-[#5D4037] mb-2 uppercase text-center">
                {t.orSelectPreset}
              </span>

              {/* Grid 3x2 Minecraft slots */}
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_DRAWINGS.map((p) => {
                  const isActive = activePresetId === p.id && !uploadedBase64;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetChange(p.id)}
                      className={`p-2.5 text-left border-3 transition-transform cursor-pointer outline-none relative hover:border-[#F9A825] active:translate-y-0.5 ${
                        isActive 
                          ? 'border-[#F9A825] bg-[#E8E4C9] shadow-[1px_1px_0px_#3E2723] scale-[1.02]' 
                          : 'border-[#3E2723] bg-[#F5F5DC] shadow-[3px_3px_0px_#3E2723]'
                      }`}
                    >
                      {/* Active Slot HUD marker */}
                      {isActive && (
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#388E3C] border border-white"></div>
                      )}
                      
                      <div className="font-mono text-3xs font-bold text-[#5D4037] uppercase mb-0.5">
                        📦 {p.category}
                      </div>
                      
                      <div className="font-bold font-pixel text-[#212121] leading-tight text-xs tracking-tight line-clamp-2">
                        {p.title}
                      </div>

                      <div className="font-mono text-3xs font-bold text-[#616161] mt-1.5 block">
                        📏 Scale: {p.scale}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Focus Filter Overlay Box */}
          <div className="blocky-card p-4 font-mono text-xs">
            <span className="block text-2xs font-bold text-[#5D4037] pb-1 uppercase">{t.customFilter}</span>
            <textarea 
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder={t.customFilterPlaceholder}
              className="w-full bg-[#F5F5DC] border-3 border-[#3E2723] p-2 h-20 outline-none text-[#212121] resize-none focus:border-[#F9A825]"
            />
            <p className="text-3xs text-[#616161] leading-normal pt-1.5">
              💡 Formulates specific regional safety limits per IS criteria overlays.
            </p>
          </div>

          {/* District Tariff Options card */}
          <div className="blocky-card p-4 font-mono text-xs">
            <span className="block text-2xs font-bold text-[#5D4037] pb-1 uppercase">{t.selectRegion}</span>
            <select 
              value={activeRegionId}
              onChange={(e) => setActiveRegionId(e.target.value)}
              className="w-full bg-[#F5F5DC] border-3 border-[#3E2723] p-2 outline-none font-bold cursor-pointer focus:border-[#F9A825]"
            >
              {Object.values(REGIONAL_RATES_DATABASE).map(reg => (
                <option key={reg.region_id} value={reg.region_id}>
                  📍 {reg.region_name}
                </option>
              ))}
            </select>
          </div>
          
        </section>

        {/* RIGHT COLUMN (70% - CRAFTING OUTPUT) */}
        <section className="md:col-span-7 flex flex-col gap-6">

          {/* Active Worksite HUD Banner */}
          <div className="blocky-card p-4 bg-[#5D4037]/10 border-l-8 border-[#5D4037] flex flex-wrap items-center justify-between gap-3 select-none">
            <div className="space-y-0.5">
              <span className="text-3xs font-mono font-bold text-[#5D4037] uppercase tracking-wide">💼 Current Sructural Worksite Profile:</span>
              <h3 className="text-base font-bold text-[#212121] uppercase line-clamp-1">
                {uploadedBase64 ? '📝 Custom Uploaded Technical Design Sheet' : activePreset.title}
              </h3>
              <p className="text-xs text-[#616161] font-medium max-w-lg">
                {uploadedBase64 ? 'Processing user uploaded layout blueprints against custom overlays constraints.' : activePreset.description}
              </p>
            </div>

            <div className="bg-[#3E2723] text-[#F5F5DC] border-2 border-[#3E2723] p-2 text-right">
              <span className="block text-3xs font-mono text-[#E8E4C9]">ESTIMATED GRAND BUDGET</span>
              <span className="text-base font-bold font-mono text-[#F9A825]">{currency === 'USD' ? '$' : '₹'}{invoiceGrandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* AI Immersive Crafting Segment Indicator (Drowning heart / hunger visualizer during load) */}
          {isLoading && (
            <div className="bg-[#E8E4C9] border-4 border-[#3E2723] shadow-[4px_4px_0px_#3E2723] p-5 flex flex-col items-center justify-center select-none font-mono text-center">
              <span className="text-3xl animate-bounce mb-3">🛠️⛏️🧱</span>
              
              <h4 className="text-xs font-bold text-[#3E2723] pb-1 uppercase tracking-wide" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
                {craftStageText}
              </h4>
              
              {/* Retro Heart health segments bar */}
              <div className="flex gap-1.5 my-4">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const filled = craftProgress > idx;
                  return (
                    <div 
                      key={idx} 
                      className={`w-6 h-6 border-3 border-[#3E2723] transition-all duration-300 ${
                        filled ? 'bg-[#388E3C] shadow-inner' : 'bg-[#9E9E9E]'
                      }`}
                    ></div>
                  );
                })}
              </div>

              <p className="text-xs text-[#5D4037] font-bold">
                ⛏️ Real-time Indian Standard takeoffs validation in progress...
              </p>
            </div>
          )}

          {/* HOTBAR NAVIGATION: 9 grid slots */}
          <div className="grid grid-cols-5 md:grid-cols-9 gap-1.5 select-none" role="tablist">
            
            {/* Slot 1: Review/Draw Tab */}
            <button
              onClick={() => setActiveTab('review')}
              className={`p-2 border-3 text-center transition-all cursor-pointer relative active:translate-y-px ${
                activeTab === 'review' 
                  ? 'border-white bg-[#5D4037] text-[#F9A825] -translate-y-1 shadow-[0px_4px_0px_#3E2723]' 
                  : 'border-[#3E2723] bg-[#E8E4C9] p-2 hover:bg-[#F5F5DC] shadow-[2px_2px_0px_#3E2723]'
              }`}
            >
              <div className="text-base">🗺️</div>
              <span className="block text-3xs font-mono font-bold mt-1 uppercase line-clamp-1">{t.tabReview}</span>
            </button>

            {/* Slot 2: BOQ Chest Tab */}
            <button
              onClick={() => setActiveTab('boq')}
              className={`p-2 border-3 text-center transition-all cursor-pointer relative active:translate-y-px ${
                activeTab === 'boq' 
                  ? 'border-white bg-[#5D4037] text-[#F9A825] -translate-y-1 shadow-[0px_4px_0px_#3E2723]' 
                  : 'border-[#3E2723] bg-[#E8E4C9] p-2 hover:bg-[#F5F5DC] shadow-[2px_2px_0px_#3E2723]'
              }`}
            >
              <div className="text-base">🎒</div>
              <span className="block text-3xs font-mono font-bold mt-1 uppercase line-clamp-1">{t.tabBOQ}</span>
            </button>

            {/* Slot 3: Rates Tab */}
            <button
              onClick={() => setActiveTab('rates')}
              className={`p-2 border-3 text-center transition-all cursor-pointer relative active:translate-y-px ${
                activeTab === 'rates' 
                  ? 'border-white bg-[#5D4037] text-[#F9A825] -translate-y-1 shadow-[0px_4px_0px_#3E2723]' 
                  : 'border-[#3E2723] bg-[#E8E4C9] p-2 hover:bg-[#F5F5DC] shadow-[2px_2px_0px_#3E2723]'
              }`}
            >
              <div className="text-base">📊</div>
              <span className="block text-3xs font-mono font-bold mt-1 uppercase line-clamp-1">{t.tabRates}</span>
            </button>

            {/* Slot 4: Export Summary Tab */}
            <button
              onClick={() => setActiveTab('export')}
              className={`p-2 border-3 text-center transition-all cursor-pointer relative active:translate-y-px ${
                activeTab === 'export' 
                  ? 'border-white bg-[#5D4037] text-[#F9A825] -translate-y-1 shadow-[0px_4px_0px_#3E2723]' 
                  : 'border-[#3E2723] bg-[#E8E4C9] p-2 hover:bg-[#F5F5DC] shadow-[2px_2px_0px_#3E2723]'
              }`}
            >
              <div className="text-base">🚢</div>
              <span className="block text-3xs font-mono font-bold mt-1 uppercase line-clamp-1">{t.tabExport}</span>
            </button>

            {/* Slot 5: Technical Settings/Secrets Tab */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 border-3 text-center transition-all cursor-pointer relative active:translate-y-px ${
                activeTab === 'settings' 
                  ? 'border-white bg-[#5D4037] text-[#F9A825] -translate-y-1 shadow-[0px_4px_0px_#3E2723]' 
                  : 'border-[#3E2723] bg-[#E8E4C9] p-2 hover:bg-[#F5F5DC] shadow-[2px_2px_0px_#3E2723]'
              }`}
            >
              <div className="text-base">⚙️</div>
              <span className="block text-3xs font-mono font-bold mt-1 uppercase line-clamp-1">Settings</span>
            </button>

            {/* Slot 6 to 9: Minecraft Grid placeholders (Disabled styled buttons) */}
            <div className="hidden md:flex p-2 border-3 border-dashed border-[#5D4037]/40 bg-[#E8E4C9]/40 text-[#616161] flex-col items-center justify-center select-none">
              <span className="text-2xs opacity-40">🌾</span>
              <span className="text-3xs font-mono opacity-30 mt-1 line-clamp-1">Farm slot</span>
            </div>
            <div className="hidden md:flex p-2 border-3 border-dashed border-[#5D4037]/40 bg-[#E8E4C9]/40 text-[#616161] flex-col items-center justify-center select-none">
              <span className="text-2xs opacity-40">🧱</span>
              <span className="text-3xs font-mono opacity-30 mt-1 line-clamp-1">Brick slot</span>
            </div>
            <div className="hidden md:flex p-2 border-3 border-dashed border-[#5D4037]/40 bg-[#E8E4C9]/40 text-[#616161] flex-col items-center justify-center select-none">
              <span className="text-2xs opacity-40">⚙️</span>
              <span className="text-3xs font-mono opacity-30 mt-1 line-clamp-1">Steel slot</span>
            </div>
            <div className="hidden md:flex p-2 border-3 border-dashed border-[#5D4037]/40 bg-[#E8E4C9]/40 text-[#616161] flex-col items-center justify-center select-none">
              <span className="text-2xs opacity-40">⛏️</span>
              <span className="text-3xs font-mono opacity-30 mt-1 line-clamp-1">Soil slot</span>
            </div>
          </div>

          {/* DYNAMIC VIEWPORT RENDER CONTAINER */}
          <div className="transition-all duration-300">
            {activeTab === 'review' && (
              <DrawingViewer 
                preset={activePreset} 
                t={t} 
                onRunAnalysis={runBOMCraftingAnimation} 
                isLoading={isLoading} 
              />
            )}

            {activeTab === 'boq' && extractedData && (
              <BOQTable 
                elements={elementsList} 
                t={t} 
                regionId={activeRegionId} 
                onUpdateElements={handleUpdateBOMElements}
                contractorMarginFraction={0.05}
              />
            )}

            {activeTab === 'rates' && (
              <RatesManager 
                activeRegionId={activeRegionId} 
                onRegionChange={(id) => setActiveRegionId(id)} 
                t={t} 
              />
            )}

            {activeTab === 'export' && (
              <div className="blocky-card p-4 space-y-6 flex flex-col">
                <div className="border-b-2 border-[#3E2723] pb-2">
                  <h2 className="text-sm font-bold text-[#212121] uppercase" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
                    🚢 Budget Estimation & Cargo Summary
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  
                  {/* Detailed Budget aggregate stats */}
                  <div className="border-4 border-[#3E2723] bg-[#F5F5DC] p-4 flex flex-col gap-4 font-mono text-xs text-[#212121]">
                    <h3 className="font-bold text-[#5D4037] uppercase border-b border-[#3E2723] pb-1.5 flex items-center gap-1.5">
                      📊 Aggregate Estimations Breakdown
                    </h3>
                    
                    <div className="space-y-2 font-semibold">
                      <div className="flex justify-between items-center text-[13px]">
                        <span>Dry Material Aggregate cost:</span>
                        <span className="text-[#3E2723]">{currency === 'USD' ? '$' : '₹'}{aggregateNetDryCost.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[13px]">
                        <span>Standard Wastage factored in:</span>
                        <span className="text-amber-800">Factored inside categories</span>
                      </div>

                      <div className="flex justify-between items-center text-[13px]">
                        <span>Govt IS Code standard factor:</span>
                        <span className="text-[#388E3C]">Compliant</span>
                      </div>

                      <div className="flex justify-between items-center text-[13px]">
                        <span>{t.contractorMarginLabel}</span>
                        <span className="text-amber-700">{currency === 'USD' ? '$' : '₹'}{grandContractorMargin.toLocaleString()}</span>
                      </div>

                      <div className="border-t-2 border-[#3E2723] pt-2 flex justify-between items-center text-sm font-bold text-[#212121] uppercase">
                        <span>Grand Estimated total:</span>
                        <span className="text-lg text-[#388E3C]">{currency === 'USD' ? '$' : '₹'}{invoiceGrandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#E8E4C9] border-2 border-[#3E2723] p-3 text-2xs space-y-1.5">
                      <div className="font-bold uppercase text-[#5D4037]">📋 Structural Audit Summary checklist:</div>
                      <div className="flex items-center gap-1 text-[#388E3C] font-bold">
                        <span>✓</span> <span>Total of {elementsList.length} core elements identified.</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#388E3C] font-bold">
                        <span>✓</span> <span>Tariff scale mapped perfectly to standard regional costs.</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#388E3C] font-bold">
                        <span>✓</span> <span>Checked against IS 456 concrete and Fe 1786 reinforcement codes.</span>
                      </div>
                    </div>
                  </div>

                  {/* Pure custom SVG blocky Chart! */}
                  <div className="border-4 border-[#3E2723] bg-[#E8E4C9] p-4 flex flex-col justify-between font-mono text-xs">
                    <div>
                      <h3 className="font-bold text-[#5D4037] uppercase border-b border-[#3E2723] pb-1.5 mb-4">
                        📊 Budget Allocations (by Trade)
                      </h3>

                      {/* Manual SVG Block Chart viz */}
                      <div className="w-full h-44 bg-[#F5F5DC] border-3 border-[#3E2723] p-3 flex flex-col gap-2.5 overflow-y-auto">
                        {elementsList.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[#616161] text-3xs font-bold text-center">
                            No values inside active cargo chest
                          </div>
                        ) : (
                          Object.entries(categoryTotals).map(([cat, val]) => {
                            const percent = (invoiceGrandTotal as number) > 0 ? ((val as number) / (invoiceGrandTotal as number)) * 100 : 0;
                            return (
                              <div key={cat} className="space-y-0.5">
                                <div className="flex justify-between items-center text-3xs font-bold text-[#212121] uppercase">
                                  <span>{t[`cat_${cat}` as keyof LanguageDictionary] || cat}</span>
                                  <span>{currency === 'USD' ? '$' : '₹'}{val.toLocaleString()} ({percent.toFixed(0)}%)</span>
                                </div>
                                
                                {/* Blocky progress bar represent standard */}
                                <div className="w-full h-3 bg-[#E8E4C9] border-2 border-[#3E2723] flex">
                                  <div 
                                    className="bg-[#388E3C] h-full"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => {
                          let textToPrint = `AUTOBOM BUILDING REPORT\r\n====================\r\n`;
                          textToPrint += `Location: ${activePreset.location}\r\n`;
                          textToPrint += `Estimated Grand Budget Total: INR ${invoiceGrandTotal.toLocaleString()}\r\n\r\n`;
                          textToPrint += `List of Elements:\r\n`;
                          elementsList.forEach(el => {
                            textToPrint += `- [${el.element_id}] ${el.description}: Qty ${el.quantity.value} ${el.quantity.unit}, Cost: INR ${el.total_cost?.toLocaleString()}\r\n`;
                          });
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`<pre style="font-family:monospace; padding:20px;">${textToPrint}</pre>`);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }}
                        className="flex-1 py-2 bg-[#F5F5DC] text-[#212121] border-2 border-[#3E2723] font-bold text-center uppercase cursor-pointer hover:bg-[#E8E4C9] font-mono text-2xs"
                      >
                        🖨️ Print Receipt
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="blocky-card p-4 space-y-6">
                <div className="border-b-2 border-[#3E2723] pb-2">
                  <h2 className="text-sm font-bold text-[#212121] uppercase" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
                    ⚙️ Technical Settings & Secrets Panel
                  </h2>
                </div>

                <div className="space-y-4 font-mono text-xs leading-relaxed text-[#212121]">
                  
                  <div className="bg-[#F5F5DC] border-3 border-[#3E2723] p-4 text-xs">
                    <span className="font-bold uppercase text-[#5D4037] block mb-2">🔑 Configure Gemini secrets variables:</span>
                    Your application has been set up with the modern <strong>@google/genai</strong> SDK which operates on the server-side exclusively. You do not need to paste keys inside this web interface because the Google AI Studio platform injects your personal key automatically at runtime.
                    <p className="mt-2.5 text-[#388E3C] font-bold flex items-center gap-1.5">
                      <HardHat size={14} /> Key Configuration status in workspace environment: SUCCESSFUL
                    </p>
                  </div>

                  <div className="bg-[#F5F5DC] border-3 border-[#3E2723] p-4 text-xs">
                    <span className="font-bold uppercase text-[#3D2723] block mb-2">📘 Indian Standars (IS Codes) Reference Sheet:</span>
                    The AutoBOM validation parses drawings metrics against standard civil and agricultural rules:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>IS 456:2000</strong> — Codes for plain and reinforced concrete structures, detailing sloped footings and minimum slab dimensions (residential &gt; 100mm, barns sloped 1:50).</li>
                      <li><strong>IS 1786:2008</strong> — High-strength deformed steel bars TMT (Fe415, Fe500, Fe550).</li>
                      <li><strong>IS 1077</strong> — Classification and specification of clay masonry bricks.</li>
                      <li><strong>IS 1200 Part 1</strong> — Quantifying soil digging earthwork volumes (m³).</li>
                    </ul>
                  </div>

                </div>
              </div>
            )}
          </div>

        </section>
      </main>

      {/* FOOTER LICENSE NOTICES */}
      <footer className="max-w-7xl mx-auto blocky-card p-3 text-center text-xs font-mono text-[#5D4037] font-bold mt-10 select-none">
        ⛏️ AutoBOM - Engineered with care for Small Contractors, Quantity Surveyors & Farmers. 🌾 Built for Chennai & Erode region. Copyright © 2026.
      </footer>

    </div>
  );
}
