import React, { useState } from 'react';
import { REGIONAL_RATES_DATABASE } from '../ratesData';
import { ElementCategory } from '../types';
import { ShieldAlert, BookOpen, Layers, IndianRupee, Save } from 'lucide-react';
import { LanguageDictionary } from '../tamilStrings';

interface RatesManagerProps {
  activeRegionId: string;
  onRegionChange: (id: string) => void;
  t: LanguageDictionary;
}

export function RatesManager({ activeRegionId, onRegionChange, t }: RatesManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory>('concrete');
  const regionData = REGIONAL_RATES_DATABASE[activeRegionId] || REGIONAL_RATES_DATABASE.tamil_nadu_erode_2026;

  const categoriesList: { key: ElementCategory; label: string; icon: string }[] = [
    { key: 'concrete', label: 'Concrete (RCC/PCC)', icon: '🧱' },
    { key: 'steel', label: 'Steel Reinforcement', icon: '⚙️' },
    { key: 'masonry', label: 'Wall Masonry', icon: '🧱' },
    { key: 'finish', label: 'Finishes & Render', icon: '🖌️' },
    { key: 'excavation', label: 'Soil Excavations', icon: '⛏️' },
    { key: 'wood', label: 'Timber Joinery', icon: '🪵' },
    { key: 'plumbing', label: 'Plumbing Works', icon: '🚰' },
    { key: 'electrical', label: 'Electrical Boxes', icon: '⚡' },
    { key: 'other', label: 'Perimeters & Other', icon: '🏁' }
  ];

  return (
    <div className="w-full bg-[#E8E4C9] border-4 border-[#3E2723] p-4 shadow-[4px_4px_0px_#3E2723] flex flex-col mb-6">
      <div className="border-b-2 border-[#3E2723] pb-3 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h2 className="text-sm font-bold text-[#212121] uppercase" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
            {t.tabRates} / REGIONAL SPEC SHEET
          </h2>
        </div>

        {/* Region Option Widgets */}
        <div className="w-full md:w-auto font-mono text-xs">
          <label className="block text-2xs font-bold text-[#5D4037] pb-1 uppercase">{t.selectRegion}</label>
          <select 
            value={activeRegionId}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-[#F5F5DC] text-[#212121] border-2 border-[#3E2723] px-3 py-1.5 font-bold cursor-pointer outline-none focus:border-[#F9A825] w-full"
          >
            {Object.values(REGIONAL_RATES_DATABASE).map(reg => (
              <option key={reg.region_id} value={reg.region_id}>
                📍 {reg.region_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-[#0277BD]/10 border-2 border-[#0277BD] p-3 mb-4 flex items-start gap-3 text-xs leading-relaxed font-sans font-medium text-[#0277BD]">
        <BookOpen className="shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-bold block uppercase font-mono text-[#0277BD]">Tariff Information & Dry to Wet Factors:</span>
          Rates are drawn from standard state reference tables, specifically audited for Tamil Nadu civil scopes. Calculations include standard dry-to-wet concrete swelling factors (<strong>1.54x</strong>) and regional cutting wastes (<strong>1.05x-1.15x</strong>). Adjusting region changes active base rates instantly.
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Side Category Navigation Sidebar */}
        <div className="md:w-1/3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 shrink-0">
          {categoriesList.map(cat => (
            <button 
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-2 text-xs font-mono font-bold border-2 border-[#3E2723] shadow-[2px_2px_0px_#3E2723] text-left shrink-0 cursor-pointer active:translate-y-px transition-all flex items-center gap-2 ${
                selectedCategory === cat.key 
                  ? 'bg-[#5D4037] text-white' 
                  : 'bg-[#F5F5DC] text-[#212121] hover:bg-[#E8E4C9]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Category Grid with prices */}
        <div className="md:w-2/3 border-4 border-[#3E2723] bg-[#F5F5DC] p-3">
          <h3 className="text-xs font-bold text-[#212121] border-b-2 border-[#3E2723] pb-2 mb-3 uppercase flex items-center justify-between">
            <span>📋 Category Details: {selectedCategory.toUpperCase()}</span>
            <span className="text-[#388E3C]">{regionData.region_name}</span>
          </h3>

          <div className="flex flex-col gap-3">
            {Object.entries(regionData.rates[selectedCategory] || {}).map(([key, rawItem]) => {
              const item = rawItem as any;
              return (
                <div 
                  key={key} 
                  className="bg-[#E8E4C9] border-2 border-[#3E2723] p-3 shadow-[2px_2px_0px_#3E2723] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#212121] uppercase">
                      <span className="bg-[#3E2723] text-[#F5F5DC] px-1 py-0.5 text-3xs font-bold">{key}</span>
                      <span>{item.name}</span>
                    </div>
                    <p className="text-[#616161] font-sans font-medium text-xs leading-normal">
                      💡 Scope: {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <div className="bg-[#388E3C]/10 text-[#388E3C] border-2 border-[#388E3C] px-2.5 py-1 font-bold text-center flex items-center gap-1 text-[13px]">
                      <IndianRupee size={12} />
                      <span>{item.rate.toLocaleString()}</span>
                      <span className="text-2xs text-[#616161]">/ {item.unit}</span>
                    </div>

                    <div className="bg-[#9E9E9E] text-[#212121] px-2 py-1 border-2 border-[#3E2723] text-center font-bold text-3xs" title="Wastage Factor">
                      ⚡ {item.wastage_factor}x
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
