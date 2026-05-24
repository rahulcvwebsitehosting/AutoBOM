// This service calls our secure backend, NOT Google directly
export async function extractBOQ(
  imageBase64?: string,
  mimeType: string = 'image/png',
  regionId?: string,
  presetId?: string,
  customPromptInput?: string,
  apiKey?: string
) {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-key': apiKey } : {})
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      regionId,
      presetId,
      customPromptInput,
      apiKey
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract BOQ');
  }

  return response.json();
}
