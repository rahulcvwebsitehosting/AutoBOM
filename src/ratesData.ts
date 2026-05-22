import { RegionalRates, ElementCategory } from './types';

export const REGIONAL_RATES_DATABASE: Record<string, RegionalRates> = {
  tamil_nadu_erode_2026: {
    region_id: 'tamil_nadu_erode_2026',
    region_name: 'Erode & Perundurai (Agricultural Hub)',
    rates: {
      concrete: {
        M20: { name: 'M20 structural concrete', rate: 4300, unit: 'm³', wastage_factor: 1.54, description: 'Standard agricultural slab, pathways, cattle yard' },
        M25: { name: 'M25 RCC concrete', rate: 4800, unit: 'm³', wastage_factor: 1.54, description: 'Beams, columns, suspended heavy slabs' },
        M30: { name: 'M30 heavy concrete', rate: 5300, unit: 'm³', wastage_factor: 1.54, description: 'Precast columns, water tanks' },
        M35: { name: 'M35 industrial floor', rate: 6000, unit: 'm³', wastage_factor: 1.54, description: 'Harvesting floor, high traffic' }
      },
      steel: {
        Fe415: { name: 'Fe415 reinforcing steel', rate: 68, unit: 'kg', wastage_factor: 1.05, description: 'Light farm works, stirrups' },
        Fe500: { name: 'Fe500 TMT bars', rate: 73, unit: 'kg', wastage_factor: 1.05, description: 'Standard high-yield strength rebar' },
        Fe550: { name: 'Fe550 structural rebar', rate: 79, unit: 'kg', wastage_factor: 1.05, description: 'Heavy foundation, deep columns' }
      },
      masonry: {
        brick_class_1: { name: 'Class 1 burnt clay brickwork', rate: 800, unit: 'm²', wastage_factor: 1.10, description: 'Heavy structural load-bearing walls' },
        brick_class_2: { name: 'Class 2 red clay brickwork', rate: 680, unit: 'm²', wastage_factor: 1.10, description: 'Infill compound walls, partitions' },
        block_8in: { name: '8-inch AAC lightweight blockwork', rate: 900, unit: 'm²', wastage_factor: 1.10, description: 'Cattle shed walls, insulated structure' }
      },
      wood: {
        teak_local: { name: 'Local Teak wood joinery', rate: 4200, unit: 'nos', wastage_factor: 1.15, description: 'Premium wooden frameworks' },
        country_wood: { name: 'Country wood support poles', rate: 650, unit: 'nos', wastage_factor: 1.10, description: 'Roof trusses, general support' }
      },
      finish: {
        ceramic_tile: { name: 'Local ceramic tiles', rate: 380, unit: 'm²', wastage_factor: 1.15, description: 'Utility room, dairy washroom flooring' },
        vitrified_tile: { name: 'Vitrified tiles (low absorbing)', rate: 580, unit: 'm²', wastage_factor: 1.15, description: 'Office and home main floor tiles' },
        painting_latex: { name: 'Exterior water-safe emulsion', rate: 75, unit: 'm²', wastage_factor: 1.15, description: 'Fungus-free agricultural storage walls' },
        plaster_12mm: { name: '12mm cement plastering 1:4', rate: 190, unit: 'm²', wastage_factor: 1.15, description: 'Smooth wall finishing' }
      },
      excavation: {
        soft_soil: { name: 'Soft agricultural topsoil digging', rate: 160, unit: 'm³', wastage_factor: 1.0, description: 'Farm ponds, leveling, light footing' },
        hard_soil: { name: 'Hard gravel/soil digging base', rate: 290, unit: 'm³', wastage_factor: 1.0, description: 'Ditch, standard column footing pit' },
        rock: { name: 'Crystalline hard rock blasting/break', rate: 820, unit: 'm³', wastage_factor: 1.05, description: 'Underground tank, rock strata foundation' }
      },
      plumbing: {
        pvc_drainage: { name: 'PVC water flow plumbing', rate: 120, unit: 'm', wastage_factor: 1.10, description: 'Irrigation drain conduit and mainpipes' },
        cattle_trough: { name: 'Fitted auto-fill drinking system', rate: 1200, unit: 'nos', wastage_factor: 1.05, description: 'Pre-assembled steel trough fittings' }
      },
      electrical: {
        pumpset_switch: { name: '3-Phase agricultural starter box', rate: 4500, unit: 'nos', wastage_factor: 1.0, description: 'Submersible pump controller panel board' },
        conduit_run: { name: 'Heavy-duty conduit pipe wiring', rate: 180, unit: 'm', wastage_factor: 1.10, description: 'Water-tight power distribution wiring' }
      },
      other: {
        fence_posts: { name: 'Stone fencing poles 6ft', rate: 450, unit: 'nos', wastage_factor: 1.0, description: 'Granite perimeter posts' },
        wire_mesh: { name: 'Barbed fencing wire mesh', rate: 85, unit: 'm²', wastage_factor: 1.10, description: 'Boundary, goat/poultry safety mesh' }
      }
    }
  },
  tamil_nadu_chennai_2026: {
    region_id: 'tamil_nadu_chennai_2026',
    region_name: 'Chennai & Urban District (Public Standard)',
    rates: {
      concrete: {
        M20: { name: 'M20 structural concrete', rate: 4600, unit: 'm³', wastage_factor: 1.54, description: 'Subgrade concrete, pathways' },
        M25: { name: 'M25 RCC concrete', rate: 5200, unit: 'm³', wastage_factor: 1.54, description: 'Urban standard beams & columns' },
        M30: { name: 'M30 heavy concrete', rate: 5800, unit: 'm³', wastage_factor: 1.54, description: 'Structural high-rise core foundation' },
        M35: { name: 'M35 industrial floor', rate: 6500, unit: 'm³', wastage_factor: 1.54, description: 'Heavy basement floor, precast blocks' }
      },
      steel: {
        Fe415: { name: 'Fe415 reinforcing steel', rate: 72, unit: 'kg', wastage_factor: 1.05, description: 'Light steel wire rebar' },
        Fe500: { name: 'Fe500 TMT bars', rate: 78, unit: 'kg', wastage_factor: 1.05, description: 'Standard high-yield strength rebar, IS compliant' },
        Fe550: { name: 'Fe550 structural rebar', rate: 85, unit: 'kg', wastage_factor: 1.05, description: 'Vibration resistant pillars' }
      },
      masonry: {
        brick_class_1: { name: 'Class 1 clay brickwork', rate: 850, unit: 'm²', wastage_factor: 1.10, description: 'Classic red brick wall build' },
        brick_class_2: { name: 'Class 2 clay brickwork', rate: 720, unit: 'm²', wastage_factor: 1.10, description: 'Non-load bearing partitions' },
        block_8in: { name: '8-inch AAC lightweight blockwork_chennai', rate: 950, unit: 'm²', wastage_factor: 1.10, description: 'High-thermal insulation walls' }
      },
      wood: {
        teak_local: { name: 'Teak wood joinery doors', rate: 4800, unit: 'nos', wastage_factor: 1.15, description: 'Standard decorative door frames' },
        country_wood: { name: 'Country wood structural framing', rate: 800, unit: 'nos', wastage_factor: 1.10, description: 'Rafters and beams' }
      },
      finish: {
        ceramic_tile: { name: 'Ceramic matte floor tiles', rate: 450, unit: 'm²', wastage_factor: 1.15, description: 'Bathroom or wet area flooring' },
        vitrified_tile: { name: 'Double charge vitrified tiles', rate: 650, unit: 'm²', wastage_factor: 1.15, description: 'Living area high polish' },
        painting_latex: { name: 'Anti-bacterial latex emulsion', rate: 85, unit: 'm²', wastage_factor: 1.15, description: 'Moisture proof finish' },
        plaster_12mm: { name: '12mm fine sand cement plastering', rate: 220, unit: 'm²', wastage_factor: 1.15, description: 'Ultra-flat walls' }
      },
      excavation: {
        soft_soil: { name: 'Soft loam soil digging', rate: 180, unit: 'm³', wastage_factor: 1.0, description: 'Light trenching' },
        hard_soil: { name: 'Hard clay soil digging base', rate: 320, unit: 'm³', wastage_factor: 1.0, description: 'Foundations and footings' },
        rock: { name: 'Hard rock manual hammer/jack break', rate: 850, unit: 'm³', wastage_factor: 1.05, description: 'Soil depth excavation' }
      },
      plumbing: {
        pvc_drainage: { name: 'Standard PVC wastewater piping', rate: 150, unit: 'm', wastage_factor: 1.10, description: 'Standard plumbing fittings' },
        cattle_trough: { name: 'Stainless steel water trough fittings', rate: 1500, unit: 'nos', wastage_factor: 1.05, description: 'Urban premium model' }
      },
      electrical: {
        pumpset_switch: { name: 'Digital motor controller', rate: 5200, unit: 'nos', wastage_factor: 1.0, description: 'Main power regulator boxes' },
        conduit_run: { name: 'Fire-resistant conduit system', rate: 210, unit: 'm', wastage_factor: 1.10, description: 'FR residential wires' }
      },
      other: {
        fence_posts: { name: 'Precast concrete fence posts', rate: 550, unit: 'nos', wastage_factor: 1.0, description: 'Perimeter concrete studs' },
        wire_mesh: { name: 'Galvanized chainlink steel mesh', rate: 110, unit: 'm²', wastage_factor: 1.10, description: 'High durable zoning mesh' }
      }
    }
  },
  tamil_nadu_rural_2026: {
    region_id: 'tamil_nadu_rural_2026',
    region_name: 'Rural Village / Farming District (Paddy Field Specs)',
    rates: {
      concrete: {
        M20: { name: 'Local mix M20 structural concrete', rate: 3900, unit: 'm³', wastage_factor: 1.54, description: 'Farm storage house pad, canal beds' },
        M25: { name: 'Local mix M25 structural concrete', rate: 4400, unit: 'm³', wastage_factor: 1.54, description: 'Pump room slab and heavy load posts' },
        M30: { name: 'Local mix M30 heavy concrete', rate: 5000, unit: 'm³', wastage_factor: 1.54, description: 'Irrigation well retainer walls' },
        M35: { name: 'Local mix M35 ultra-dense concrete', rate: 5800, unit: 'm³', wastage_factor: 1.54, description: 'Tractor parking shed pads' }
      },
      steel: {
        Fe415: { name: 'Fe415 agricultural rebar steel', rate: 65, unit: 'kg', wastage_factor: 1.05, description: 'Irrigation gate frames' },
        Fe500: { name: 'Fe500 high ductile TMT bars', rate: 70, unit: 'kg', wastage_factor: 1.05, description: 'Standard shed post reinforcement' },
        Fe550: { name: 'Fe550 heavy duty rebar', rate: 76, unit: 'kg', wastage_factor: 1.05, description: 'Water tank deep mesh' }
      },
      masonry: {
        brick_class_1: { name: 'Burnt local silt class-1 bricks', rate: 740, unit: 'm²', wastage_factor: 1.10, description: 'Local storage silos, stable outer walls' },
        brick_class_2: { name: 'Burnt local silt class-2 bricks', rate: 620, unit: 'm²', wastage_factor: 1.10, description: 'Goat pens, compost yards' },
        block_8in: { name: 'Fly ash hollow concrete blockwork', rate: 820, unit: 'm²', wastage_factor: 1.10, description: 'Ventilated storage partitions' }
      },
      wood: {
        teak_local: { name: 'Local neem / country wood frames', rate: 2500, unit: 'nos', wastage_factor: 1.15, description: 'Budget ventilation frames' },
        country_wood: { name: 'Eucalyptus holding poles 10ft', rate: 450, unit: 'nos', wastage_factor: 1.10, description: 'Temporary farm supports, roof frames' }
      },
      finish: {
        ceramic_tile: { name: 'Simple glazed clay tile work', rate: 320, unit: 'm²', wastage_factor: 1.15, description: 'Basic milk room floor' },
        vitrified_tile: { name: 'Basic vitrified floor tiles', rate: 500, unit: 'm²', wastage_factor: 1.15, description: 'Shed office flooring' },
        painting_latex: { name: 'White lime-wash (Chunam)', rate: 30, unit: 'm²', wastage_factor: 1.15, description: 'Traditional hygienic white base coatings' },
        plaster_12mm: { name: '12mm cement rough plastering', rate: 160, unit: 'm²', wastage_factor: 1.15, description: 'Raw farm plastering structure' }
      },
      excavation: {
        soft_soil: { name: 'Dry soil farm digging excavation', rate: 130, unit: 'm³', wastage_factor: 1.0, description: 'Canal run, pond wall piling' },
        hard_soil: { name: 'Silt layer digging excavation', rate: 240, unit: 'm³', wastage_factor: 1.0, description: 'Footings and silo wells' },
        rock: { name: 'Boulder clearance excavation', rate: 780, unit: 'm³', wastage_factor: 1.05, description: 'Deep digging' }
      },
      plumbing: {
        pvc_drainage: { name: 'Fitted PVC water conduit 4-inch', rate: 95, unit: 'm', wastage_factor: 1.10, description: 'Subsurface irrigation channels' },
        cattle_trough: { name: 'Masonry drinking trough built in-situ', rate: 800, unit: 'nos', wastage_factor: 1.05, description: 'Hand-plastered cement drinking water trough' }
      },
      electrical: {
        pumpset_switch: { name: 'Manual star-delta pumpset switchbox', rate: 3200, unit: 'nos', wastage_factor: 1.0, description: 'Agricultural single/three-phase pump starter switch' },
        conduit_run: { name: 'Overground heavy-weather PVC wires', rate: 140, unit: 'm', wastage_factor: 1.10, description: 'Shed lighting runs' }
      },
      other: {
        fence_posts: { name: 'Rough cut cement boundary posts', rate: 380, unit: 'nos', wastage_factor: 1.0, description: 'Post fencing borders' },
        wire_mesh: { name: 'General farm mesh standard wire', rate: 70, unit: 'm²', wastage_factor: 1.10, description: 'Coarse wire meshes' }
      }
    }
  }
};

