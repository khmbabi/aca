/**
 * aiService.ts
 * All Gemini calls go through /api/ai server proxy.
 * API key is NEVER in the browser bundle.
 */

const AI_PROXY = '/api/ai';

async function callProxy(type: string, data?: any, extra?: any): Promise<string> {
  const res = await fetch(AI_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI request failed (${res.status})`);
  }
  const result = await res.json();
  return result.text || '';
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || targetLanguage.toLowerCase() === 'english') return text;
  try { return await callProxy('translate', { text, targetLanguage }); }
  catch { return text; }
};

export const analyzeCropDisease = async (
  imageBase64: string,
  mode: 'instant' | 'thinking' = 'instant',
  symptoms?: string
): Promise<string | null> => {
  return callProxy('analyzeCropDisease', imageBase64, { mode, symptoms });
};

export const getCropRecommendation = async (
  soilData: any,
  mode: 'instant' | 'thinking' = 'instant'
): Promise<string | null> => {
  return callProxy('getCropRecommendation', soilData, { mode });
};

export const getAnimalRecommendation = async (
  farmData: any,
  mode: 'instant' | 'thinking' = 'instant'
): Promise<string | null> => {
  return callProxy('getAnimalRecommendation', farmData, { mode });
};

export const generateCropImage = async (_cropName: string): Promise<string | null> => null;
