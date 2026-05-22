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
  app.post("/api/extract-bom", async (req, res) => {
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

        const userPrompt = `Analyze the attached construction drawing and extract all quantifiable building elements.

CONTEXT:
- The project location is inside Tamil Nadu — use Indian Standard units (metric: meters, m3, m2, kg).
- Custom design request details or area note: ${customPromptInput || "Identify all foundation pads, columns, concrete paths, masonry work, floor finishes, rebar reinforcement and excavation volumes."}

OUTPUT SCHEMA: Must produce strict JSON adhering to:
{
  "project_info": {
    "drawing_title": "string",
    "drawing_number": "string",
    "scale": "string (or 'Assuming 1:100')",
    "sheet_number": "string",
    "date": "string",
    "confidence": 0.0 to 1.0
  },
  "elements": [
    {
      "element_id": "string",
      "category": "concrete | steel | masonry | wood | finish | excavation | plumbing | electrical | other",
      "type": "M20 | M25 | Fe500 | brick_class_1 | soft_soil | country_wood | vitrified_tile | etc.",
      "description": "Short human readable layout description",
      "location": "e.g., Bottom slab, column C1, external yard",
      "dimensions": {
        "length_m": number or null,
        "width_m": number or null,
        "height_m": number or null,
        "diameter_mm": number or null,
        "thickness_mm": number or null
      },
      "quantity": {
        "value": number,
        "unit": "m3 | m2 | m | kg | nos | lumpsum"
      },
      "calculation_notes": "e.g., 10.0m * 5.0m * 0.15m",
      "is_code_reference": "IS Code matching description",
      "confidence": 0.0 to 1.0,
      "verification_required": boolean,
      "warnings": ["string warning messages"]
    }
  ],
  "summary": {
    "total_elements": number,
    "high_confidence_count": number,
    "review_needed_count": number,
    "overall_confidence": 0.0 to 1.0
  }
}

OUTPUT TEXT MUST BE STRICT JSON ONLY, COMPRESSED ON A SINGLE LINE, AND CONCEALED FROM FORMATTING MARKDOWN CODES.`;

        const geminiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [imagePart, { text: userPrompt }],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
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
            return {
              ...el,
              unit_rate: pricing.unitRate,
              total_cost: pricing.totalCost
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
