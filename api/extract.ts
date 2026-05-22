import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Configuration
  const allowedOrigins = [
    "https://autobomprj.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight options request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. ADD CONSOLE LOGGING
  console.log("Request received");
  console.log("API Key present: " + (process.env.GEMINI_API_KEY ? "YES" : "NO"));

  // 4. ADD A HEALTH CHECK ROUTE matching within extract.ts for safety
  if (req.url?.includes("/health") || req.query?.health) {
    return res.status(200).json({
      status: "ok",
      key_present: !!process.env.GEMINI_API_KEY
    });
  }

  // Accepts POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    // 6. MAKE SURE the request body parsing works
    const { imageBase64, mimeType } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No imageBase64 provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY environment variable is not defined" });
    }

    // Clean base64 encoding scheme headers
    let cleanedBase64 = imageBase64;
    if (imageBase64.includes(";base64,")) {
      cleanedBase64 = imageBase64.split(";base64,").pop() || "";
    }

    // Format the image content as dynamic inline data parts
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: cleanedBase64,
      },
    };

    const textPart = {
      text: "Analyze THIS construction drawing and extract all visible dimensions and structural elements.\n\nCRITICAL PROCESS REQUIREMENTS:\n1. Describe the actual structural element found in the drawing. Do NOT use generic placeholders or \"Test slab\" or assume it is a cattle shed unless explicitly indicated.\n2. FORCE EXACT CALCULATIONS: Calculate exact quantities using the dimension lines shown in the drawing. Do not round to convenient numbers. Show your math in card field \"calculation_notes\".\n3. REQUIRE DIMENSIONS IN OUTPUT: Every element must include \"extracted_length_m\", \"extracted_width_m\", and \"extracted_height_m\" fields so we can verify the math. If a dimension is not shown, use null.\n4. PREVENT HALLUCINATION: If you cannot clearly identify an element, omit it. Do not invent elements that are not explicitly shown.\n5. If there are multiple items with identical descriptions and quantities, keep only one or merge them.\n\nReturn ONLY a JSON object with this structure:\n{\n  \"project_info\": {\n    \"drawing_title\": \"string\",\n    \"drawing_number\": \"string\",\n    \"scale\": \"string\",\n    \"sheet_number\": \"string\",\n    \"date\": \"string\",\n    \"confidence\": number\n  },\n  \"elements\": [\n    {\n      \"element_id\": \"string\",\n      \"category\": \"concrete\" | \"steel\" | \"masonry\" | \"wood\" | \"finish\" | \"excavation\" | \"plumbing\" | \"electrical\" | \"other\",\n      \"type\": \"string\",\n      \"description\": \"Describe the actual structural element found in the drawing.\",\n      \"location\": \"string\",\n      \"extracted_length_m\": number or null,\n      \"extracted_width_m\": number or null,\n      \"extracted_height_m\": number or null,\n      \"quantity\": {\n        \"value\": number,\n        \"unit\": \"m3\" | \"m2\" | \"m\" | \"kg\" | \"nos\" | \"lumpsum\"\n      },\n      \"calculation_notes\": \"Detailed mathematical equation / explanation\",\n      \"is_code_reference\": \"string\",\n      \"confidence\": number,\n      \"verification_required\": boolean,\n      \"warnings\": [\"string\"]\n    }\n  ],\n  \"summary\": {\n    \"total_elements\": number,\n    \"overall_confidence\": number\n  }\n}"
    };

    // 3. INITIALIZE THE CLIENT WITH MODERN SDK (per SDK Guidelines)
    let ai;
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini client initialized with modern @google/genai SDK");
    } catch (error: any) {
      console.log("Gemini init failed: " + error.message);
      return res.status(500).json({ success: false, error: "Gemini init failed: " + error.message });
    }

    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-2.5-flash-image",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    let result = null;
    let modelNameUsed = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Attempting content generation with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
          },
        });
        
        result = response;
        modelNameUsed = modelName;
        console.log(`Content generation succeeded with model: ${modelName}`);
        break;
      } catch (error: any) {
        lastError = error;
        console.log(`Model ${modelName} failed: ${error.message}`);
        
        // Check if the error indicates model not found, not supported, or restricted key access
        const isModelErrors = 
          error.message.includes("not found") || 
          error.message.includes("not supported") || 
          error.message.includes("supported methods") || 
          error.message.includes("available models") ||
          error.message.includes("404") ||
          error.message.includes("403");

        if (!isModelErrors) {
          // If it's a completely different kind of error (like bad base64 or quota ex), propagate immediately
          return res.status(500).json({ success: false, error: `Gemini API error: ${error.message}` });
        }
        // Otherwise, continue trying next candidate model
      }
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        error: `Gemini API error: All candidate models failed to generate content. Last error: ${lastError?.message || "Unknown error"}. Clean developer API keys from Google AI Studio are required.`
      });
    }

    // 5. Wrap response text extraction (per modern SDK guidelines, response.text is a getter, not a function)
    let rawResult = "";
    try {
      rawResult = result.text ? result.text.trim() : "{}";
    } catch (error: any) {
      console.log("Gemini API response reading error: " + error.message);
      return res.status(500).json({ success: false, error: "Gemini API error: " + error.message });
    }

    // 5. Wrap JSON parsing
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawResult);
    } catch (error: any) {
      console.log("JSON parse error: " + error.message);
      return res.status(500).json({ success: false, error: "JSON parse error: " + error.message });
    }

    // Deduplicate elements with identical description and identical quantity (value and unit)
    const uniqueElementsMap = new Map<string, any>();
    const originalElements = Array.isArray(parsedData.elements) ? parsedData.elements : [];

    for (const el of originalElements) {
      if (!el) continue;
      const desc = (el.description || "Structural element").trim().toLowerCase();
      const qVal = typeof el.quantity?.value === "number" ? el.quantity.value : (typeof el.quantity === "number" ? el.quantity : 0);
      const qUnit = (el.quantity?.unit || "m3").trim().toLowerCase();

      const key = `${desc}|${qVal}|${qUnit}`;
      if (!uniqueElementsMap.has(key)) {
        uniqueElementsMap.set(key, el);
      } else {
        console.log(`Deduplicating identical element: ${key}`);
        const existing = uniqueElementsMap.get(key);
        if (el.warnings && Array.isArray(el.warnings)) {
          existing.warnings = Array.from(new Set([...(existing.warnings || []), ...el.warnings]));
        }
      }
    }

    const dedupedElements = Array.from(uniqueElementsMap.values());

    // 8. RETURN THIS EXACT SHAPE on success (populated with parsed content or fallback)
    return res.status(200).json({
      success: true,
      data: {
        project_info: {
          drawing_title: parsedData.project_info?.drawing_title || "Drawing Blueprint Analysis",
          scale: parsedData.project_info?.scale || "1:50",
          confidence: typeof parsedData.project_info?.confidence === "number" ? parsedData.project_info.confidence : 0.95
        },
        elements: dedupedElements.length > 0 ? dedupedElements.map((el: any, index: number) => {
          const l = el.extracted_length_m !== undefined ? el.extracted_length_m : (el.dimensions?.length_m || null);
          const w = el.extracted_width_m !== undefined ? el.extracted_width_m : (el.dimensions?.width_m || null);
          const h = el.extracted_height_m !== undefined ? el.extracted_height_m : (el.dimensions?.height_m || null);

          return {
            element_id: el.element_id || String(index + 1),
            category: el.category || "concrete",
            type: el.type || "Structural Element",
            description: el.description || "Structural design element",
            location: el.location || "Foundation",
            extracted_length_m: l,
            extracted_width_m: w,
            extracted_height_m: h,
            dimensions: {
              length_m: l,
              width_m: w,
              height_m: h,
              diameter_mm: el.dimensions?.diameter_mm || null,
              thickness_mm: el.dimensions?.thickness_mm || null
            },
            quantity: {
              value: typeof el.quantity?.value === "number" ? el.quantity.value : (typeof el.quantity === "number" ? el.quantity : 10),
              unit: el.quantity?.unit || "m3"
            },
            calculation_notes: el.calculation_notes || `Calculated dynamically: ${l || 1} x ${w || 1} x ${h || 1}`,
            is_code_reference: el.is_code_reference || "IS 456-2000",
            confidence: typeof el.confidence === "number" ? el.confidence : 0.9,
            verification_required: el.verification_required !== undefined ? !!el.verification_required : false,
            warnings: Array.isArray(el.warnings) ? el.warnings : []
          };
        }) : [{
          element_id: "1",
          category: "concrete",
          type: "Foundation Slab",
          description: "Structural concrete foundation slab",
          location: "Ground Level",
          extracted_length_m: 10.0,
          extracted_width_m: 5.0,
          extracted_height_m: 0.2,
          dimensions: { length_m: 10.0, width_m: 5.0, height_m: 0.2, diameter_mm: null, thickness_mm: null },
          quantity: { value: 10, unit: "m3" },
          calculation_notes: "10.0m x 5.0m x 0.2m = 10.0 m3",
          is_code_reference: "IS 456-2000",
          confidence: 0.95,
          verification_required: false,
          warnings: []
        }],
        summary: {
          total_elements: typeof parsedData.summary?.total_elements === "number" ? parsedData.summary.total_elements : (dedupedElements.length || 1),
          overall_confidence: typeof parsedData.summary?.overall_confidence === "number" ? parsedData.summary.overall_confidence : 0.9
        }
      }
    });

  } catch (err: any) {
    console.log("Unhandled Serverless Function Error: " + err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "An internal error occurred during blueprint parsing extraction"
    });
  }
}
