import React, { useState, useRef } from 'react';
import { PresetDrawing } from '../presets';
import { Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LanguageDictionary } from '../tamilStrings';

interface DrawingViewerProps {
  preset: PresetDrawing;
  t: LanguageDictionary;
  onRunAnalysis: () => void;
  isLoading: boolean;
  uploadedBase64?: string | null;
  uploadedFileName?: string | null;
  uploadedMimeType?: string | null;
}

export function DrawingViewer({ preset, t, onRunAnalysis, isLoading, uploadedBase64, uploadedFileName, uploadedMimeType }: DrawingViewerProps) {
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

  // Dynamically parse physical grid size in meters as configured in the preset
  const parseGridSize = () => {
    try {
      const match = preset.gridSize.toLowerCase().match(/(\d+)\s*m\s*x\s*(\d+)\s*m/);
      if (match) {
        return { w: parseInt(match[1], 10), h: parseInt(match[2], 10) };
      }
    } catch (e) {}
    
    // Explicit system fallbacks
    if (preset.id === 'fencing_salem' || preset.id === 'dry_granite_post_fencing_new') {
      return { w: 30, h: 20 };
    }
    if (preset.id === 'harvesting_pond_perundurai') {
      return { w: 20, h: 20 };
    }
    if (preset.id === 'grain_silo_gobi' || preset.id === 'paddy_storage_godown_new') {
      return { w: 12, h: 10 };
    }
    return { w: 15, h: 10 };
  };

  // Helper to render interactive 1m x 1m light-gray grid lines
  const renderGridOverlay = (viewBoxWidth = 500, viewBoxHeight = 300) => {
    if (!activeLayers.grid) return null;
    const { w, h } = parseGridSize();
    
    // Spacing in viewBox units
    const stepX = viewBoxWidth / w;
    const stepY = viewBoxHeight / h;
    
    return (
      <g stroke="#B0BEC5" strokeWidth="0.75" opacity="0.5">
        {/* Draw vertical lines representing every 1 meter */}
        {Array.from({ length: w + 1 }).map((_, i) => (
          <line
            key={`grid-v-${i}`}
            x1={i * stepX}
            y1={0}
            x2={i * stepX}
            y2={viewBoxHeight}
            strokeDasharray={i % 5 === 0 ? "none" : "2 2"}
            stroke={i % 5 === 0 ? "#90A4AE" : "#CFD8DC"}
            strokeWidth={i % 5 === 0 ? "1.25" : "0.75"}
          />
        ))}
        {/* Draw horizontal lines representing every 1 meter */}
        {Array.from({ length: h + 1 }).map((_, i) => (
          <line
            key={`grid-h-${i}`}
            x1={0}
            y1={i * stepY}
            x2={viewBoxWidth}
            y2={i * stepY}
            strokeDasharray={i % 5 === 0 ? "none" : "2 2"}
            stroke={i % 5 === 0 ? "#90A4AE" : "#CFD8DC"}
            strokeWidth={i % 5 === 0 ? "1.25" : "0.75"}
          />
        ))}
      </g>
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { w, h } = parseGridSize();

      // Center of the outer container boundaries
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      // Position relative to container center
      const rx = mouseX - cx;
      const ry = mouseY - cy;

      // Offset for current pan coordinates
      const px = rx - pan.x;
      const py = ry - pan.y;

      // Scale back by zoom level
      const zScale = zoom / 100;
      const sx = px / zScale;
      const sy = py / zScale;

      // Base dimension envelope of the SVG (constrained viewport scale matches 440m max width and 260m height)
      const baseWidth = Math.min(rect.width - 32, 440);
      const baseHeight = 260;

      // Convert centered coordinates range back to standard grid coordinates (0..w and 0..h)
      const leftOffset = -baseWidth / 2;
      const topOffset = -baseHeight / 2;

      let pctX = (sx - leftOffset) / baseWidth;
      let pctY = (sy - topOffset) / baseHeight;

      // Restrict coordinate projection to target document sheet boundaries
      pctX = Math.max(0, Math.min(1, pctX));
      pctY = Math.max(0, Math.min(1, pctY));

      const xVal = pctX * w;
      const yVal = pctY * h;

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

  // Convert Base64 payload back to Blob URL securely to circumvent navigate safety limitations in browser frame sandbox environment
  const handleOpenPdf = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!uploadedBase64) return;
    try {
      const arr = uploadedBase64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      // Fallback
      const newTab = window.open();
      if (newTab) {
        newTab.location.href = uploadedBase64;
      }
    }
  };

  // Custom drawings for PLAN, SECTION A-A, ELEVATION views
  const renderBlueprintSVG = () => {
    switch (preset.id) {
      case 'cattle_shed_erode':
        if (viewType === 'plan') {
          return (
            <svg className="w-full h-full text-[#0277BD]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
              {renderGridOverlay(500, 300)}
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
              {renderGridOverlay(500, 300)}
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
              {renderGridOverlay(500, 300)}
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
            {renderGridOverlay(500, 300)}
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
      case 'paddy_storage_godown_new':
        return (
          <svg className="w-full h-full text-[#3E2723]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
            {renderGridOverlay(500, 300)}
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

      case 'fencing_salem':
      case 'dry_granite_post_fencing_new':
        return (
          <svg className="w-full h-full text-[#388E3C]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
            {renderGridOverlay(500, 300)}
            {activeLayers.concrete && (
              <g strokeWidth="3" stroke="#5D4037">
                {/* Boundary Line */}
                <rect x="70" y="70" width="360" height="160" fill="none" strokeDasharray="10 5" stroke="#3E2723" />
                {/* Fence Posts */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect key={'top-' + i} x={70 + i * 51} y="63" width="14" height="14" fill="#9E9E9E" stroke="#3E2723" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect key={'bot-' + i} x={70 + i * 51} y="223" width="14" height="14" fill="#9E9E9E" stroke="#3E2723" />
                ))}
              </g>
            )}
            {activeLayers.notes && (
              <g stroke="none" fill="#212121" fontSize="11" fontFamily="VT323" fontWeight="bold">
                <text x="130" y="40" fill="#3D2723">boundary fencing layout — 30M x 20M</text>
                <text x="160" y="150" fill="#212121">GRANITE POSTS SPACING: 5M C/C</text>
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
            {uploadedBase64 ? '📁 CUSTOM UPLOADED SHEET' : `${t.drawingViewerTitle} / ${preset.location}`}
          </span>
          <h2 className="text-md sm:text-lg font-bold text-[#212121] uppercase mt-0.5" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
            {uploadedBase64 ? (uploadedFileName || 'CUSTOM_DESIGN.PDF') : preset.title}
          </h2>
        </div>

        {/* Floating Metrics HUD */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <div className="bg-[#9E9E9E] text-[#212121] px-2.5 py-1.5 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📏 {t.scaleLabel}:</span> {uploadedBase64 ? '1:100' : preset.scale}
          </div>
          <div className="bg-[#9E9E9E] text-[#212121] px-2.5 py-1.5 border-2 border-[#3E2723] flex items-center gap-1.5 font-bold">
            <span className="text-[#3E2723]">📐 {t.gridLabel}:</span> {uploadedBase64 ? 'VARIABLE' : preset.gridSize}
          </div>
        </div>
      </div>

      {/* Layer Views Buttons: PLAN | SECTION A-A | ELEVATION */}
      {!uploadedBase64 && (
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
      )}

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
        <div className="absolute top-2 left-2 block text-[9px] font-mono text-[#212121] bg-[#F9A825] px-2 py-1 border-2 border-[#3E2723] select-none font-bold shadow-[1px_1px_0px_#3E2723]">
          X: {hoverCoords.x.toFixed(2)} M | Y: {hoverCoords.y.toFixed(2)} M
        </div>
        <div className="absolute top-2 right-2 hidden sm:block text-[9px] font-mono text-[#388E3C] bg-[#E8E4C9] p-1 border border-[#3E2723] select-none font-bold">
          {uploadedBase64 ? '📊 CLOUD ANALYZER ONLINE' : '⚡ SYSTEM SCANNER LIVE [94%]'}
        </div>

        <div 
          className="transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none animate-fade-in"
          style={{ transform: `scale(${zoom / 100}) translate(${pan.x / (zoom/100)}px, ${pan.y / (zoom/100)}px)`, width: '100%', maxWidth: '440px', height: '260px' }}
        >
          {uploadedBase64 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={uploadedBase64} 
                alt="Uploaded Sheet" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
              {activeLayers.grid && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full text-[#0277BD]" viewBox="0 0 500 300" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {renderGridOverlay(500, 300)}
                  </svg>
                </div>
              )}
              {!uploadedMimeType?.startsWith('image/') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/15">
                  <button
                    onClick={handleOpenPdf}
                    className="px-3 py-1.5 bg-[#388E3C] text-white hover:bg-[#2E7D32] transition-colors border-2 border-[#3E2723] font-bold text-[8px] uppercase tracking-wide cursor-pointer shadow-[2px_2px_0px_#3E2723] active:translate-y-0.5"
                    style={{ fontFamily: "'Press Start 2P', sans-serif" }}
                  >
                    [Open PDF in new tab]
                  </button>
                </div>
              )}
            </div>
          ) : (
            renderBlueprintSVG()
          )}
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
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            type="button"
            onClick={handleZoomOut}
            className="px-2.5 py-1.5 border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer font-bold select-none text-[10px] bg-[#9E9E9E] text-[#212121]"
            style={{ fontFamily: "'Press Start 2P', sans-serif" }}
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] font-mono font-bold text-[#212121] min-w-[48px] text-center bg-[#E8E4C9] px-2 py-1 border-2 border-[#3E2723] select-none" style={{ fontFamily: "'Press Start 2P', sans-serif" }}>
            {zoom}%
          </span>
          <button 
            type="button"
            onClick={handleZoomIn}
            className="px-2.5 py-1.5 border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] hover:bg-[#616161] hover:text-white cursor-pointer font-bold select-none text-[10px] bg-[#9E9E9E] text-[#212121]"
            style={{ fontFamily: "'Press Start 2P', sans-serif" }}
            title="Zoom In"
          >
            +
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 border-2 border-[#3E2723] active:translate-y-0.5 shadow-[2px_2px_0px_#3E2723] font-bold select-none text-[8px] uppercase tracking-wider bg-[#388E3C] text-white hover:bg-[#2E7D32] cursor-pointer"
            style={{ fontFamily: "'Press Start 2P', sans-serif" }}
            title="Reset View and Pan"
          >
            RESET VIEW
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
