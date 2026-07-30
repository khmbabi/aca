/**
 * translationService.ts
 * All translation calls go through /api/ai proxy — key never in browser.
 */

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || targetLanguage.toLowerCase() === 'english') return text;
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'translate',
        data: { text, targetLanguage },
      }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.text || text;
  } catch {
    return text;
  }
};
