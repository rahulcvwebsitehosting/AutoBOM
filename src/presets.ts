import { BOQResponse } from './types';

export interface PresetDrawing {
  id: string;
  title: string;
  category: 'agricultural' | 'civil' | 'residential';
  location: string;
  description: string;
  scale: string;
  gridSize: string;
  imageThumbnail: string; // Base64 or detailed placeholder SVG representation
  sampleData: BOQResponse;
}

export const PRESET_DRAWINGS: PresetDrawing[] = [
  {
    id: 'cattle_shed_erode',
    title: 'Modern Cattle Shed & Dairy Parlour Yard',
    category: 'agricultural',
    location: 'Perundurai, Erode District',
    description: 'Structural slab details for a 20-head cattle dairy shed with slurry disposal lanes, concrete feeding troughs, and insulated roof poles.',
    scale: '1:50',
    gridSize: '15.0m x 8.0m',
    imageThumbnail: 'cattle_shed', // SVG key
    sampleData: {
      project_info: {
        drawing_title: "Modern Cattle Shed Floor Plan & Footings",
        drawing_number: "CS-ERD-2026-03",
        scale: "1:50",
        sheet_number: "SH-1 of 2",
        date: "2026-05-12",
        confidence: 0.96
      },
      elements: [
        {
          element_id: "EL-001",
          category: "excavation",
          type: "hard_soil",
          description: "Excavation for cattle shed pillar footing pits (12 pits total)",
          location: "Grid A1 to C4 - Footing foundations",
          dimensions: { length_m: 1.2, width_m: 1.2, height_m: 1.5 },
          quantity: { value: 25.92, unit: "m3" },
          calculation_notes: "12 pits * (1.2m * 1.2m * 1.5m)",
          is_code_reference: "IS 1200: Part 1 — Soil Earthwork",
          confidence: 0.95,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-002",
          category: "concrete",
          type: "M20",
          description: "Concrete slab for main stable floor, sloped 1:50 to slurry drain",
          location: "Main shed floor bed",
          dimensions: { length_m: 15.0, width_m: 8.0, height_m: 0.15 },
          quantity: { value: 18.0, unit: "m3" },
          calculation_notes: "15.0m length * 8.0m width * 0.15m height",
          is_code_reference: "IS 456:2000 — M20 subgrade slab",
          confidence: 0.92,
          verification_required: false,
          warnings: ["Ensure broom-finished surface to avoid cattle slippage."]
        },
        {
          element_id: "EL-003",
          category: "masonry",
          type: "block_8in",
          description: "8-inch AAC block hollow partition walls with cow cubicle steel anchor grooves",
          location: "Cubicle separation bays",
          dimensions: { length_m: 2.2, width_m: 0.2, height_m: 1.2 },
          quantity: { value: 52.8, unit: "m2" },
          calculation_notes: "20 dividing walls * (2.2m * 1.2m height)",
          is_code_reference: "IS 2185: Block Masonry Code",
          confidence: 0.88,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-004",
          category: "plumbing",
          type: "cattle_trough",
          description: "Specially engineered concrete bovine hydration channel with automatic water flow mechanics",
          location: "Feeding aisle, middle lane",
          dimensions: { length_m: 12.0, width_m: 0.45, height_m: 0.4 },
          quantity: { value: 1, unit: "nos" },
          calculation_notes: "Single integrated unit running parallel to the feed aisle",
          is_code_reference: "CPHEED agricultural standard guidelines",
          confidence: 0.94,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-005",
          category: "steel",
          type: "Fe500",
          description: "Stirrups and holding anchor meshes for roof structural frames",
          location: "Roof column joints",
          dimensions: { diameter_mm: 12 },
          quantity: { value: 450.0, unit: "kg" },
          calculation_notes: "Anchor rods + cross brace wire sets",
          is_code_reference: "IS 1786:2008 — Fe500 TMT",
          confidence: 0.85,
          verification_required: false,
          warnings: []
        }
      ],
      summary: {
        total_elements: 5,
        elements_by_category: { "excavation": 1, "concrete": 1, "masonry": 1, "plumbing": 1, "steel": 1 },
        high_confidence_count: 5,
        review_needed_count: 0,
        overall_confidence: 0.91
      }
    }
  },
  {
    id: 'harvesting_pond_perundurai',
    title: 'Silt Harvesting Farm Pond & Culvert Sluice',
    category: 'agricultural',
    location: 'Gobichettipalayam Border, Perundurai',
    description: 'Excavation profiles and reinforced stone-pitched lining schematics for a village run-off water harvesting pit and irrigation distribution gate.',
    scale: '1:100',
    gridSize: '20.0m x 20.0m',
    imageThumbnail: 'pond_sluice', // SVG key
    sampleData: {
      project_info: {
        drawing_title: "Water Harvesting Silt Pit and Inflow Grid",
        drawing_number: "HP-ERD-2026-14",
        scale: "1:100",
        sheet_number: "SH-1 of 1",
        date: "2026-04-30",
        confidence: 0.93
      },
      elements: [
        {
          element_id: "EL-101",
          category: "excavation",
          type: "soft_soil",
          description: "Bulk trapezoidal excavation for farm pond holding basin",
          location: "Basin block center",
          dimensions: { length_m: 20.0, width_m: 20.0, height_m: 3.0 },
          quantity: { value: 875.0, unit: "m3" },
          calculation_notes: "Trapezoid volume math with 1:1 side slopes: H/6 * (A1 + A4 + 4*Amid)",
          is_code_reference: "IS 1200: Part 1 — Bulk Earthwork",
          confidence: 0.89,
          verification_required: true,
          warnings: ["Soil test required to determine if bund reinforcement is essential to prevent sloughing."]
        },
        {
          element_id: "EL-102",
          category: "concrete",
          type: "M20",
          description: "Mass concrete leveling subgrade for inlet sluice spillway chute",
          location: "Sluice mouth bed",
          dimensions: { length_m: 6.0, width_m: 1.5, height_m: 0.1 },
          quantity: { value: 0.9, unit: "m3" },
          calculation_notes: "6.0m * 1.5m * 0.1m mud mat pad",
          is_code_reference: "IS 456: Plain Cement Concrete mat",
          confidence: 0.95,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-103",
          category: "masonry",
          type: "brick_class_2",
          description: "Stone pitching rubble work in cement mortar 1:6 for basin side embankments",
          location: "Internal pond slopes",
          dimensions: { length_m: 80.0, width_m: 4.2 },
          quantity: { value: 336.0, unit: "m2" },
          calculation_notes: "Basin side perimeter slope run 80.0m * 4.2m width of pitching cover",
          is_code_reference: "IS 1597: Stone Pitching Standard Code",
          confidence: 0.91,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-104",
          category: "plumbing",
          type: "pvc_drainage",
          description: "4-inch subsurface agricultural overflow pipes with filter slots",
          location: "Pond Bund weir wall",
          dimensions: { length_m: 18.0 },
          quantity: { value: 18.0, unit: "m" },
          calculation_notes: "3 runs * 6.0m discharge pipes",
          is_code_reference: "IS 12251: Farm drainage PVC tubes",
          confidence: 0.96,
          verification_required: false,
          warnings: []
        }
      ],
      summary: {
        total_elements: 4,
        elements_by_category: { "excavation": 1, "concrete": 1, "masonry": 1, "plumbing": 1 },
        high_confidence_count: 3,
        review_needed_count: 1,
        overall_confidence: 0.92
      }
    }
  },
  {
    id: 'grain_silo_gobi',
    title: 'Paddy Storage Godown & Silo Base Pad',
    category: 'agricultural',
    location: 'Gobichettipalayam Silt Plains',
    description: 'Heavy architectural designs of an elevated concrete silo base with dynamic grain offloading chute structures and water-sealing cement plaster borders.',
    scale: '1:75',
    gridSize: '12.0m x 12.0m',
    imageThumbnail: 'grain_silo', // SVG key
    sampleData: {
      project_info: {
        drawing_title: "Heavy Silo Base and Sump Details",
        drawing_number: "SG-ERD-2026-88",
        scale: "1:75",
        sheet_number: "SH-1 of 1",
        date: "2026-05-18",
        confidence: 0.97
      },
      elements: [
        {
          element_id: "EL-201",
          category: "concrete",
          type: "M30",
          description: "RCC circular structural pad for 50-tonne steel silo footing",
          location: "Central silo tower foundation",
          dimensions: { length_m: 8.0, width_m: 8.0, height_m: 0.45 },
          quantity: { value: 22.62, unit: "m3" },
          calculation_notes: "Circle area = PI * R² * Thickness = 3.14159 * (4m)² * 0.45m",
          is_code_reference: "IS 456-2000: M30 foundations",
          confidence: 0.97,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-202",
          category: "steel",
          type: "Fe500",
          description: "16mm main rebar grid reinforcement inside deep pad footer",
          location: "Silo central pad grid",
          dimensions: { diameter_mm: 16 },
          quantity: { value: 890.0, unit: "kg" },
          calculation_notes: "Grids top and bottom with 150mm spacing intervals",
          is_code_reference: "IS 1139: Reinforcing Steel codes",
          confidence: 0.92,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-203",
          category: "finish",
          type: "plaster_12mm",
          description: "Damped-surface plaster waterproofing barrier (1:3 Cement/Sand with liquid sika additive)",
          location: "Circular base footer top layer cover",
          dimensions: { length_m: 8.0, width_m: 8.0, thickness_mm: 12 },
          quantity: { value: 50.26, unit: "m2" },
          calculation_notes: "Circle base Area = PI * R² = 3.14159 * 4m * 4m",
          is_code_reference: "IS 1661: General Cement Plastering",
          confidence: 0.91,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-204",
          category: "masonry",
          type: "brick_class_1",
          description: "Premium clay brick supportive retention rim for storage access aisle",
          location: "Unloading access stairs",
          dimensions: { length_m: 4.5, width_m: 0.35, height_m: 0.9 },
          quantity: { value: 4.05, unit: "m2" },
          calculation_notes: "4.5m length * 0.9m height facing stairs",
          is_code_reference: "IS 3102: Strength bricks guide",
          confidence: 0.89,
          verification_required: false,
          warnings: []
        }
      ],
      summary: {
        total_elements: 4,
        elements_by_category: { "concrete": 1, "steel": 1, "finish": 1, "masonry": 1 },
        high_confidence_count: 4,
        review_needed_count: 0,
        overall_confidence: 0.94
      }
    }
  },
  {
    id: 'fencing_salem',
    title: 'Dry Granite Post Boundary Fencing',
    category: 'agricultural',
    location: 'Salem Outer Hills Border',
    description: 'Standard perimeter layout detailing 6-foot local Salem granite stones, barbed tension strings, and embedded concrete anchor footings.',
    scale: '1:150',
    gridSize: '120.0m x 2.0m',
    imageThumbnail: 'fence_layout', // SVG key
    sampleData: {
      project_info: {
        drawing_title: "Farming Perimeter Stone Post Fencing",
        drawing_number: "FN-SLM-2026-09",
        scale: "1:150",
        sheet_number: "SH-1 of 1",
        date: "2026-03-11",
        confidence: 0.94
      },
      elements: [
        {
          element_id: "EL-301",
          category: "other",
          type: "fence_posts",
          description: "Rough dressed local Salem granite fence posts (6-foot size)",
          location: "Perimeter borders, spaced every 2.5 meters",
          dimensions: { length_m: 1.8, width_m: 0.15, height_m: 0.15 },
          quantity: { value: 48, unit: "nos" },
          calculation_notes: "120 meters perimeter divided by 2.5m spacing, plus end corner adjustments",
          is_code_reference: "IS 10505: Agricultural framing poles",
          confidence: 0.95,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-302",
          category: "other",
          type: "wire_mesh",
          description: "5-row double stranded high-tension barbed safety wire",
          location: "Post attachments spanning total border length",
          dimensions: { length_m: 120.0 },
          quantity: { value: 600.0, unit: "m" },
          calculation_notes: "120m perimeter * 5 rows of steel barbed wire lines",
          is_code_reference: "IS 278: Barbed steel wire specifications",
          confidence: 0.92,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-303",
          category: "concrete",
          type: "M20",
          description: "Dry cement concrete base setting mixture for corner anchoring poles (8 critical posts)",
          location: "Corners and gate hinge supports",
          dimensions: { length_m: 0.3, width_m: 0.3, height_m: 0.6 },
          quantity: { value: 0.43, unit: "m3" },
          calculation_notes: "8 critical poles * (0.3m * 0.3m * 0.6m embed depth)",
          is_code_reference: "IS 456-2000 — concrete stabilization",
          confidence: 0.90,
          verification_required: false,
          warnings: ["Poles require 48 hours cure before tying tension wire lines."]
        }
      ],
      summary: {
        total_elements: 3,
        elements_by_category: { "other": 2, "concrete": 1 },
        high_confidence_count: 3,
        review_needed_count: 0,
        overall_confidence: 0.92
      }
    }
  },
  {
    id: 'footing_residential_chennai',
    title: 'RCC Column Symmetrical Footing Pad',
    category: 'civil',
    location: 'Chennai Suburban Phase 2',
    description: 'Standard civil structural section showing concrete footing, clean mud mats, main reinforcer rebar distribution, and vertical pillar dowels.',
    scale: '1:20',
    gridSize: '2.5m x 2.5m',
    imageThumbnail: 'footing_pad', // SVG key
    sampleData: {
      project_info: {
        drawing_title: "Typical Column Footing CF-01 Detailing",
        drawing_number: "FN-CHN-2026-40",
        scale: "1:20",
        sheet_number: "SH-2 of 4",
        date: "2026-05-05",
        confidence: 0.98
      },
      elements: [
        {
          element_id: "EL-401",
          category: "excavation",
          type: "hard_soil",
          description: "Excavation digging for single standard column footing in clay base",
          location: "Footing mark CF-01 location",
          dimensions: { length_m: 1.8, width_m: 1.8, height_m: 1.6 },
          quantity: { value: 5.18, unit: "m3" },
          calculation_notes: "1.8m * 1.8m * 1.6m deep excavations",
          is_code_reference: "IS 1200: Excavations guidelines",
          confidence: 0.98,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-402",
          category: "concrete",
          type: "M20",
          description: "Mud mat plain lean leveling cement subgrade concrete (1:4:8 ratio)",
          location: "Footing bottom base mat bed",
          dimensions: { length_m: 1.8, width_m: 1.8, height_m: 0.08 },
          quantity: { value: 0.26, unit: "m3" },
          calculation_notes: "1.8m * 1.8m * 0.08m bed level thin layer",
          is_code_reference: "IS 456: Plain leveling subgrade concrete",
          confidence: 0.95,
          verification_required: false,
          warnings: []
        },
        {
          element_id: "EL-403",
          category: "concrete",
          type: "M25",
          description: "RCC Trapezoidal footings pad cover (lower portion rectangular + upper trunk pyramid)",
          location: "Footing structured core",
          dimensions: { length_m: 1.5, width_m: 1.5, height_m: 0.4 },
          quantity: { value: 0.72, unit: "m3" },
          calculation_notes: "Lower base box: 1.5 * 1.5 * 0.25 (0.563m³) + Pyramid trunk: 0.15 height * (1.5² + 0.35² + sqrt(1.5²*0.35²))/3 (0.158m³)",
          is_code_reference: "IS 456:2000 — Footing Structures",
          confidence: 0.91,
          verification_required: true,
          warnings: ["Confirm that sloped edges do not slide during concrete slurry pour."]
        },
        {
          element_id: "EL-404",
          category: "steel",
          type: "Fe550",
          description: "Fe550 TMT steel rebar basket wire mesh elements inside footing",
          location: "Base footers cage",
          dimensions: { diameter_mm: 12 },
          quantity: { value: 85.0, unit: "kg" },
          calculation_notes: "Mesh steel spaced at 125mm c/c spacing both directions plus pillar hooks",
          is_code_reference: "IS 1786: Cold steel bars rating",
          confidence: 0.96,
          verification_required: false,
          warnings: []
        }
      ],
      summary: {
        total_elements: 4,
        elements_by_category: { "excavation": 1, "concrete": 2, "steel": 1 },
        high_confidence_count: 3,
        review_needed_count: 1,
        overall_confidence: 0.95
      }
    }
  }
];
