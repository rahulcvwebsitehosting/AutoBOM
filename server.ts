import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload size limits generous enough to upload high-res blueprints
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ limit: '35mb', extended: true }));

  // API Route: Return all available regional base rates
  app.get("/api/rates", async (req, res) => {
    try {
      const { REGIONAL_RATES_DATABASE } = await import("./src/ratesData.js");
      res.json({ success: true, database: REGIONAL_RATES_DATABASE });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Core AI model extraction interface
  app.post(["/api/extract", "/api/extract-bom"], async (req, res) => {
    try {
      const { imageBase64, mimeType, regionId, presetId, customPromptInput } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const activeRegionId = regionId || "tamil_nadu_erode_2026";

      // If user runs a real upload with a valid Gemini key
      if (apiKey && imageBase64) {
        console.log("Analyzing uploaded drawing with Gemini 3.5 Flash...");
        const { GoogleGenAI, Type } = await import("@google/genai");
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        // Strip data prefix if present inside base64 string
        let cleanedBase64 = imageBase64;
        if (imageBase64.includes(";base64,")) {
          cleanedBase64 = imageBase64.split(";base64,").pop() || "";
        }

        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/png",
            data: cleanedBase64,
          },
        };

        const systemInstruction = `You are AutoBOM Extractor v1.0, a specialized civil engineering quantity surveyor AI. 
Your job is to analyze construction drawings, civil diagrams, or engineering structural spreadsheets and extract structured Bill of Quantities (BOQ) data.

RULES:
1. NEVER hallucinate dimensions. If a dimension is unclear, mark it as "[REVIEW_NEEDED]".
2. ALWAYS respect drawing scale. If scale is shown (e.g., 1:100, 1:50, or explicit dimension calls), convert all measurements to real-world units (meters).
3. NEVER consolidate similar items — list each element separately with unique IDs.
4. For concrete elements: Calculate volume (L×W×H) in m³.
5. For steel reinforcement: Count bars from schedules OR estimate from section details. Use kg.
6. For masonry: Calculate area in m² (wall length × height, minus openings).
7. For finishes: Floor = plan area, Wall = perimeter × height minus openings.
8. ALWAYS output in strict JSON format matching the schema below.
9. If drawing contains tables (door/window schedules, rebar schedules), extract them with 100% fidelity — every row, every column.
10. Flag any element where confidence < 80% with "verification_required": true.

IS CODE COMPLIANCE CHECKS:
- Concrete grades: Check if specified grade matches IS 456 (M20, M25, M30, etc.)
- Steel reinforcement grades: Fe415, Fe500, Fe550 per IS 1786
- Brick classes: Class 1, Class 2, Class 3 clay brickwork per IS 1077
- Safety factors and code compliance.

SAFETY AND STRUCTURAL AUDITS:
- If a slab thickness < 100mm for residential structures, flag/add a warning per IS 456.
- If a beam depth appears < 200mm for a span > 4m, flag as 'Potential under-design — verify with structural engineer'.
- Check that foundations look proportional.`;

        const userPrompt = `Analyze the attached construction drawing and extract ALL quantifiable building elements.
CONTEXT:
- Project location: Tamil Nadu, India — use metric units (meters, m3, m2, kg)
- Scale: read from drawing title block. If not visible, assume 1:100.
- Custom note: ${customPromptInput || "Extract foundation pads, columns, RCC slab, masonry walls (deduct openings), floor finishes, steel reinforcement, excavation, PCC bed, doors, and windows."}
MANDATORY EXTRACTION RULES:
1. ALWAYS extract these 8 categories minimum if visible: concrete slab, RCC columns, brick masonry walls, steel reinforcement, excavation, PCC bed, door openings, window openings.
2. For the RCC SLAB: quantity = length_m × width_m × thickness_m (in m³). Use slab thickness from notes (default 120mm = 0.12m if not shown).
3. For BRICK MASONRY WALLS: quantity = (perimeter × wall_height - door_areas - window_areas) × wall_thickness in m³. Wall height default 3.0m if not shown. Wall thickness default 0.23m (230mm) if not shown.
4. For RCC COLUMNS: quantity = column_count × length × width × height in m³. Include number of columns visible on plan. Default column size 300mm × 300mm.
5. For STEEL REINFORCEMENT: estimate in kg. Use 80 kg/m³ for slabs and 120 kg/m³ for columns as default density. Show calculation.
6. For EXCAVATION: volume = footing area × depth. Assume 4 footings of 1.0m × 1.0m × 0.6m if footing sizes not shown.
7. For PCC BED: volume = floor area × 0.075m (75mm bed under slab).
8. For DOORS: quantity in nos. Include width_m and height_m in dimensions.
9. For WINDOWS: quantity in nos. Include width_m and height_m in dimensions.
10. NEVER produce fewer than 7 elements for any recognizable building drawing.
11. Round all dimensions to 2 decimal places. Round quantities to 3 decimal places.
12. Be 100% deterministic — same drawing must always produce identical output.
EXAMPLE correct output for a 8m×5m farm storage with 4 columns, 1 door (1.2m), 1 window (1.5m):
- EL-001 concrete slab: 8.0×5.0×0.12 = 4.800 m³
- EL-002 PCC bed: 8.0×5.0×0.075 = 3.000 m³  
- EL-003 masonry walls: (2×(8.0+5.0)×3.0 - 1.2×2.1 - 1.5×1.2) × 0.23 = (78.0-2.52-1.80)×0.23 = 16.956 m³
- EL-004 RCC columns: 4×0.3×0.3×3.0 = 1.080 m³
- EL-005 steel reinforcement: (4.800×80)+(1.080×120) = 384+129.6 = 513.600 kg
- EL-006 excavation: 4×1.0×1.0×0.6 = 2.400 m³
- EL-007 door D-1: 1 nos (1.2m×2.1m)
- EL-008 window W-1: 1 nos (1.5m×1.2m)
OUTPUT SCHEMA: Strict JSON only, no markdown, single line:
{
  "project_info": { "drawing_title": "string", "drawing_number": "string", "scale": "string", "sheet_number": "string", "date": "string", "confidence": 0.0 },
  "elements": [
    {
      "element_id": "EL-001",
      "category": "concrete | steel | masonry | wood | finish | excavation | plumbing | electrical | other",
      "type": "M25 | M20 | Fe500 | brick_class_1 | soft_soil | etc.",
      "description": "human readable description",
      "location": "e.g. roof slab, corner columns, external wall",
      "dimensions": { "length_m": number_or_null, "width_m": number_or_null, "height_m": number_or_null, "diameter_mm": number_or_null, "thickness_mm": number_or_null },
      "quantity": { "value": number, "unit": "m3 | m2 | m | kg | nos | lumpsum" },
      "calculation_notes": "e.g. 8.0m × 5.0m × 0.12m = 4.800 m³",
      "is_code_reference": "IS 456:2000 / IS 1786:2008 / IS 1077:1992 / IS 1200",
      "confidence": 0.0,
      "verification_required": false,
      "warnings": []
    }
  ],
  "summary": { "total_elements": 8, "high_confidence_count": 7, "review_needed_count": 1, "overall_confidence": 0.9 }
}`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [imagePart, { text: userPrompt }],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0,
            seed: 42,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                project_info: {
                  type: Type.OBJECT,
                  properties: {
                    drawing_title: { type: Type.STRING },
                    drawing_number: { type: Type.STRING },
                    scale: { type: Type.STRING },
                    sheet_number: { type: Type.STRING },
                    date: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ["drawing_title", "drawing_number", "scale", "sheet_number", "date", "confidence"]
                },
                elements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      element_id: { type: Type.STRING },
                      category: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      location: { type: Type.STRING },
                      dimensions: {
                        type: Type.OBJECT,
                        properties: {
                          length_m: { type: Type.NUMBER },
                          width_m: { type: Type.NUMBER },
                          height_m: { type: Type.NUMBER },
                          diameter_mm: { type: Type.NUMBER },
                          thickness_mm: { type: Type.NUMBER }
                        }
                      },
                      quantity: {
                        type: Type.OBJECT,
                        properties: {
                          value: { type: Type.NUMBER },
                          unit: { type: Type.STRING }
                        },
                        required: ["value", "unit"]
                      },
                      calculation_notes: { type: Type.STRING },
                      is_code_reference: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      verification_required: { type: Type.BOOLEAN },
                      warnings: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["element_id", "category", "type", "description", "location", "quantity", "calculation_notes", "confidence", "verification_required"]
                  }
                },
                summary: {
                  type: Type.OBJECT,
                  properties: {
                    total_elements: { type: Type.NUMBER },
                    high_confidence_count: { type: Type.NUMBER },
                    review_needed_count: { type: Type.NUMBER },
                    overall_confidence: { type: Type.NUMBER }
                  },
                  required: ["total_elements", "overall_confidence"]
                }
              },
              required: ["project_info", "elements", "summary"]
            }
          }
        });

        const rawJsonText = geminiResponse.text?.trim() || "{}";
        const parsedResult = JSON.parse(rawJsonText);

        // Fill with Tamil Nadu rate configurations and math
        const { lookupAndCalculateRate } = await import("./src/ratesData.js");
        if (parsedResult.elements && Array.isArray(parsedResult.elements)) {
          parsedResult.elements = parsedResult.elements.map((el: any) => {
            const pricing = lookupAndCalculateRate(
              el.category,
              el.type || el.description,
              el.quantity?.value || 0,
              activeRegionId
            );
            // Keep AI-extracted quantity but apply deterministic local rate
            const unitRate = pricing.unitRate;
            const totalCost = Math.round((el.quantity?.value || 0) * unitRate);
            return {
              ...el,
              unit_rate: unitRate,
              total_cost: totalCost
            };
          });
        }

        return res.json({ success: true, isSimulated: false, data: parsedResult });
      }

      // FALLBACK CODES: If apiKey is not valid OR preset is forced
      const { PRESET_DRAWINGS } = await import("./src/presets.js");
      const activePresetId = presetId || "cattle_shed_erode";
      const preset = PRESET_DRAWINGS.find(p => p.id === activePresetId) || PRESET_DRAWINGS[0];

      // Re-map preset elements with local rate variations for selected regionId
      const { lookupAndCalculateRate } = await import("./src/ratesData.js");
      const updatedElements = preset.sampleData.elements.map(el => {
        const pricing = lookupAndCalculateRate(
          el.category,
          el.type || el.description,
          el.quantity.value || 0,
          activeRegionId
        );
        return {
          ...el,
          unit_rate: pricing.unitRate,
          total_cost: pricing.totalCost
        };
      });

      return res.json({
        success: true,
        isSimulated: !apiKey, // true if NO API KEY is stored
        data: {
          ...preset.sampleData,
          project_info: {
            ...preset.sampleData.project_info,
            drawing_title: preset.sampleData.project_info.drawing_title + (customPromptInput ? " [Filtered]" : "")
          },
          elements: updatedElements
        }
      });

    } catch (err: any) {
      console.error("Critical extraction error:", err);
      res.status(500).json({ success: false, error: err.message || "Internal Extraction Failure" });
    }
  });

  // Handle client asset-serving based on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoBOM custom full-stack server running live on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
