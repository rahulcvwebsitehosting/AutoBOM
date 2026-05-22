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
      text: "Analyze this construction drawing. Extract all visible dimensions and structural elements. Return ONLY a JSON object with fields: project_info, elements, summary."
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

    // 8. RETURN THIS EXACT SHAPE on success (populated with parsed content or fallback)
    return res.status(200).json({
      success: true,
      data: {
        project_info: {
          drawing_title: parsedData.project_info?.drawing_title || "Test",
          scale: parsedData.project_info?.scale || "1:50",
          confidence: typeof parsedData.project_info?.confidence === "number" ? parsedData.project_info.confidence : 0.95
        },
        elements: Array.isArray(parsedData.elements) && parsedData.elements.length > 0 ? parsedData.elements.map((el: any, index: number) => ({
          element_id: el.element_id || String(index + 1),
          category: el.category || "concrete",
          type: el.type || "Slab",
          description: el.description || "Test slab",
          quantity: {
            value: typeof el.quantity?.value === "number" ? el.quantity.value : (typeof el.quantity === "number" ? el.quantity : 10),
            unit: el.quantity?.unit || "m3"
          },
          confidence: typeof el.confidence === "number" ? el.confidence : 0.9
        })) : [{ element_id: "1", category: "concrete", type: "Slab", description: "Test slab", quantity: { value: 10, unit: "m3" }, confidence: 0.9 }],
        summary: {
          total_elements: typeof parsedData.summary?.total_elements === "number" ? parsedData.summary.total_elements : (parsedData.elements?.length || 1),
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
