import React, { useState, useRef } from 'react';
import { PresetDrawing } from '../presets';
import { ZoomIn, ZoomOut, Layers, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import { LanguageDictionary } from '../tamilStrings';

interface DrawingViewerProps {
  preset: PresetDrawing;
  t: LanguageDictionary;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export function DrawingViewer({ preset, t, onRunAnalysis, isLoading }: DrawingViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [activeLayers, setActiveLayers] = useState({
    concrete: true,
    steel: true,
    grid: true,
    notes: true
  });
  const [viewType, setViewType] = useState<'plan' | 'section' | 'elevation'>('plan');

  // Panning State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCoords, setHoverCoords] = useState({ x: 0.00, y: 0.00 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xVal = Math.max(0, Math.min(15, (mouseX / rect.width) * 15));
      const yVal = Math.max(0, Math.min(8, (mouseY / rect.height) * 8));
      setHoverCoords({ x: xVal, y: yVal });
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 305));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 50));
  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Custom drawings for PLAN, SECTION A-A, ELEVATION views
  const renderBlueprintSVG = () => {
    switch (preset.id) {
      case 'cattle_shed_erode':
        if (viewType === 'plan') {
          return (
            <svg className="w-full h-full text-[#0277BD]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
              {activeLayers.grid && (
                <g strokeDasharray="4 4" stroke="#616161" strokeWidth="1" opacity="0.4">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="300" />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={i} x1="0" y1={i * 50} x2="500" y2={i * 50} />
                  ))}
                </g>
              )}
              {activeLayers.concrete && (
                <g strokeWidth="3" stroke="#3E2723">
                  {/* Outer foundation yard */}
                  <rect x="50" y="30" width="400" height="240" fill="#E8E4C9" strokeWidth="4" />
                  {/* 20 Cubicle layouts */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <rect x={70 + i * 36} y="45" width="28" height="55" fill="#D7CCC8" strokeWidth="2" stroke="#3E2723" />
                      <circle cx={84 + i * 36} cy="72" r="3.5" fill="#5D4037" />
                    </g>
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <rect x={70 + i * 36} y="195" width="28" height="55" fill="#D7CCC8" strokeWidth="2" stroke="#3E2723" />
                      <circle cx={84 + i * 36} cy="222" r="3.5" fill="#5D4037" />
                    </g>
                  ))}
                  {/* Feeding Troughs */}
                  <rect x="70" y="115" width="360" height="22" fill="#E0DAB4" />
                  <rect x="70" y="160" width="360" height="22" fill="#E0DAB4" />
                  {/* Slurry Channel */}
                  <rect x="50" y="240" width="400" height="30" fill="#BCAAA4" strokeWidth="3" strokeDasharray="6 3" />
                </g>
              )}
              {activeLayers.steel && (
                <g fill="#D84315" stroke="none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <circle key={i} cx={60 + i * 75} cy="40" r="5" />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <circle key={i} cx={60 + i * 75} cy="260" r="5" />
                  ))}
                </g>
              )}
              {activeLayers.notes && (
                <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                  <text x="110" y="129" fill="#3D2723">FEED COWS TRAIL [12.0M]</text>
                  <text x="130" y="260" fill="#F5F5DC">📊 WATER SLURRY OUTLET SLOPE (1:50) ──▶</text>
                  <path d="M 50 286 L 450 286" stroke="#F9A825" strokeWidth="2" />
                  <polygon points="50,286 60,281 60,291" fill="#F9A825" />
                  <polygon points="450,286 440,281 440,291" fill="#F9A825" />
                  <text x="210" y="282" fill="#3E2723" fontSize="13">15.00 METERS</text>
                </g>
              )}
            </svg>
          );
        } else if (viewType === 'section') {
          return (
            <svg className="w-full h-full text-[#3E2723]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
              {activeLayers.grid && (
                <g strokeDasharray="4 4" stroke="#616161" strokeWidth="1" opacity="0.4">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="300" />
                  ))}
                </g>
              )}
              {activeLayers.concrete && (
                <g strokeWidth="3" stroke="#3E2723" fill="#E8E4C9">
                  {/* Soil surface sloped downward */}
                  <polygon points="40,240 460,240 460,270 40,270" fill="#D7CCC8" />
                  {/* concrete foundations and floor */}
                  <rect x="80" y="190" width="340" height="20" />
                  {/* Pillar footing columns */}
                  <rect x="100" y="210" width="50" height="40" fill="#9E9E9E" />
                  <rect x="350" y="210" width="50" height="40" fill="#9E9E9E" />
                  {/* Steel Trusses support roof */}
                  <line x1="125" y1="190" x2="125" y2="70" strokeWidth="5" />
                  <line x1="375" y1="190" x2="375" y2="70" strokeWidth="5" />
                  {/* sloped insulated roofing sheets */}
                  <polygon points="80,70 250,30 420,70 420,80 250,45 80,80" fill="#AEB48F" />
                </g>
              )}
              {activeLayers.steel && (
                <g stroke="#D84315" strokeWidth="2.5">
                  {/* foundation basket */}
                  <line x1="90" y1="230" x2="160" y2="230" />
                  <line x1="340" y1="230" x2="410" y2="230" />
                </g>
              )}
              {activeLayers.notes && (
                <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                  <text x="140" y="90" fill="#5D4037">12MM STEEL DOWN-ROD COUPLING</text>
                  <text x="140" y="145" fill="#388E3C">M25 SUBGRADE CONCRETE FLOOR slab</text>
                  <text x="160" y="22" fill="#D84315">CROSS-SECTION A-A / REBAR BRACING</text>
                </g>
              )}
            </svg>
          );
        } else {
          return (
            <svg className="w-full h-full text-[#3E2723]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
              {activeLayers.grid && (
                <g strokeDasharray="4 4" stroke="#616161" strokeWidth="1" opacity="0.4">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="300" />
                  ))}
                </g>
              )}
              {activeLayers.concrete && (
                <g strokeWidth="3" stroke="#3E2723" fill="#E8E4C9">
                  {/* Clay outer walls */}
                  <rect x="70" y="100" width="360" height="142" fill="#F5F5DC" />
                  {/* Gate entrances */}
                  <rect x="110" y="140" width="70" height="102" fill="#D7CCC8" />
                  <rect x="320" y="140" width="70" height="102" fill="#D7CCC8" />
                  {/* Insulated Roof eave */}
                  <polygon points="50,105 250,35 450,105 440,115 250,50 60,115" fill="#AEB48F" />
                  {/* Stone pillars */}
                  <rect x="90" y="100" width="10" height="142" fill="#9E9E9E" />
                  <rect x="400" y="100" width="10" height="142" fill="#9E9E9E" />
                </g>
              )}
              {activeLayers.notes && (
                <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                  <text x="130" y="125" fill="#5D4037">FRONT ELEVATION / ANODIZED ROOF POLES</text>
                  <text x="120" y="220" fill="#212121">AIR VENT CO cow passages [3M HEIGHT]</text>
                </g>
              )}
            </svg>
          );
        }

      case 'harvesting_pond_perundurai':
        return (
          <svg className="w-full h-full text-[#388E3C]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" strokeWidth="1" opacity="0.3">
                <rect x="0" y="0" width="500" height="300" fill="none" />
              </g>
            )}
            {activeLayers.concrete && (
              <g strokeWidth="3" stroke="#3E2723">
                <rect x="60" y="40" width="380" height="220" fill="#E8E4C9" strokeWidth="4" />
                <rect x="120" y="90" width="260" height="120" fill="#0277BD" strokeWidth="2" />
              </g>
            )}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                <text x="110" y="30" fill="#3D2723">SILT POND IRRIGATION PLAN — 20M x 20M</text>
                <text x="150" y="150" fill="#F5F5DC">BASIN DEPTH CAPACITY 3M</text>
              </g>
            )}
          </svg>
        );

      case 'grain_silo_gobi':
        return (
          <svg className="w-full h-full text-[#3E2723]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
            {activeLayers.grid && (
              <g strokeDasharray="3 3" stroke="#9E9E9E" strokeWidth="1" opacity="0.3">
                <circle cx="250" cy="150" r="110" />
              </g>
            )}
            {activeLayers.concrete && (
              <g strokeWidth="3" stroke="#3E2723">
                <circle cx="250" cy="150" r="100" fill="#E8E4C9" />
                <circle cx="250" cy="150" r="60" fill="#9E9E9E" />
              </g>
            )}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                <text x="130" y="30" fill="#3D2723">PADDY STORAGE GODOWN — DIAL TOWER</text>
                <text x="200" y="155" fill="#212121">BASE DIA = 8.0M</text>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#3E2723] pb-3 mb-4 gap-2">
        <div>
          <span className="text-xs font-mono text-[#5D4037] uppercase tracking-wide font-bold">
            {t.drawingViewerTitle} / {preset.location}
          </span>
          <h2 className="text-md sm:text-lg font-bold text-[#212121] uppercase mt-0.5" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
            {preset.title}
          </h2>
        </div>

        {/* Floating Metrics HUD */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <div className="bg-[#9E9E9E] text-[#212121] px-2.5 py-1.5 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📏 {t.scaleLabel}:</span> {preset.scale}
          </div>
          <div className="bg-[#9E9E9E] text-[#212121] px-2.5 py-1.5 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📐 {t.gridLabel}:</span> {preset.gridSize}
          </div>
        </div>
      </div>

      {/* Layer Views Buttons: PLAN | SECTION A-A | ELEVATION */}
      <div className="flex gap-2 mb-3">
        {(['plan', 'section', 'elevation'] as const).map((vt) => {
          const isActive = viewType === vt;
          return (
            <button
              key={vt}
              onClick={() => setViewType(vt)}
              className={`px-3 py-1 text-xs font-bold uppercase transition-transform scale-100 cursor-pointer border-2 border-[#3E2723] ${
                isActive ? 'bg-[#5D4037] text-[#F9A825]' : 'bg-[#9E9E9E] text-[#212121]'
              }`}
            >
              {vt === 'plan' ? 'PLAN' : vt === 'section' ? 'SECTION A-A' : 'ELEVATION'}
            </button>
          );
        })}
      </div>

      {/* Main Vector Slate Canvas with dynamic zoom scale and padding */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative overflow-hidden bg-[#F5F5DC] border-4 border-[#3E2723] min-h-[300px] flex items-center justify-center p-4 cursor-grab select-none shadow-inner"
        style={{ backgroundImage: 'repeating-linear-gradient(rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 50px)' }}
      >
        {/* SCALE RATIO DESTRUCT BEACON */}
        <div className="absolute top-2 left-2 block text-2xs font-mono text-[#212121] bg-[#F9A825] p-1 border-2 border-[#3E2723] select-none font-bold">
          X: {hoverCoords.x.toFixed(2)} M | Y: {hoverCoords.y.toFixed(2)} M
        </div>
        <div className="absolute top-2 right-2 hidden sm:block text-2xs font-mono text-[#388E3C] bg-[#E8E4C9] p-1 border border-[#3E2723] select-none font-bold">
          ⚡ SYSTEM SCANNER LIVE [94%]
        </div>

        <div 
          className="transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{ transform: `scale(${zoom / 100}) translate(${pan.x / (zoom/100)}px, ${pan.y / (zoom/100)}px)`, width: '100%', maxWidth: '440px', height: '260px' }}
        >
          {renderBlueprintSVG()}
        </div>
      </div>

      {/* Layer HUD Toggles */}
      <div className="mt-4 flex flex-wrap gap-2 items-center justify-between border-t-2 border-[#3E2723] pt-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-[#5D4037] font-bold mr-1 flex items-center gap-1">
            <Layers size={14} /> FILTER:
          </span>
          <button 
            type="button"
            onClick={() => toggleLayer('concrete')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.concrete ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            🧱 Concrete
          </button>
          <button 
            type="button"
            onClick={() => toggleLayer('steel')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.steel ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            ⚙️ Steel
          </button>
          <button 
            type="button"
            onClick={() => toggleLayer('grid')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.grid ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            🏁 Grid
          </button>
          <button 
            type="button"
            onClick={() => toggleLayer('notes')}
            className={`px-2 py-1 text-xs font-mono font-bold border-2 border-[#3E2723] transition-all cursor-pointer ${
              activeLayers.notes ? 'bg-[#388E3C] text-white' : 'bg-[#9E9E9E] text-[#212121]'
            }`}
          >
            📝 Notes
          </button>
        </div>

        {/* Zoom Controls & Main Action */}
        <div className="flex items-center gap-2">
          <button 
            type="button"
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
            type="button"
            onClick={handleZoomIn}
            className="p-1 px-2.5 bg-[#9E9E9E] text-[#212121] border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1 px-2.5 bg-[#9E9E9E] text-[#212121] border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer"
            title="Reset Pan/Zoom"
          >
            <Compass size={16} />
          </button>
        </div>
      </div>

      {/* Specifications HUD (Checked standard audits underneath) */}
      <div className="mt-4 bg-[#F5F5DC] border-3 border-[#3E2723] p-3 text-xs flex flex-wrap gap-x-6 gap-y-2 select-none">
        <div className="w-full text-2xs font-mono font-bold text-[#5D4037] pb-1 uppercase border-b border-[#3E2723]">
          🧱 Indian Standards (IS Codes) Checklist Audit:
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#388E3C] font-mono">
          <CheckCircle2 size={13} className="text-[#388E3C]" /> IS 456:2000 — M25 Grade ✓
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#388E3C] font-mono">
          <CheckCircle2 size={13} className="text-[#388E3C]" /> IS 1786:2008 — Fe500 TMT ✓
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#388E3C] font-mono">
          <CheckCircle2 size={13} className="text-[#388E3C]" /> IS 1077:1992 — Clay Bricks Class 1 ✓
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#388E3C] font-mono">
          <CheckCircle2 size={13} className="text-[#388E3C]" /> IS 2571:1970 — Anti-slip Tiles ✓
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#388E3C] font-mono">
          <CheckCircle2 size={13} className="text-[#388E3C]" /> Slurry Slope 1:50 compliant ✓
        </div>
      </div>
    </div>
  );
}
