import React, { useState } from 'react';
import { PresetDrawing } from '../presets';
import { ZoomIn, ZoomOut, Eye, Layers, ShieldCheck } from 'lucide-react';
import { LanguageDictionary } from '../tamilStrings';

interface DrawingViewerProps {
  preset: PresetDrawing;
  t: LanguageDictionary;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export function DrawingViewer({ preset, t, onRunAnalysis, isLoading }: DrawingViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [activeLayers, setActiveLayers] = useState<{
    concrete: boolean;
    steel: boolean;
    grid: boolean;
    notes: boolean;
  }>({
    concrete: true,
    steel: true,
    grid: true,
    notes: true
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Render highly detailed illustrative blueprints using custom themed SVGs per preset drawing
  const renderBlueprintSVG = () => {
    switch (preset.id) {
      case 'cattle_shed_erode':
        return (
          <svg className="w-full h-full text-[#0277BD]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2">
            {/* Grid Pattern */}
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" strokeWidth="1" opacity="0.3">
                <line x1="50" y1="20" x2="50" y2="280" />
                <line x1="150" y1="20" x2="150" y2="280" />
                <line x1="250" y1="20" x2="250" y2="280" />
                <line x1="350" y1="20" x2="350" y2="280" />
                <line x1="450" y1="20" x2="450" y2="280" />
                <line x1="20" y1="50" x2="480" y2="50" />
                <line x1="20" y1="150" x2="480" y2="150" />
                <line x1="20" y1="250" x2="480" y2="250" />
              </g>
            )}

            {/* Core Concrete Slab */}
            {activeLayers.concrete && (
              <g strokeWidth="3" stroke="#3E2723">
                <rect x="60" y="40" width="380" height="220" fill="#E8E4C9" strokeWidth="4" />
                {/* Slurry drain lane */}
                <rect x="60" y="220" width="380" height="30" fill="#D5CFA5" strokeWidth="2" strokeDasharray="4 2" />
                <text x="70" y="240" fill="#3D2723" stroke="none" fontSize="10" fontWeight="bold">SLURRY LANE SLOPED (1:50) ──▶</text>
              </g>
            )}

            {/* Cubicle Grid */}
            {activeLayers.concrete && (
              <g stroke="#3D2723" strokeWidth="2" fill="#E0DAB4">
                <rect x="80" y="60" width="50" height="120" />
                <rect x="150" y="60" width="50" height="120" />
                <rect x="220" y="60" width="50" height="120" />
                <rect x="290" y="60" width="50" height="120" />
                <rect x="360" y="60" width="50" height="120" />
                
                {/* Drinking Troughs */}
                <rect x="80" y="190" width="330" height="20" fill="#0277BD" stroke="#3D2723" />
              </g>
            )}

            {/* Steel Reinforcement Anchor dots */}
            {activeLayers.steel && (
              <g fill="#D84315" stroke="none">
                <circle cx="85" cy="50" r="4" />
                <circle cx="155" cy="50" r="4" />
                <circle cx="225" cy="50" r="4" />
                <circle cx="295" cy="50" r="4" />
                <circle cx="365" cy="50" r="4" />
                
                <circle cx="85" cy="270" r="4" />
                <circle cx="155" cy="270" r="4" />
                <circle cx="225" cy="270" r="4" />
                <circle cx="295" cy="270" r="4" />
                <circle cx="365" cy="270" r="4" />
              </g>
            )}

            {/* Note Indicators & dimensions callout */}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="monospace" fontWeight="bold">
                <text x="180" y="30" fill="#388E3C">PLAN VIEW - 15.0m x 8.0m [M20 CONCRETE]</text>
                <text x="90" y="115" fill="#5D4037">CUBICLE 1-20</text>
                <text x="120" y="205" fill="#F5F5DC" fontSize="9">AUTO FEEDING WATER TROUGH [12.0m]</text>
                
                {/* Dimension Arrows */}
                <path d="M 60 275 L 440 275" stroke="#F9A825" strokeWidth="2" />
                <polygon points="60,275 68,271 68,279" fill="#F9A825" />
                <polygon points="440,275 432,271 432,279" fill="#F9A825" />
                <rect x="210" y="265" width="80" height="16" fill="#F5F5DC" stroke="#3E2723" strokeWidth="1" />
                <text x="215" y="277" fontSize="10" fill="#212121">L = 15.00 M</text>
              </g>
            )}
          </svg>
        );

      case 'harvesting_pond_perundurai':
        return (
          <svg className="w-full h-full text-[#388E3C]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2">
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" strokeWidth="1" opacity="0.3">
                <line x1="50" y1="20" x2="50" y2="280" />
                <line x1="150" y1="20" x2="150" y2="280" />
                <line x1="250" y1="20" x2="250" y2="280" />
                <line x1="350" y1="20" x2="350" y2="280" />
                <line x1="20" y1="50" x2="480" y2="50" />
                <line x1="20" y1="150" x2="480" y2="150" />
                <line x1="20" y1="250" x2="480" y2="250" />
              </g>
            )}

