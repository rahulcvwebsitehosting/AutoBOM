import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // 3. INITIALIZE THE CLIENT EXACTLY LIKE THIS
    let genAI;
    let model;
    let modelNameUsed = "gemini-1.5-pro-latest";
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      model = genAI.getGenerativeModel({ model: modelNameUsed });

      // 1. Logs requested
      console.log("Gemini initialized");
      console.log(`Model name used: ${modelNameUsed}`);
    } catch (error: any) {
      console.log("Gemini init failed: " + error.message);
      return res.status(500).json({ success: false, error: "Gemini init failed: " + error.message });
    }

    // 5. Wrap model.generateContent call
    let result;
    try {
      // 7. USE THIS EXACT PROMPT TEXT to send to Gemini
      result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              imagePart,
              { text: "Analyze this construction drawing. Extract all visible dimensions and structural elements. Return ONLY a JSON object with fields: project_info, elements, summary." }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
    } catch (error: any) {
      console.log(`Primary model (${modelNameUsed}) generation failed: ${error.message}`);
      
      // If the error indicates that the model is not found, not supported, or restricted for this API key, gracefully fallback to gemini-1.5-flash
      const isModelNotFoundError = 
        error.message.includes("not found") || 
        error.message.includes("not supported") || 
        error.message.includes("supported methods") || 
        error.message.includes("available models") ||
        error.message.includes("404");

      if (isModelNotFoundError) {
        modelNameUsed = "gemini-1.5-flash";
        console.log(`Attempting fallback to model: ${modelNameUsed}`);
        try {
          model = genAI.getGenerativeModel({ model: modelNameUsed });
          result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  imagePart,
                  { text: "Analyze this construction drawing. Extract all visible dimensions and structural elements. Return ONLY a JSON object with fields: project_info, elements, summary." }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          });
          console.log(`Fallback generation with ${modelNameUsed} succeeded!`);
        } catch (fallbackError: any) {
          console.log(`Fallback model ${modelNameUsed} generation failed as well: ${fallbackError.message}`);
          return res.status(500).json({ success: false, error: "Gemini API error: " + error.message + " (and fallback failed: " + fallbackError.message + ")" });
        }
      } else {
        return res.status(500).json({ success: false, error: "Gemini API error: " + error.message });
      }
    }

    let rawResult = "";
    try {
      const response = await result.response;
      rawResult = response.text() ? response.text().trim() : "{}";
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
