export type ElementCategory = 'concrete' | 'steel' | 'masonry' | 'wood' | 'finish' | 'excavation' | 'plumbing' | 'electrical' | 'other';
export type ElementUnit = 'm3' | 'm2' | 'm' | 'kg' | 'nos' | 'lumpsum';

export interface ElementDimensions {
  length_m?: number | null;
  width_m?: number | null;
  height_m?: number | null;
  diameter_mm?: number | null;
  thickness_mm?: number | null;
}

export interface ElementQuantity {
  value: number;
  unit: ElementUnit;
}

export interface BOQElement {
  element_id: string;
  category: ElementCategory;
  type: string;
  description: string;
  location: string;
  dimensions: ElementDimensions;
  quantity: ElementQuantity;
  calculation_notes: string;
  is_code_reference: string;
  confidence: number;
  verification_required: boolean;
  warnings: string[];
  unit_rate?: number; // Calculated dynamically or overridden
  total_cost?: number; // Calculated dynamically
}

export interface ProjectInfo {
  drawing_title: string;
  drawing_number: string;
  scale: string;
  sheet_number: string;
  date: string;
  confidence: number;
}

export interface ProjectSummary {
  total_elements: number;
  elements_by_category: Record<string, number>;
  high_confidence_count: number;
  review_needed_count: number;
  overall_confidence: number;
}

export interface BOQResponse {
  project_info: ProjectInfo;
  elements: BOQElement[];
  summary: ProjectSummary;
}

export interface RateItem {
  name: string;
  rate: number;
  unit: string;
  wastage_factor: number;
  description: string;
}

export interface RegionalRates {
  region_id: string;
  region_name: string;
  rates: Record<ElementCategory, Record<string, RateItem>>;
}