            {/* Excavation Pit Outline */}
            {activeLayers.concrete && (
              <g strokeWidth="2" stroke="#3E2723">
                {/* outer edge */}
                <rect x="70" y="50" width="360" height="200" fill="#5D4037" opacity="0.8" />
                {/* slope hatch lines */}
                <line x1="70" y1="50" x2="130" y2="100" />
                <line x1="430" y1="50" x2="370" y2="100" />
                <line x1="70" y1="250" x2="130" y2="200" />
                <line x1="430" y1="250" x2="370" y2="200" />
                
                {/* pond bed water */}
                <rect x="130" y="100" width="240" height="100" fill="#0277BD" stroke="#3E2723" strokeWidth="3" />
                <text x="190" y="155" fill="#F5F5DC" stroke="none" fontSize="12" fontWeight="bold">MAIN SILT BASIN STORAGE</text>
              </g>
            )}

            {/* Sluice Inlet */}
            {activeLayers.concrete && (
              <g fill="#9E9E9E" stroke="#3E2723" strokeWidth="2">
                <rect x="30" y="130" width="100" height="40" />
                <line x1="30" y1="150" x2="130" y2="150" strokeDasharray="3 3" />
                <text x="35" y="145" fill="#212121" stroke="none" fontSize="8" fontWeight="bold">CONCRETE FLUME</text>
              </g>
            )}