export function lookupAndCalculateRate(
  category: ElementCategory,
  typeText: string,
  quantityValue: number,
  regionId: string = 'tamil_nadu_erode_2026',
  contractorMarginFraction: number = 0.05
): {
  unitRate: number;
  rateItemName: string;
  wastageFactor: number;
  totalCost: number;
} {
  const regionData = REGIONAL_RATES_DATABASE[regionId] || REGIONAL_RATES_DATABASE.tamil_nadu_erode_2026;
  const categoryRates = regionData.rates[category] || regionData.rates.other;

  // Let's perform a match between typeText and the keys in categoryRates (eg: "M25", "M20", "Fe500", "brick_class_1")
  let rateKey = Object.keys(categoryRates)[0]; // Fallback to first available in category
  const lowerType = typeText.toLowerCase();

  for (const key of Object.keys(categoryRates)) {
    if (lowerType.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerType)) {
      rateKey = key;
      break;
    }
  }

  // Double check search keywords inside descriptions
  if (!rateKey) {
    for (const key of Object.keys(categoryRates)) {
      const rateItem = categoryRates[key];
      if (lowerType.includes(rateItem.name.toLowerCase()) || rateItem.description.toLowerCase().includes(lowerType)) {
        rateKey = key;
        break;
      }
    }
  }

  const rateItem = categoryRates[rateKey];
  const unitRate = rateItem.rate;
  const wastageFactor = rateItem.wastage_factor;

  // Cost formula: Quantity * base_rate * wastage_factor * (1 + margin)
  const baseCost = quantityValue * unitRate * wastageFactor;
  const totalCost = Math.round(baseCost * (1 + contractorMarginFraction));

  return {
    unitRate,
    rateItemName: rateItem.name,
    wastageFactor,
    totalCost
  };
}
