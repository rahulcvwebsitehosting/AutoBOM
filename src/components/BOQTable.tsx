import React, { useState } from 'react';
import { BOQElement, ElementCategory, ElementUnit } from '../types';
import { Trash2, Plus, RefreshCw, AlertTriangle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { LanguageDictionary } from '../tamilStrings';

interface BOQTableProps {
  elements: BOQElement[];
  t: LanguageDictionary;
  regionId: string;
  onUpdateElements: (updated: BOQElement[]) => void;
  contractorMarginFraction: number; // 0.05
  projectName: string;
  currency: 'INR' | 'USD';
}

export function BOQTable({ elements, t, regionId, onUpdateElements, contractorMarginFraction, projectName, currency }: BOQTableProps) {
  const symbol = currency === 'USD' ? '$' : '₹';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);
  const [editingQty, setEditingQty] = useState<number>(0);

  // Form for adding a new structural material block
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newId, setNewId] = useState<string>('EL-CUSTOM');
  const [newCat, setNewCat] = useState<ElementCategory>('concrete');
  const [newType, setNewType] = useState<string>('M25');
  const [newDesc, setNewDesc] = useState<string>('Custom reinforced pad mix');
  const [newLoc, setNewLoc] = useState<string>('General Yard boundary');
  const [newQty, setNewQty] = useState<number>(1);
  const [newUnit, setNewUnit] = useState<ElementUnit>('m3');
  const [newRate, setNewRate] = useState<number>(4500);
  const [newWaste, setNewWaste] = useState<number>(1.54);
  const [newNotes, setNewNotes] = useState<string>('Manual calculation entry');
  const [newCodeRef, setNewCodeRef] = useState<string>('IS 456 compliance');

  const startEdit = (el: BOQElement) => {
    setEditingId(el.element_id);
    setEditingRate(el.unit_rate || 0);
    setEditingQty(el.quantity.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const updated = elements.map(el => {
      if (el.element_id === id) {
        const totalCost = currency === 'USD' 
          ? Math.round((editingQty * editingRate) * 100) / 100 
          : Math.round(editingQty * editingRate);

        return {
          ...el,
          quantity: { ...el.quantity, value: editingQty },
          unit_rate: editingRate,
          total_cost: totalCost,
          calculation_notes: `${editingQty} * ${editingRate}`
        };
      }
      return el;
    });
    onUpdateElements(updated);
    setEditingId(null);
  };

  const deleteItem = (id: string) => {
    const updated = elements.filter(el => el.element_id !== id);
    onUpdateElements(updated);
  };

  const triggerAddForm = () => {
    setShowAddForm(!showAddForm);
    // Auto increment custom ID
    setNewId(`EL-CUSTOM-${elements.length + 1}`);
  };

  const submitAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = currency === 'USD' 
      ? Math.round((newQty * newRate) * 100) / 100 
      : Math.round(newQty * newRate);
    const newItem: BOQElement = {
      element_id: newId,
      category: newCat,
      type: newType,
      description: newDesc,
      location: newLoc,
      dimensions: {
        length_m: 1,
        width_m: 1,
        height_m: 1
      },
      quantity: {
        value: newQty,
        unit: newUnit
      },
      calculation_notes: newNotes || `${newQty} ${newUnit} at ${currency === 'USD' ? '$' : '₹'}${newRate}`,
      is_code_reference: newCodeRef,
      confidence: 1.0,
      verification_required: false,
      warnings: [],
      unit_rate: newRate,
      total_cost: totalCost
    };

    onUpdateElements([...elements, newItem]);
    setShowAddForm(false);
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'concrete': return 'bg-[#5D4037] text-[#F5F5DC] border-[#3E2723]';
      case 'steel': return 'bg-[#9E9E9E] text-[#212121] border-[#616161]';
      case 'masonry': return 'bg-[#F9A825] text-[#212121] border-[#3E2723]';
      case 'excavation': return 'bg-[#E8E4C9] text-[#5D4037] border-[#3E2723]';
      case 'finish': return 'bg-[#0277BD] text-white border-[#3E2723]';
      default: return 'bg-[#388E3C] text-white border-[#3E2723]';
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#388E3C] text-white px-2 py-0.5 border-2 border-[#3E2723]">
          🛡️ {(score * 100).toFixed(0)}%
        </span>
      );
    } else if (score >= 0.5) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#F9A825] text-black px-2 py-0.5 border-2 border-[#3E2723]">
          ⚠️ {(score * 100).toFixed(0)}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#D84315] text-white px-2 py-0.5 border-2 border-[#3D2723]">
          💀 {(score * 100).toFixed(0)}%
        </span>
      );
    }
  };

  // Safe client CSV Exporter
  const handleCSVExport = () => {
    let csvContent = "\uFEFFItem,Description,Qty,Unit,Rate,Amount,Confidence\r\n";

    elements.forEach(el => {
      const confidencePercent = Math.round(el.confidence * 100) + "%";
      const row = [
        `"${el.element_id.replace(/"/g, '""')}"`,
        `"${el.description.replace(/"/g, '""')}"`,
        el.quantity.value,
        `"${el.quantity.unit.replace(/"/g, '""')}"`,
        el.unit_rate || 0,
        el.total_cost || 0,
        `"${confidencePercent}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Replace non-alphanumeric chars with underscore for standard filesystem names
    const cleanProjectName = projectName ? projectName.replace(/[^a-zA-Z0-9]/g, "_") : "Project";
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `AutoBOM_${cleanProjectName}_${dateStr}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-[#E8E4C9] border-4 border-[#3E2723] shadow-[4px_4px_0px_#3E2723] p-4 flex flex-col">
      {/* Table Title and Control Board */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#3E2723] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎒</span>
          <h2 className="text-sm font-bold text-[#212121] uppercase" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
            {t.boqTitle}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            type="button"
            onClick={triggerAddForm}
            className="px-3 py-1.5 bg-[#388E3C] text-white font-mono text-xs font-bold border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] flex items-center gap-1 cursor-pointer hover:bg-[#66BB6A]"
          >
            <Plus size={14} /> {t.actionAdd}
          </button>
          
          <button 
            type="button"
            onClick={handleCSVExport}
            className="px-3 py-1.5 bg-[#0277BD] text-white font-mono text-xs font-bold border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] flex items-center gap-1 cursor-pointer hover:bg-[#039BE5]"
          >
            <FileSpreadsheet size={14} /> {t.actionDownload}
          </button>
        </div>
      </div>

      {/* Add New Material Form Modal (Pure Retro Block Overlay CSS) */}
      {showAddForm && (
        <form onSubmit={submitAddForm} className="bg-[#F5F5DC] border-4 border-[#3E2723] p-4 mb-4 shadow-[4px_4px_0px_#3E2723] font-mono text-xs">
          <h3 className="text-xs font-bold text-[#5D4037] pb-2 border-b-2 border-[#3E2723] mb-3 uppercase flex items-center gap-1.5">
            🔨 Add Structural Block to Inventory Chest
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">BLOCK ID:</label>
              <input 
                type="text" 
                value={newId} 
                onChange={(e) => setNewId(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121] outline-none focus:border-[#F9A825]"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">TRADE CATEGORY:</label>
              <select 
                value={newCat} 
                onChange={(e) => setNewCat(e.target.value as ElementCategory)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121] outline-none cursor-pointer"
              >
                <option value="concrete">Concrete (RCC/PCC)</option>
                <option value="steel">Reinforcing Steel</option>
                <option value="masonry">Clay Masonry</option>
                <option value="wood">Timber support</option>
                <option value="finish">Finishing Tiles</option>
                <option value="excavation">Excavations</option>
                <option value="plumbing">Hydraulic/Plumbing</option>
                <option value="electrical">Switchboards</option>
                <option value="other">Fences/Boundary</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">MATERIAL DRAFT RATING (e.g. M25, Fe500):</label>
              <input 
                type="text" 
                value={newType} 
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">SPECS DESCRIPTION:</label>
              <input 
                type="text" 
                value={newDesc} 
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">BLUEPRINT ROW LOCATION:</label>
              <input 
                type="text" 
                value={newLoc} 
                onChange={(e) => setNewLoc(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">QUANTITY:</label>
              <input 
                type="number" 
                step="any"
                value={newQty} 
                onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">QUANTITY UNIT:</label>
              <select 
                value={newUnit} 
                onChange={(e) => setNewUnit(e.target.value as ElementUnit)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121] cursor-pointer"
              >
                <option value="m3">m³ (Volume)</option>
                <option value="m2">m² (Surface)</option>
                <option value="m">m (Length)</option>
                <option value="kg">kg (Weight)</option>
                <option value="nos">nos (Count)</option>
                <option value="lumpsum">lumpsum (LS)</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">BASE RATE (₹):</label>
              <input 
                type="number" 
                value={newRate} 
                onChange={(e) => setNewRate(parseInt(e.target.value) || 0)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">WASTAGE FACTOR:</label>
              <input 
                type="number" 
                step="0.01"
                value={newWaste} 
                onChange={(e) => setNewWaste(parseFloat(e.target.value) || 0.00)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">MATH CALC NOTE:</label>
              <input 
                type="text" 
                value={newNotes} 
                placeholder="Length x Width x Height"
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
              />
            </div>
            <div>
              <label className="block text-2xs font-bold pb-1 text-[#5D4037]">INDIAN STANDARD CODE REF:</label>
              <input 
                type="text" 
                value={newCodeRef} 
                placeholder="e.g. IS 456, IS 1200 Part 1"
                onChange={(e) => setNewCodeRef(e.target.value)}
                className="w-full bg-[#E8E4C9] border-2 border-[#3E2723] p-1.5 text-xs text-[#212121]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t border-[#3E2723] pt-3">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 bg-[#9E9E9E] text-black border-2 border-[#3E2723] font-bold cursor-pointer hover:bg-[#616161] hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 bg-[#388E3C] text-white border-2 border-[#3E2723] font-bold cursor-pointer hover:bg-[#66BB6A]"
            >
              Add Block
            </button>
          </div>
        </form>
      )}

      {/* Main Table responsive scroll container */}
      <div className="w-full overflow-x-auto border-4 border-[#3E2723] bg-[#F5F5DC]">
        <table className="w-full text-left border-collapse font-sans min-w-[900px]">
          <thead>
            <tr className="bg-[#5D4037] text-[#F5F5DC] font-mono text-xs border-b-4 border-[#3E2723]">
              <th className="p-3 border-r-2 border-[#3E2723] text-center w-12">{t.eleId}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-36">{t.eleCategory}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-56">{t.eleDescription}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-28">{t.eleLocation}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-24 text-right">{t.eleQuantity}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-32 text-right">{t.eleRate}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-16 text-center">{t.eleWaste}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-32 text-right">{t.eleCost}</th>
              <th className="p-3 border-r-2 border-[#3E2723] w-40">{t.eleCodeRef}</th>
              <th className="p-3 text-center w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#3E2723] font-sans font-medium text-[16px] text-[#212121]">
            {elements.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-[#616161] font-mono text-xs">
                  💼 No materials in active chest. Import blueprint or add items manually.
                </td>
              </tr>
            ) : (
              elements.map((el) => {
                const wasteFactor = el.category === 'concrete' ? 1.54 : el.category === 'steel' ? 1.05 : el.category === 'masonry' ? 1.10 : el.category === 'finish' ? 1.15 : 1.1;
                const isEditing = editingId === el.element_id;

                return (
                  <tr 
                    key={el.element_id} 
                    className={`hover:bg-[#E8E4C9] transition-colors border-b border-[#3E2723] ${
                      el.verification_required ? 'bg-[#F9A825]/10' : ''
                    }`}
                  >
                    {/* ID Badge */}
                    <td className="p-3 border-r border-[#3E2723] text-center font-mono text-xs font-bold text-[#5D4037]">
                      {el.element_id}
                    </td>

                    {/* Category Block */}
                    <td className="p-3 border-r border-[#3E2723]">
                      <span className={`inline-block px-2.5 py-1 text-2xs font-mono font-bold uppercase border-2 text-center w-full ${getCategoryTheme(el.category)}`}>
                        {t[`cat_${el.category}` as keyof LanguageDictionary] || el.category}
                      </span>
                    </td>

                    {/* Description Specs & warnings triggers */}
                    <td className="p-3 border-r border-[#3E2723] leading-relaxed">
                      <div className="font-bold text-[#212121]">{el.description}</div>
                      
                      {/* Math Note */}
                      <span className="block font-mono text-xs text-[#616161] mt-1 italic">
                        📐 Math: {el.calculation_notes}
                      </span>

                      {/* Warnings pill */}
                      {el.warnings && el.warnings.length > 0 && (
                        <div className="mt-1.5 flex flex-col gap-1">
                          {el.warnings.map((w, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-[#D84315] text-white text-2xs font-mono font-bold px-2 py-0.5 border border-[#3E2723]">
                              <AlertTriangle size={10} /> {w}
                            </span>
                          ))}
                        </div>
                      )}

                      {el.verification_required && (
                        <span className="mt-1 inline-flex items-center gap-1 bg-[#F9A825] text-black text-2xs font-mono font-bold px-2 py-0.5 border border-[#3E2723]">
                          <AlertTriangle size={10} /> RISK FLAGGED: Review needed
                        </span>
                      )}
                    </td>

                    {/* Grid map Location */}
                    <td className="p-3 border-r border-[#3E2723] font-mono text-xs font-bold text-center">
                      📌 {el.location}
                    </td>

                    {/* Quantity cell */}
                    <td className="p-3 border-r border-[#3E2723] text-right font-mono font-bold">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="any"
                          value={editingQty}
                          onChange={(e) => setEditingQty(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-[#F5F5DC] border-2 border-[#3E2723] p-1 text-right font-bold"
                        />
                      ) : (
                        <span>
                          {el.quantity.value.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                        </span>
                      )}
                      <span className="ml-1 text-[#616161] text-xs font-normal">
                        {el.quantity.unit}
                      </span>
                    </td>

                    {/* Local base rate & override inline input */}
                    <td className="p-3 border-r border-[#3E2723] text-right font-mono font-bold text-[#388E3C]">
                      {isEditing ? (
                        <div className="flex items-center justify-end">
                          <span className="mr-0.5 text-xs text-[#616161]">{symbol}</span>
                          <input 
                            type="number" 
                            value={editingRate}
                            onChange={(e) => setEditingRate(parseInt(e.target.value) || 0)}
                            className="w-20 bg-[#F5F5DC] border-2 border-[#3E2723] p-1 text-right font-bold text-[#388E3C] focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span>
                          {symbol}{el.unit_rate?.toLocaleString() || 0}
                        </span>
                      )}
                    </td>

                    {/* Waste factor value */}
                    <td className="p-3 border-r border-[#3E2723] text-center font-mono text-xs font-bold text-[#5D4037]">
                      {wasteFactor.toFixed(2)}x
                    </td>

                    {/* Total cost calculated */}
                    <td className="p-3 border-r border-[#3E2723] text-right font-mono font-bold">
                      {symbol}{el.total_cost?.toLocaleString() || 0}
                    </td>

                    {/* IS Code Compliance & Confidence */}
                    <td className="p-3 border-r border-[#3E2723] leading-normal">
                      <div className="text-xs bg-[#E8E4C9] p-1 border-2 border-[#3E2723] font-mono mb-1.5 flex items-center gap-1 font-bold">
                        📋 {el.is_code_reference}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-mono font-bold text-[#616161]">Confidence</span>
                        {getConfidenceBadge(el.confidence)}
                      </div>
                    </td>

                    {/* Actions tools (Bevel and block look) */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col gap-1.5 items-stretch">
                        {isEditing ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => saveEdit(el.element_id)}
                              className="px-2 py-1 bg-[#388E3C] text-white font-mono text-2xs font-bold border-2 border-[#3E2723] cursor-pointer hover:bg-[#66BB6A]"
                            >
                              Save
                            </button>
                            <button 
                              type="button"
                              onClick={cancelEdit}
                              className="px-2 py-1 bg-[#9E9E9E] text-black border-2 border-[#3E2723] font-mono text-2xs font-bold cursor-pointer hover:bg-[#616161]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              type="button"
                              onClick={() => startEdit(el)}
                              className="px-2 py-1 bg-[#F9A825] text-black font-mono text-2xs font-bold border-2 border-[#3E2723] cursor-pointer hover:bg-[#ffbe53]"
                            >
                              ✏️ Override
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteItem(el.element_id)}
                              className="p-1 bg-[#D84315] text-white border-2 border-[#3D2723] cursor-pointer hover:bg-orange-600 flex items-center justify-center"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