            {/* Side embankment lines */}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="monospace" fontWeight="bold">
                <text x="140" y="35" fill="#0277BD">TRAPEZOIDAL BULK EXCAVATION (3M DEPTH)</text>
                <text x="140" y="275" fill="#5D4037">RUBBLE PITCHING MORTAR 1:6 SIDE EMBANKMENT</text>
                <text x="350" y="90" fill="#F9A825" fontSize="10">1:1 BANK SLOPE</text>
              </g>
            )}

            {/* PVC Drainage outlets */}
            {activeLayers.steel && (
              <g fill="#0277BD" stroke="#212121" strokeWidth="2">
                <rect x="370" y="120" width="70" height="10" />
                <rect x="370" y="145" width="70" height="10" />
                <rect x="370" y="170" width="70" height="10" />
              </g>
            )}
          </svg>
        );

      case 'grain_silo_gobi':
        return (
          <svg className="w-full h-full text-[#3E2723]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2">
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" strokeWidth="1" opacity="0.3">
                <circle cx="250" cy="150" r="60" />
                <circle cx="250" cy="150" r="110" />
                <line x1="250" y1="20" x2="250" y2="280" />
                <line x1="100" y1="150" x2="400" y2="150" />
              </g>
            )}

            {/* Circular Foundation Pad */}
            {activeLayers.concrete && (
              <g stroke="#3E2723" strokeWidth="3">
                {/* Outer slab frame */}
                <circle cx="250" cy="150" r="110" fill="#E8E4C9" strokeWidth="4" />
                {/* Inside base ring */}
                <circle cx="250" cy="150" r="90" fill="#D2CBA0" strokeDasharray="6 3" />
                {/* Structural tower footing center */}
                <circle cx="250" cy="150" r="60" fill="#9E9E9E" />
              </g>
            )}

            {/* Heavy Reinforcement Net Grid */}
            {activeLayers.steel && (
              <g stroke="#D84315" strokeWidth="1" opacity="0.7">
                <line x1="190" y1="100" x2="310" y2="200" strokeWidth="2" />
                <line x1="190" y1="200" x2="310" y2="100" strokeWidth="2" />
                <line x1="250" y1="90" x2="250" y2="210" strokeWidth="2" />
                <line x1="190" y1="150" x2="310" y2="150" strokeWidth="2" />
                {/* Rebar boundary loop */}
                <circle cx="250" cy="150" r="50" fill="none" stroke="#D84315" strokeWidth="3" />
              </g>
            )}

            {/* Core indicators */}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="monospace" fontWeight="bold">
                <text x="140" y="28" fill="#D84315">M30 CIRCULAR RCC PAD FOR 50-TON TOWER</text>
                <text x="180" y="155" fill="#212121" fontSize="11">BASE DIAMETER = 8.0M</text>
                <text x="210" y="245" fill="#3D2723" fontSize="10">TRUMPET CHUTE SECTION</text>
              </g>
            )}
          </svg>
        );

      case 'fencing_salem':
        return (
          <svg className="w-full h-full text-[#616161]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2">
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" opacity="0.3">
                <line x1="20" y1="100" x2="480" y2="100" />
                <line x1="20" y1="200" x2="480" y2="200" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={i} x1={50 + i * 60} y1="40" x2="50 + i * 60" y2="260" />
                ))}
              </g>
            )}

            {/* Boundary line spanning across screen */}
            <line x1="20" y1="150" x2="480" y2="150" stroke="#3E2723" strokeWidth="3" />

            {/* Dressed Granite Stone post dots */}
            <g fill="#9E9E9E" stroke="#3E2723" strokeWidth="2">
              {Array.from({ length: 7 }).map((_, i) => (
                <rect key={i} x={45 + i * 65} y="138" width="14" height="24" fill="#616161" />
              ))}
            </g>

            {/* Tension barbed wires lines */}
            {activeLayers.steel && (
              <g stroke="#D84315" strokeWidth="1" strokeDasharray="5 2">
                <line x1="20" y1="142" x2="480" y2="142" />
                <line x1="20" y1="146" x2="480" y2="146" />
                <line x1="20" y1="154" x2="480" y2="154" />
                <line x1="20" y1="158" x2="480" y2="158" />
              </g>
            )}

            {/* Concrete dry anchor pad corners */}
            {activeLayers.concrete && (
              <g stroke="#3E2723" strokeWidth="1">
                <circle cx="52" cy="150" r="15" fill="#E8E4C9" strokeWidth="2" opacity="0.6" />
                <circle cx="442" cy="150" r="15" fill="#E8E4C9" strokeWidth="2" opacity="0.6" />
                <text x="35" y="125" fill="#388E3C" stroke="none" fontSize="8" fontWeight="bold">M20 CONCRETE BED</text>
              </g>
            )}

            {/* Text Overlay calls */}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="monospace" fontWeight="bold">
                <text x="140" y="38" fill="#388E3C">6-FT GRANITE STONE POST FENCING SCHEMATIC</text>
                <text x="120" y="270" fill="#212121">BARBED WIRE = 5 LONGITUDINAL LEVEL RUNS</text>
                <text x="180" y="200" fill="#F9A825">POST SPACING = 2.5 METERS</text>
              </g>
            )}
          </svg>
        );

      case 'footing_residential_chennai':
        return (
          <svg className="w-full h-full text-[#212121]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2">
            {/* Outline soil pit */}
            {activeLayers.grid && (
              <rect x="50" y="30" width="400" height="240" stroke="#9E9E9E" strokeWidth="1" strokeDasharray="4 4" />
            )}

            {/* Plain Cement leveling mud mat */}
            {activeLayers.concrete && (
              <g stroke="#3E2723" strokeWidth="2">
                <rect x="80" y="235" width="340" height="25" fill="#E8E4C9" />
                <text x="190" y="250" fill="#5D4037" stroke="none" fontSize="8" fontWeight="bold">M20 MUD MAT PLAIN SUBGRADE [0.08M]</text>
              </g>
            )}

            {/* Foundation Trapezoidal Footing Block */}
            {activeLayers.concrete && (
              <g stroke="#3E2723" fill="#9E9E9E" strokeWidth="2">
                {/* base rectangular part */}
                <rect x="110" y="195" width="280" height="40" />
                {/* sloped pyramid sides */}
                <polygon points="110,195 180,115 320,115 390,195" />
                
                {/* Vertical concrete column trunk */}
                <rect x="220" y="30" width="60" height="85" fill="#616161" />
              </g>
            )}

            {/* Steel bars structural reinforcement basket dots */}
            {activeLayers.steel && (
              <g stroke="#D84315" strokeWidth="2">
                {/* Horizontal lower tie rods */}
                <line x1="120" y1="225" x2="380" y2="225" strokeWidth="3" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <circle key={i} cx={130 + i * 22} cy="215" r="3.5" fill="#212121" stroke="#D84315" />
                ))}

                {/* Vertical Dowels of the pillar Column */}
                <line x1="230" y1="40" x2="230" y2="225" strokeWidth="3" />
                <line x1="270" y1="40" x2="270" y2="225" strokeWidth="3" />
                
                {/* Hook ends */}
                <line x1="230" y1="225" x2="210" y2="225" strokeWidth="3" />
                <line x1="270" y1="225" x2="290" y2="225" strokeWidth="3" />
              </g>
            )}

            {/* Notes references */}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="10" fontFamily="monospace" fontWeight="bold">
                <text x="120" y="24" fill="#388E3C">SYMMETRICAL FOOTING CF-01 TRAPEZOIDAL PROFILE</text>
                <text x="290" y="60" fill="#D84315">VERTICAL COLUMNS DOWELS (12MM)</text>
                <text x="125" y="150" fill="#212121">M25 FOUNDATION SLOPING CONCRETE</text>
              </g>
            )}
          </svg>
        );

      default:
        return (
          <div className="w-full h-64 flex items-center justify-center bg-[#E8E4C9] border-2 border-dashed border-[#616161]">
            <p className="text-[#616161] font-mono text-xs">No preview blueprint available.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-[#E8E4C9] border-4 border-[#3E2723] shadow-[4px_4px_0px_#3E2723] p-4 flex flex-col mb-6">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#3E2723] pb-3 mb-4">
        <div>
          <span className="text-xs font-mono text-[#5D4037] uppercase tracking-wide">
            {t.drawingViewerTitle} / {preset.location}
          </span>
          <h2 className="text-lg font-bold text-[#212121] uppercase mt-0.5" style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '12px', lineHeight: '1.6' }}>
            {preset.title}
          </h2>
        </div>

        {/* Floating Metrics HUD */}
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 font-mono text-xs">
          <div className="bg-[#9E9E9E] text-[#212121] px-2 py-1 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📏 {t.scaleLabel}:</span> {preset.scale}
          </div>
          <div className="bg-[#9E9E9E] text-[#212121] px-2 py-1 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">🖨️ {t.sheetLabel}:</span> {preset.id === 'cattle_shed_erode' ? 'SH-1/2' : 'SH-1/1'}
          </div>
          <div className="bg-[#9E9E9E] text-[#212121] px-2 py-1 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📐 {t.gridLabel}:</span> {preset.gridSize}
          </div>
        </div>
      </div>

      {/* Main Vector Slate Canvas with dynamic zoom scale and padding */}
      <div className="relative overflow-hidden bg-[#F5F5DC] border-4 border-[#3E2723] min-h-[340px] flex items-center justify-center p-4">
        {/* Alignment Reticles */}
        <div className="absolute top-2 left-2 block text-2xs font-mono text-[#9E9E9E] select-none">
          X: 0.00 M, Y: 0.00 M
        </div>
        <div className="absolute top-2 right-2 block text-2xs font-mono text-[#388E3C] select-none font-bold">
          ● REAL-TIME ENGINE STATUS: ONLINE
        </div>

        <div 
          className="transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoom / 100})`, width: '100%', maxWidth: '440px', height: '260px' }}
        >
          {renderBlueprintSVG()}
        </div>
      </div>

      {/* Viewport Control Panel - Pixelized Widgets */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t-2 border-[#3D2723]">
        {/* Layer HUD Toggles */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-[#5D4037] font-bold mr-1 flex items-center gap-1">
            <Layers size={14} /> {t.toggleLayer}:
          </span>
          <button 
            onClick={() => toggleLayer('concrete')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.concrete ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            🧱 Concrete
          </button>
          <button 
            onClick={() => toggleLayer('steel')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.steel ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            ⚙️ Steel
          </button>
          <button 
            onClick={() => toggleLayer('grid')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.grid ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            🏁 Grid Lines
          </button>
          <button 
            onClick={() => toggleLayer('notes')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.notes ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            📝 Notes
          </button>
        </div>

        {/* Zoom Controls & Main Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={handleZoomOut}
            className="p-1 px-2.5 bg-[#9E9E9E] text-[#212121] border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono font-bold text-[#212121] min-w-[40px] text-center bg-[#E8E4C9] px-2 py-1 border-2 border-[#3E2723]">
            {zoom}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-1 px-2.5 bg-[#9E9E9E] text-[#212121] border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <button 
            onClick={onRunAnalysis}
            disabled={isLoading}
            className={`ml-2 px-4 py-2 font-bold uppercase transition-all cursor-pointer border-2 border-[#3E2723] shadow-[3px_3px_0px_#3E2723] active:translate-y-px active:shadow-[1px_1px_0px_#3E2723] disabled:opacity-50 flex items-center gap-2 ${
              isLoading ? 'bg-[#9E9E9E] text-[#212121]' : 'bg-[#F9A825] text-[#212121] hover:bg-[#388E3C] hover:text-white'
            }`}
            style={{ fontFamily: "'Press Start 2P', sans-serif", fontSize: '10px' }}
          >
            <ShieldCheck size={14} />
            {isLoading ? t.analyzingState : t.analyzeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
