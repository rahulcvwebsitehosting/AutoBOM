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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight options request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Accepts POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Missing imageBase64 data" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "GEMINI_API_KEY environment variable is not configured on the server." });
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

    const systemPrompt = `You are AutoBOM Extractor v1.0, a specialized civil engineering quantity surveyor AI.
Analyze the attached construction drawing and extract structured Bill of Quantities data.

RULES:
1. NEVER hallucinate dimensions. If unclear, mark "[REVIEW_NEEDED]".
2. ALWAYS respect drawing scale. Convert to real-world units.
3. NEVER consolidate similar items — list each element separately with unique IDs.
4. For concrete: calculate volume (L×W×H) in m³.
5. For steel: count bars from schedules OR estimate from sections.
6. For masonry: calculate area in m² (wall length × height, minus openings).
7. ALWAYS output strict JSON matching the schema below.
8. Flag any element where confidence < 80% with "verification_required": true.

OUTPUT SCHEMA:
{
  "project_info": { "drawing_title": "", "drawing_number": "", "scale": "", "sheet_number": "", "date": "", "confidence": 0 },
  "elements": [
    {
      "element_id": "", "category": "concrete|steel|masonry|wood|finish|excavation|plumbing|electrical|other",
      "type": "", "description": "", "location": "",
      "dimensions": { "length_m": 0, "width_m": 0, "height_m": 0, "diameter_mm": 0, "thickness_mm": 0 },
      "quantity": { "value": 0, "unit": "m3|m2|m|kg|nos|lumpsum" },
      "calculation_notes": "", "is_code_reference": "", "confidence": 0,
      "verification_required": false, "warnings": []
    }
  ],
  "summary": { "total_elements": 0, "elements_by_category": {}, "high_confidence_count": 0, "review_needed_count": 0, "overall_confidence": 0 }
}
`;

    // Initialize the official Google Generative AI SDK mapping to gemini-1.5-pro
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: systemPrompt,
    });

    // Invoke Gemini 1.5 Pro as requested
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            imagePart,
            { text: "Please extract structured Bill of Materials from the provided engineering layout." }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const rawResult = response.text() ? response.text().trim() : "{}";
    const parsedData = JSON.parse(rawResult);

    return res.status(200).json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error("Vercel Proxy Serverless Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An internal error occurred during blueprint parsing extraction"
    });
  }
}
